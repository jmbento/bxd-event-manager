import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:nfc_manager/nfc_manager.dart';
import '../services/nfc_api_service.dart';

/// =============================================================================
/// TELA DE ATIVAÇÃO DE PULSEIRA + CADASTRO DE LEAD
/// =============================================================================
/// 
/// Fluxo:
/// 1. Operador aproxima pulseira NFC
/// 2. Sistema verifica status (deve ser 'new')
/// 3. Operador preenche dados do participante
/// 4. Sistema vincula pulseira ao participante

class ActivationScreen extends StatefulWidget {
  const ActivationScreen({Key? key}) : super(key: key);

  @override
  State<ActivationScreen> createState() => _ActivationScreenState();
}

class _ActivationScreenState extends State<ActivationScreen> {
  final _api = NfcApiService();
  final _formKey = GlobalKey<FormState>();

  // Estados
  ActivationStep _step = ActivationStep.waitingNfc;
  String? _scannedUid;
  WristbandStatus? _wristbandStatus;
  bool _isLoading = false;
  String? _errorMessage;

  // Controladores do formulário
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cpfController = TextEditingController();
  final _ageController = TextEditingController();
  final _cityController = TextEditingController();
  String _selectedState = 'SP';
  String _ticketType = 'standard';
  bool _marketingOptIn = true;

  // Lista de estados brasileiros
  final List<String> _states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  @override
  void initState() {
    super.initState();
    _startNfcSession();
  }

  @override
  void dispose() {
    _stopNfcSession();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cpfController.dispose();
    _ageController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  /// Inicia sessão de leitura NFC
  Future<void> _startNfcSession() async {
    bool isAvailable = await NfcManager.instance.isAvailable();
    
    if (!isAvailable) {
      setState(() {
        _errorMessage = 'NFC não disponível neste dispositivo';
      });
      return;
    }

    NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {
        // Extrai o UID da tag NFC
        final nfca = tag.data['nfca'] ?? tag.data['nfcv'] ?? tag.data['nfcf'];
        if (nfca != null && nfca['identifier'] != null) {
          final identifier = nfca['identifier'] as List<int>;
          final uid = identifier
              .map((b) => b.toRadixString(16).padLeft(2, '0').toUpperCase())
              .join('');
          
          await _onNfcTagRead(uid);
        }
      },
      onError: (error) async {
        setState(() {
          _errorMessage = 'Erro ao ler NFC: $error';
        });
      },
    );
  }

  /// Para sessão NFC
  void _stopNfcSession() {
    NfcManager.instance.stopSession();
  }

  /// Callback quando uma tag NFC é lida
  Future<void> _onNfcTagRead(String uid) async {
    // Feedback tátil
    HapticFeedback.mediumImpact();

    setState(() {
      _scannedUid = uid;
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Busca status da pulseira na API
      final status = await _api.getWristbandStatus(uid);
      
      setState(() {
        _wristbandStatus = status;
        _isLoading = false;
      });

      if (!status.found) {
        // Pulseira não cadastrada no sistema
        setState(() {
          _errorMessage = 'Pulseira não encontrada no sistema. Cadastre-a primeiro.';
          _step = ActivationStep.error;
        });
      } else if (status.isNew) {
        // Pode ativar - ir para formulário
        setState(() {
          _step = ActivationStep.fillForm;
        });
      } else if (status.isAssigned) {
        // Já está ativada
        setState(() {
          _errorMessage = 'Pulseira já ativada para: ${status.attendeeName}';
          _step = ActivationStep.alreadyActivated;
        });
      } else if (status.isBlocked) {
        // Bloqueada
        setState(() {
          _errorMessage = 'Pulseira bloqueada. Contate o supervisor.';
          _step = ActivationStep.error;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Erro: $e';
        _step = ActivationStep.error;
      });
    }
  }

  /// Submete o formulário e ativa a pulseira
  Future<void> _submitActivation() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await _api.activateWristband(
        uid: _scannedUid!,
        attendee: AttendeeData(
          fullName: _nameController.text.trim(),
          email: _emailController.text.trim().isNotEmpty 
              ? _emailController.text.trim() 
              : null,
          phone: _phoneController.text.trim().isNotEmpty 
              ? _phoneController.text.trim() 
              : null,
          cpf: _cpfController.text.trim().isNotEmpty 
              ? _cpfController.text.trim() 
              : null,
          age: _ageController.text.isNotEmpty 
              ? int.tryParse(_ageController.text) 
              : null,
          city: _cityController.text.trim().isNotEmpty 
              ? _cityController.text.trim() 
              : null,
          state: _selectedState,
          ticketType: _ticketType,
          marketingOptIn: _marketingOptIn,
        ),
      );

      setState(() {
        _isLoading = false;
      });

      if (result.success) {
        setState(() {
          _step = ActivationStep.success;
        });
        
        // Feedback de sucesso
        HapticFeedback.heavyImpact();
        
        // Voltar ao início após 3 segundos
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            _resetScreen();
          }
        });
      } else {
        setState(() {
          _errorMessage = result.error ?? 'Erro ao ativar pulseira';
          _step = ActivationStep.error;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Erro: $e';
        _step = ActivationStep.error;
      });
    }
  }

  /// Reseta a tela para nova ativação
  void _resetScreen() {
    setState(() {
      _step = ActivationStep.waitingNfc;
      _scannedUid = null;
      _wristbandStatus = null;
      _errorMessage = null;
      _nameController.clear();
      _emailController.clear();
      _phoneController.clear();
      _cpfController.clear();
      _ageController.clear();
      _cityController.clear();
      _marketingOptIn = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ativar Pulseira'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          if (_step != ActivationStep.waitingNfc)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _resetScreen,
              tooltip: 'Nova ativação',
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_step) {
      case ActivationStep.waitingNfc:
        return _buildWaitingNfc();
      case ActivationStep.fillForm:
        return _buildForm();
      case ActivationStep.success:
        return _buildSuccess();
      case ActivationStep.alreadyActivated:
        return _buildAlreadyActivated();
      case ActivationStep.error:
        return _buildError();
    }
  }

  /// Tela aguardando leitura NFC
  Widget _buildWaitingNfc() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: Colors.indigo.shade50,
              shape: BoxShape.circle,
            ),
            child: _isLoading
                ? const CircularProgressIndicator()
                : Icon(
                    Icons.nfc,
                    size: 100,
                    color: Colors.indigo.shade300,
                  ),
          ),
          const SizedBox(height: 32),
          Text(
            _isLoading ? 'Verificando pulseira...' : 'Aproxime a pulseira',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Posicione a pulseira sobre o leitor NFC',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey,
            ),
          ),
          if (_scannedUid != null) ...[
            const SizedBox(height: 16),
            Text(
              'UID: $_scannedUid',
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Formulário de cadastro
  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header com info da pulseira
            Card(
              color: Colors.indigo.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.nfc, color: Colors.indigo),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Pulseira pronta para ativação',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'UID: $_scannedUid',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Nome completo (obrigatório)
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Nome completo *',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Nome é obrigatório';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'E-mail',
                prefixIcon: Icon(Icons.email),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value != null && value.isNotEmpty) {
                  if (!value.contains('@') || !value.contains('.')) {
                    return 'E-mail inválido';
                  }
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Telefone
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Telefone',
                prefixIcon: Icon(Icons.phone),
                border: OutlineInputBorder(),
                hintText: '(11) 99999-9999',
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),

            // CPF
            TextFormField(
              controller: _cpfController,
              decoration: const InputDecoration(
                labelText: 'CPF',
                prefixIcon: Icon(Icons.badge),
                border: OutlineInputBorder(),
                hintText: '000.000.000-00',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Idade e Cidade em row
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: TextFormField(
                    controller: _ageController,
                    decoration: const InputDecoration(
                      labelText: 'Idade',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value != null && value.isNotEmpty) {
                        final age = int.tryParse(value);
                        if (age == null || age < 0 || age > 120) {
                          return 'Inválido';
                        }
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(
                      labelText: 'Cidade',
                      border: OutlineInputBorder(),
                    ),
                    textCapitalization: TextCapitalization.words,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Estado
            DropdownButtonFormField<String>(
              value: _selectedState,
              decoration: const InputDecoration(
                labelText: 'Estado',
                prefixIcon: Icon(Icons.location_on),
                border: OutlineInputBorder(),
              ),
              items: _states.map((state) {
                return DropdownMenuItem(value: state, child: Text(state));
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedState = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Tipo de ingresso
            DropdownButtonFormField<String>(
              value: _ticketType,
              decoration: const InputDecoration(
                labelText: 'Tipo de ingresso',
                prefixIcon: Icon(Icons.confirmation_number),
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'standard', child: Text('Pista')),
                DropdownMenuItem(value: 'vip', child: Text('VIP')),
                DropdownMenuItem(value: 'backstage', child: Text('Backstage')),
                DropdownMenuItem(value: 'staff', child: Text('Staff')),
              ],
              onChanged: (value) {
                setState(() {
                  _ticketType = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Opt-in marketing
            SwitchListTile(
              title: const Text('Aceita receber comunicações'),
              subtitle: const Text('E-mails e promoções de eventos futuros'),
              value: _marketingOptIn,
              onChanged: (value) {
                setState(() {
                  _marketingOptIn = value;
                });
              },
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 24),

            // Botão de ativar
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitActivation,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'ATIVAR PULSEIRA',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Tela de sucesso
  Widget _buildSuccess() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 150,
            height: 150,
            decoration: const BoxDecoration(
              color: Colors.green,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check,
              size: 80,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Pulseira Ativada!',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: Colors.green,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _nameController.text,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 24),
          Text(
            'UID: $_scannedUid',
            style: const TextStyle(
              fontFamily: 'monospace',
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  /// Tela de pulseira já ativada
  Widget _buildAlreadyActivated() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.orange.shade100,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person,
                size: 80,
                color: Colors.orange.shade700,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Pulseira já ativada',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.orange.shade700,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              _wristbandStatus?.attendeeName ?? '',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (_wristbandStatus?.ticketType != null) ...[
              const SizedBox(height: 8),
              Chip(
                label: Text(_wristbandStatus!.ticketType!.toUpperCase()),
                backgroundColor: Colors.indigo.shade100,
              ),
            ],
            if (_wristbandStatus?.balanceCents != null) ...[
              const SizedBox(height: 16),
              Text(
                'Saldo: ${_wristbandStatus!.balanceFormatted}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _resetScreen,
              child: const Text('Ler outra pulseira'),
            ),
          ],
        ),
      ),
    );
  }

  /// Tela de erro
  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 150,
              height: 150,
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                size: 80,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Erro',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Erro desconhecido',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _resetScreen,
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Estados da tela de ativação
enum ActivationStep {
  waitingNfc,
  fillForm,
  success,
  alreadyActivated,
  error,
}
