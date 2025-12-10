import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:nfc_manager/nfc_manager.dart';
import '../services/nfc_api_service.dart';

/// =============================================================================
/// TELA DE CONSULTA DE SALDO E CONSUMO
/// =============================================================================
/// 
/// Permite ao operador ou participante:
/// - Consultar saldo atual da pulseira
/// - Ver extrato de transações
/// - Realizar recarga (se autorizado)

class BalanceScreen extends StatefulWidget {
  final bool canTopUp; // Se pode fazer recarga (operador de caixa)

  const BalanceScreen({
    Key? key,
    this.canTopUp = false,
  }) : super(key: key);

  @override
  State<BalanceScreen> createState() => _BalanceScreenState();
}

class _BalanceScreenState extends State<BalanceScreen> {
  final _api = NfcApiService();

  // Estados
  BalanceState _state = BalanceState.waiting;
  String? _currentUid;
  BalanceInfo? _balanceInfo;
  List<TransactionItem> _transactions = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Recarga
  final _topUpController = TextEditingController();
  bool _showTopUpDialog = false;

  @override
  void initState() {
    super.initState();
    _startNfcSession();
  }

  @override
  void dispose() {
    _stopNfcSession();
    _topUpController.dispose();
    super.dispose();
  }

  Future<void> _startNfcSession() async {
    bool isAvailable = await NfcManager.instance.isAvailable();
    
    if (!isAvailable) {
      setState(() {
        _errorMessage = 'NFC não disponível';
      });
      return;
    }

    NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {
        final nfca = tag.data['nfca'] ?? tag.data['nfcv'] ?? tag.data['nfcf'];
        if (nfca != null && nfca['identifier'] != null) {
          final identifier = nfca['identifier'] as List<int>;
          final uid = identifier
              .map((b) => b.toRadixString(16).padLeft(2, '0').toUpperCase())
              .join('');
          
          await _loadBalance(uid);
        }
      },
    );
  }

  void _stopNfcSession() {
    NfcManager.instance.stopSession();
  }

  /// Carrega saldo e extrato
  Future<void> _loadBalance(String uid) async {
    HapticFeedback.mediumImpact();

    setState(() {
      _currentUid = uid;
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Busca saldo e extrato em paralelo
      final results = await Future.wait([
        _api.getBalance(uid),
        _api.getStatement(uid, limit: 10),
      ]);

      setState(() {
        _balanceInfo = results[0] as BalanceInfo;
        _transactions = results[1] as List<TransactionItem>;
        _isLoading = false;
        _state = BalanceState.showing;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Erro: $e';
        _state = BalanceState.error;
      });
    }
  }

  /// Atualiza dados
  Future<void> _refresh() async {
    if (_currentUid != null) {
      await _loadBalance(_currentUid!);
    }
  }

  /// Realiza recarga
  Future<void> _doTopUp() async {
    final amountText = _topUpController.text.trim();
    if (amountText.isEmpty) return;

    final amount = double.tryParse(amountText.replaceAll(',', '.'));
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Valor inválido'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final amountCents = (amount * 100).round();

    setState(() {
      _isLoading = true;
      _showTopUpDialog = false;
    });

    try {
      final result = await _api.topUp(
        uid: _currentUid!,
        amountCents: amountCents,
        paymentMethod: 'cash', // TODO: permitir selecionar
      );

      if (result.success) {
        // Atualiza saldo
        await _refresh();
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Recarga realizada! Novo saldo: ${result.newBalanceFormatted}'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.error ?? 'Erro na recarga'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
      _topUpController.clear();
    }
  }

  /// Reseta para nova consulta
  void _reset() {
    setState(() {
      _state = BalanceState.waiting;
      _currentUid = null;
      _balanceInfo = null;
      _transactions = [];
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Consulta de Saldo'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          if (_state == BalanceState.showing)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _refresh,
            ),
          if (_state == BalanceState.showing)
            IconButton(
              icon: const Icon(Icons.nfc),
              onPressed: _reset,
              tooltip: 'Ler outra pulseira',
            ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: _buildFab(),
    );
  }

  Widget? _buildFab() {
    if (_state != BalanceState.showing || !widget.canTopUp) return null;

    return FloatingActionButton.extended(
      onPressed: _showTopUpModal,
      backgroundColor: Colors.teal,
      icon: const Icon(Icons.add),
      label: const Text('Recarga'),
    );
  }

  void _showTopUpModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Recarga de Saldo',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Participante: ${_balanceInfo?.attendeeName ?? _currentUid}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _topUpController,
              decoration: const InputDecoration(
                labelText: 'Valor (R\$)',
                prefixText: 'R\$ ',
                border: OutlineInputBorder(),
                hintText: '50,00',
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
            ),
            const SizedBox(height: 16),
            // Valores rápidos
            Wrap(
              spacing: 8,
              children: [20, 50, 100, 200].map((value) {
                return ActionChip(
                  label: Text('R\$ $value'),
                  onPressed: () {
                    _topUpController.text = value.toString();
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _doTopUp();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('CONFIRMAR RECARGA'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    switch (_state) {
      case BalanceState.waiting:
        return _buildWaiting();
      case BalanceState.showing:
        return _buildBalanceView();
      case BalanceState.error:
        return _buildError();
    }
  }

  Widget _buildWaiting() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.nfc,
            size: 120,
            color: Colors.teal.shade200,
          ),
          const SizedBox(height: 32),
          Text(
            'Aproxime a pulseira',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          const Text(
            'para consultar o saldo',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceView() {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Card de saldo
          _buildBalanceCard(),
          const SizedBox(height: 24),
          
          // Histórico
          Text(
            'Últimas Transações',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          
          if (_transactions.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text(
                  'Nenhuma transação ainda',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            )
          else
            ..._transactions.map((t) => _buildTransactionItem(t)),
        ],
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.teal.shade400, Colors.teal.shade700],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.account_balance_wallet, color: Colors.white70),
                const SizedBox(width: 8),
                const Text(
                  'Saldo Disponível',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                // UID
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _currentUid ?? '',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontFamily: 'monospace',
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              _balanceInfo?.balanceFormatted ?? 'R\$ 0,00',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 48,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (_balanceInfo?.attendeeName != null)
              Row(
                children: [
                  const Icon(Icons.person, color: Colors.white70, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    _balanceInfo!.attendeeName!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            if (_balanceInfo?.lastTopupAt != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.access_time, color: Colors.white70, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Última recarga: ${_formatDate(_balanceInfo!.lastTopupAt!)}',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionItem(TransactionItem transaction) {
    final isCredit = transaction.isCredit;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isCredit ? Colors.green.shade50 : Colors.red.shade50,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            isCredit ? Icons.add_circle : Icons.remove_circle,
            color: isCredit ? Colors.green : Colors.red,
          ),
        ),
        title: Text(
          transaction.description ?? _getTypeLabel(transaction.type),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          _formatDate(transaction.createdAt),
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Text(
          transaction.amountFormatted,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: isCredit ? Colors.green : Colors.red,
          ),
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80,
            color: Colors.red.shade300,
          ),
          const SizedBox(height: 24),
          Text(
            _errorMessage ?? 'Erro desconhecido',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _reset,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'topup':
        return 'Recarga';
      case 'purchase':
        return 'Consumo';
      case 'refund':
        return 'Estorno';
      default:
        return type;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')} às ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

/// Estados da tela
enum BalanceState {
  waiting,
  showing,
  error,
}
