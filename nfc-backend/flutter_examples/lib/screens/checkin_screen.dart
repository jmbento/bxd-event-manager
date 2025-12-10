import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:nfc_manager/nfc_manager.dart';
import '../services/nfc_api_service.dart';

/// =============================================================================
/// TELA DE CHECK-IN NO PORTÃO
/// =============================================================================
/// 
/// Tela simples e rápida para leitura de pulseiras nos portões.
/// Mostra feedback visual claro (verde/vermelho) para o operador.

class CheckInScreen extends StatefulWidget {
  final String gateName;

  const CheckInScreen({
    Key? key,
    required this.gateName,
  }) : super(key: key);

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  final _api = NfcApiService();

  // Estados
  CheckInState _state = CheckInState.waiting;
  CheckInResult? _lastResult;
  String? _lastUid;
  int _successCount = 0;
  int _deniedCount = 0;

  @override
  void initState() {
    super.initState();
    _startNfcSession();
  }

  @override
  void dispose() {
    _stopNfcSession();
    super.dispose();
  }

  /// Inicia sessão NFC contínua
  Future<void> _startNfcSession() async {
    bool isAvailable = await NfcManager.instance.isAvailable();
    
    if (!isAvailable) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('NFC não disponível'),
          backgroundColor: Colors.red,
        ),
      );
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
          
          await _processCheckIn(uid);
        }
      },
    );
  }

  void _stopNfcSession() {
    NfcManager.instance.stopSession();
  }

  /// Processa check-in
  Future<void> _processCheckIn(String uid) async {
    // Evita leitura duplicada rápida
    if (_state == CheckInState.processing || uid == _lastUid) {
      return;
    }

    setState(() {
      _state = CheckInState.processing;
      _lastUid = uid;
    });

    // Feedback tátil
    HapticFeedback.mediumImpact();

    try {
      final result = await _api.checkIn(
        uid: uid,
        gate: widget.gateName,
        direction: 'in',
      );

      setState(() {
        _lastResult = result;
        _state = result.allowed ? CheckInState.allowed : CheckInState.denied;
        
        if (result.allowed) {
          _successCount++;
        } else {
          _deniedCount++;
        }
      });

      // Feedback sonoro e tátil
      if (result.allowed) {
        HapticFeedback.heavyImpact();
        // TODO: Tocar som de sucesso
      } else {
        HapticFeedback.vibrate();
        // TODO: Tocar som de erro
      }

      // Voltar ao estado de espera após 2 segundos
      await Future.delayed(const Duration(seconds: 2));
      
      if (mounted) {
        setState(() {
          _state = CheckInState.waiting;
          _lastUid = null; // Permite ler a mesma pulseira novamente
        });
      }
    } catch (e) {
      setState(() {
        _state = CheckInState.error;
        _lastResult = CheckInResult(
          allowed: false,
          reason: 'Erro de conexão: $e',
        );
        _deniedCount++;
      });

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() {
          _state = CheckInState.waiting;
          _lastUid = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _getBackgroundColor(),
      appBar: AppBar(
        title: Text(widget.gateName),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: _state == CheckInState.waiting ? Colors.black : Colors.white,
        actions: [
          // Contador
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                _buildCounter(Icons.check, _successCount, Colors.green),
                const SizedBox(width: 8),
                _buildCounter(Icons.close, _deniedCount, Colors.red),
              ],
            ),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _buildContent(),
      ),
    );
  }

  Widget _buildCounter(IconData icon, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 4),
          Text(
            '$count',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: _state == CheckInState.waiting ? Colors.black : Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (_state) {
      case CheckInState.waiting:
        return Colors.grey.shade100;
      case CheckInState.processing:
        return Colors.blue;
      case CheckInState.allowed:
        return Colors.green;
      case CheckInState.denied:
      case CheckInState.error:
        return Colors.red;
    }
  }

  Widget _buildContent() {
    switch (_state) {
      case CheckInState.waiting:
        return _buildWaiting();
      case CheckInState.processing:
        return _buildProcessing();
      case CheckInState.allowed:
        return _buildAllowed();
      case CheckInState.denied:
      case CheckInState.error:
        return _buildDenied();
    }
  }

  Widget _buildWaiting() {
    return Center(
      key: const ValueKey('waiting'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.nfc,
            size: 150,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 32),
          Text(
            'Aguardando pulseira...',
            style: TextStyle(
              fontSize: 24,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Aproxime a pulseira do leitor',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProcessing() {
    return const Center(
      key: ValueKey('processing'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 100,
            height: 100,
            child: CircularProgressIndicator(
              strokeWidth: 6,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
          SizedBox(height: 32),
          Text(
            'Verificando...',
            style: TextStyle(
              fontSize: 24,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllowed() {
    return Center(
      key: const ValueKey('allowed'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.check_circle,
            size: 200,
            color: Colors.white,
          ),
          const SizedBox(height: 24),
          Text(
            _lastResult?.attendeeName ?? 'LIBERADO',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          if (_lastResult?.ticketType != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _lastResult!.ticketType!.toUpperCase(),
                style: const TextStyle(
                  fontSize: 18,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDenied() {
    return Center(
      key: const ValueKey('denied'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.cancel,
            size: 200,
            color: Colors.white,
          ),
          const SizedBox(height: 24),
          const Text(
            'ACESSO NEGADO',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          if (_lastResult?.reason != null) ...[
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _lastResult!.reason!,
                style: const TextStyle(
                  fontSize: 18,
                  color: Colors.white70,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Estados do check-in
enum CheckInState {
  waiting,
  processing,
  allowed,
  denied,
  error,
}
