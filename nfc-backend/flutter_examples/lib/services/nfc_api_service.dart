import 'dart:convert';
import 'package:http/http.dart' as http;

/// =============================================================================
/// NFC API SERVICE - Cliente HTTP para a API de Pulseiras NFC
/// =============================================================================
/// 
/// Serviço responsável por toda comunicação com o backend Node.js.
/// Gerencia autenticação JWT e todas as operações de pulseiras.

class NfcApiService {
  static const String baseUrl = 'http://SEU_SERVIDOR:3001/api';
  String? _token;

  // Singleton pattern
  static final NfcApiService _instance = NfcApiService._internal();
  factory NfcApiService() => _instance;
  NfcApiService._internal();

  /// Headers padrão com autenticação
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // ===========================================================================
  // AUTENTICAÇÃO
  // ===========================================================================

  /// Login do operador/staff
  Future<LoginResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      _token = data['data']['token'];
      return LoginResponse.success(
        token: _token!,
        user: StaffUser.fromJson(data['data']['user']),
      );
    } else {
      return LoginResponse.error(data['message'] ?? 'Erro no login');
    }
  }

  /// Logout
  Future<void> logout() async {
    await http.post(
      Uri.parse('$baseUrl/auth/logout'),
      headers: _headers,
    );
    _token = null;
  }

  /// Verificar se está autenticado
  bool get isAuthenticated => _token != null;

  // ===========================================================================
  // PULSEIRAS
  // ===========================================================================

  /// Buscar status de uma pulseira pelo UID NFC
  Future<WristbandStatus> getWristbandStatus(String uid) async {
    final response = await http.get(
      Uri.parse('$baseUrl/wristbands/$uid/status'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      return WristbandStatus.fromJson(data['data']);
    } else if (response.statusCode == 404) {
      return WristbandStatus.notFound(uid);
    } else {
      throw ApiException(data['message'] ?? 'Erro ao buscar pulseira');
    }
  }

  /// Ativar pulseira e vincular a um participante
  Future<ActivationResult> activateWristband({
    required String uid,
    required AttendeeData attendee,
  }) async {
    // 1. Criar participante (lead)
    final attendeeResponse = await http.post(
      Uri.parse('$baseUrl/attendees'),
      headers: _headers,
      body: jsonEncode(attendee.toJson()),
    );

    final attendeeData = jsonDecode(attendeeResponse.body);
    
    if (attendeeResponse.statusCode != 201) {
      return ActivationResult.error(
        attendeeData['message'] ?? 'Erro ao criar participante',
      );
    }

    final attendeeId = attendeeData['data']['id'];

    // 2. Ativar pulseira
    final activateResponse = await http.post(
      Uri.parse('$baseUrl/wristbands/activate'),
      headers: _headers,
      body: jsonEncode({
        'uid': uid,
        'attendee_id': attendeeId,
      }),
    );

    final activateData = jsonDecode(activateResponse.body);
    
    if (activateResponse.statusCode == 200 && activateData['success'] == true) {
      return ActivationResult.success(
        wristband: WristbandStatus.fromJson(activateData['data']),
      );
    } else {
      return ActivationResult.error(
        activateData['message'] ?? 'Erro ao ativar pulseira',
      );
    }
  }

  /// Bloquear pulseira (perda/roubo)
  Future<bool> blockWristband(String uid, String reason) async {
    final response = await http.put(
      Uri.parse('$baseUrl/wristbands/$uid/block'),
      headers: _headers,
      body: jsonEncode({'reason': reason}),
    );

    return response.statusCode == 200;
  }

  // ===========================================================================
  // CONTROLE DE ACESSO
  // ===========================================================================

  /// Realizar check-in em um portão
  Future<CheckInResult> checkIn({
    required String uid,
    required String gate,
    String direction = 'in',
    String? deviceId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/access-logs/check-in'),
      headers: _headers,
      body: jsonEncode({
        'uid': uid,
        'gate': gate,
        'direction': direction,
        if (deviceId != null) 'device_id': deviceId,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200) {
      return CheckInResult(
        allowed: data['data']['allowed'] ?? false,
        attendeeName: data['data']['attendee']?['name'],
        ticketType: data['data']['attendee']?['ticket_type'],
        reason: data['data']['reason'],
        message: data['message'],
      );
    } else {
      return CheckInResult(
        allowed: false,
        reason: data['message'] ?? 'Erro no check-in',
      );
    }
  }

  // ===========================================================================
  // CASHLESS
  // ===========================================================================

  /// Consultar saldo de uma pulseira
  Future<BalanceInfo> getBalance(String uid) async {
    final response = await http.get(
      Uri.parse('$baseUrl/accounts/$uid/balance'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      return BalanceInfo.fromJson(data['data']);
    } else {
      throw ApiException(data['message'] ?? 'Erro ao consultar saldo');
    }
  }

  /// Recarregar saldo
  Future<TransactionResult> topUp({
    required String uid,
    required int amountCents,
    String? paymentMethod,
    String? referenceId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions/topup'),
      headers: _headers,
      body: jsonEncode({
        'uid': uid,
        'amount_cents': amountCents,
        if (paymentMethod != null) 'payment_method': paymentMethod,
        if (referenceId != null) 'reference_id': referenceId,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      return TransactionResult.success(
        transactionId: data['data']['transaction_id'],
        newBalance: data['data']['new_balance_cents'],
      );
    } else {
      return TransactionResult.error(data['message'] ?? 'Erro na recarga');
    }
  }

  /// Realizar compra (débito)
  Future<TransactionResult> purchase({
    required String uid,
    required int amountCents,
    required String description,
    String? posId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions/purchase'),
      headers: _headers,
      body: jsonEncode({
        'uid': uid,
        'amount_cents': amountCents,
        'description': description,
        if (posId != null) 'pos_id': posId,
      }),
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      return TransactionResult.success(
        transactionId: data['data']['transaction_id'],
        newBalance: data['data']['new_balance_cents'],
      );
    } else {
      return TransactionResult.error(data['message'] ?? 'Saldo insuficiente');
    }
  }

  /// Buscar extrato de transações
  Future<List<TransactionItem>> getStatement(String uid, {int limit = 20}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/accounts/$uid/statement?limit=$limit'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success'] == true) {
      final items = data['data']['transactions'] as List;
      return items.map((t) => TransactionItem.fromJson(t)).toList();
    } else {
      throw ApiException(data['message'] ?? 'Erro ao buscar extrato');
    }
  }
}

// =============================================================================
// MODELS
// =============================================================================

class LoginResponse {
  final bool success;
  final String? token;
  final StaffUser? user;
  final String? error;

  LoginResponse.success({required this.token, required this.user})
      : success = true,
        error = null;

  LoginResponse.error(this.error)
      : success = false,
        token = null,
        user = null;
}

class StaffUser {
  final String id;
  final String name;
  final String email;
  final String role;

  StaffUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory StaffUser.fromJson(Map<String, dynamic> json) {
    return StaffUser(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
    );
  }
}

class WristbandStatus {
  final String uid;
  final String status; // new, assigned, blocked, lost
  final String? attendeeId;
  final String? attendeeName;
  final String? ticketType;
  final int? balanceCents;
  final bool found;

  WristbandStatus({
    required this.uid,
    required this.status,
    this.attendeeId,
    this.attendeeName,
    this.ticketType,
    this.balanceCents,
    this.found = true,
  });

  factory WristbandStatus.fromJson(Map<String, dynamic> json) {
    return WristbandStatus(
      uid: json['uid'],
      status: json['status'],
      attendeeId: json['attendee_id'],
      attendeeName: json['attendee']?['full_name'],
      ticketType: json['attendee']?['ticket_type'],
      balanceCents: json['account']?['balance_cents'],
    );
  }

  factory WristbandStatus.notFound(String uid) {
    return WristbandStatus(
      uid: uid,
      status: 'not_found',
      found: false,
    );
  }

  bool get isNew => status == 'new';
  bool get isAssigned => status == 'assigned';
  bool get isBlocked => status == 'blocked';
  bool get canActivate => status == 'new';
  bool get canUse => status == 'assigned';

  String get balanceFormatted {
    if (balanceCents == null) return 'R\$ 0,00';
    final reais = balanceCents! / 100;
    return 'R\$ ${reais.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}

class AttendeeData {
  final String fullName;
  final String? email;
  final String? phone;
  final String? cpf;
  final int? age;
  final String? city;
  final String? state;
  final String ticketType;
  final bool marketingOptIn;

  AttendeeData({
    required this.fullName,
    this.email,
    this.phone,
    this.cpf,
    this.age,
    this.city,
    this.state,
    this.ticketType = 'standard',
    this.marketingOptIn = false,
  });

  Map<String, dynamic> toJson() => {
    'full_name': fullName,
    if (email != null) 'email': email,
    if (phone != null) 'phone': phone,
    if (cpf != null) 'cpf': cpf,
    if (age != null) 'age': age,
    if (city != null) 'city': city,
    if (state != null) 'state': state,
    'ticket_type': ticketType,
    'marketing_opt_in': marketingOptIn,
  };
}

class ActivationResult {
  final bool success;
  final WristbandStatus? wristband;
  final String? error;

  ActivationResult.success({required this.wristband})
      : success = true,
        error = null;

  ActivationResult.error(this.error)
      : success = false,
        wristband = null;
}

class CheckInResult {
  final bool allowed;
  final String? attendeeName;
  final String? ticketType;
  final String? reason;
  final String? message;

  CheckInResult({
    required this.allowed,
    this.attendeeName,
    this.ticketType,
    this.reason,
    this.message,
  });
}

class BalanceInfo {
  final String uid;
  final String? attendeeName;
  final int balanceCents;
  final DateTime? lastTopupAt;

  BalanceInfo({
    required this.uid,
    this.attendeeName,
    required this.balanceCents,
    this.lastTopupAt,
  });

  factory BalanceInfo.fromJson(Map<String, dynamic> json) {
    return BalanceInfo(
      uid: json['uid'],
      attendeeName: json['attendee_name'],
      balanceCents: json['balance_cents'],
      lastTopupAt: json['last_topup_at'] != null
          ? DateTime.parse(json['last_topup_at'])
          : null,
    );
  }

  String get balanceFormatted {
    final reais = balanceCents / 100;
    return 'R\$ ${reais.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}

class TransactionResult {
  final bool success;
  final String? transactionId;
  final int? newBalance;
  final String? error;

  TransactionResult.success({
    required this.transactionId,
    required this.newBalance,
  })  : success = true,
        error = null;

  TransactionResult.error(this.error)
      : success = false,
        transactionId = null,
        newBalance = null;

  String get newBalanceFormatted {
    if (newBalance == null) return 'R\$ 0,00';
    final reais = newBalance! / 100;
    return 'R\$ ${reais.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}

class TransactionItem {
  final String id;
  final String type; // topup, purchase, refund
  final int amountCents;
  final String? description;
  final DateTime createdAt;

  TransactionItem({
    required this.id,
    required this.type,
    required this.amountCents,
    this.description,
    required this.createdAt,
  });

  factory TransactionItem.fromJson(Map<String, dynamic> json) {
    return TransactionItem(
      id: json['id'],
      type: json['type'],
      amountCents: json['amount_cents'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  String get amountFormatted {
    final reais = amountCents / 100;
    final prefix = type == 'purchase' ? '-' : '+';
    return '$prefix R\$ ${reais.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  bool get isDebit => type == 'purchase';
  bool get isCredit => type == 'topup' || type == 'refund';
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
