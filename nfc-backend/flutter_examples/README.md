# Flutter NFC Staff App - Exemplos

Este diretório contém exemplos de código Flutter para criar um aplicativo de operação de pulseiras NFC.

## 📱 Telas Incluídas

### 1. `activation_screen.dart` - Ativação de Pulseira
- Leitura de pulseira NFC
- Verificação de status (nova, ativada, bloqueada)
- Formulário de cadastro de lead (nome, email, telefone, etc.)
- Vinculação da pulseira ao participante

### 2. `checkin_screen.dart` - Check-in no Portão
- Leitura contínua de pulseiras
- Feedback visual grande (verde = liberado, vermelho = negado)
- Contador de entradas/negações
- Otimizado para uso em catracas

### 3. `balance_screen.dart` - Consulta de Saldo
- Consulta de saldo da pulseira
- Extrato de transações
- Opção de recarga (para operadores de caixa)

## 🛠️ Setup

### Pré-requisitos

1. Flutter SDK 3.0+
2. Dispositivo com NFC (Android ou iOS)
3. Permissões de NFC configuradas

### Configuração Android

Adicione ao `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
    <!-- Permissão NFC -->
    <uses-permission android:name="android.permission.NFC" />
    
    <!-- Requer dispositivo com NFC -->
    <uses-feature android:name="android.hardware.nfc" android:required="true" />
    
    <application ...>
        <!-- Intent filter para ler tags NFC -->
        <intent-filter>
            <action android:name="android.nfc.action.NDEF_DISCOVERED" />
            <category android:name="android.intent.category.DEFAULT" />
        </intent-filter>
        
        <intent-filter>
            <action android:name="android.nfc.action.TAG_DISCOVERED" />
            <category android:name="android.intent.category.DEFAULT" />
        </intent-filter>
    </application>
</manifest>
```

### Configuração iOS

Adicione ao `ios/Runner/Info.plist`:

```xml
<key>NFCReaderUsageDescription</key>
<string>Este app usa NFC para ler pulseiras de eventos</string>

<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>D2760000850101</string>
</array>
```

E ao `ios/Runner/Runner.entitlements`:

```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>TAG</string>
</array>
```

### Configurar URL da API

Edite `lib/services/nfc_api_service.dart`:

```dart
static const String baseUrl = 'http://SEU_SERVIDOR:3001/api';
```

### Instalar dependências

```bash
flutter pub get
```

### Executar

```bash
flutter run
```

## 📦 Estrutura do Projeto

```
lib/
├── main.dart              # Entry point com navegação
├── services/
│   └── nfc_api_service.dart   # Cliente HTTP para a API
└── screens/
    ├── activation_screen.dart  # Tela de ativação
    ├── checkin_screen.dart     # Tela de check-in
    └── balance_screen.dart     # Tela de saldo
```

## 🔐 Autenticação

O app usa JWT para autenticação. Fluxo típico:

```dart
final api = NfcApiService();

// Login
final result = await api.login('operador@evento.com', 'senha123');
if (result.success) {
  print('Logado como: ${result.user?.name}');
}

// As chamadas subsequentes incluem o token automaticamente
final balance = await api.getBalance('NFC001ABC');
```

## 📝 Exemplo de Uso Completo

```dart
import 'package:flutter/material.dart';
import 'screens/activation_screen.dart';
import 'screens/checkin_screen.dart';
import 'screens/balance_screen.dart';
import 'services/nfc_api_service.dart';

void main() {
  runApp(const NfcStaffApp());
}

class NfcStaffApp extends StatelessWidget {
  const NfcStaffApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NFC Staff App',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Operações'),
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.person_add),
            title: const Text('Ativar Pulseira'),
            subtitle: const Text('Credenciamento de participantes'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ActivationScreen()),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.login),
            title: const Text('Check-in'),
            subtitle: const Text('Controle de acesso nos portões'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const CheckInScreen(gateName: 'Entrada Principal'),
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.account_balance_wallet),
            title: const Text('Consultar Saldo'),
            subtitle: const Text('Ver saldo e extrato'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const BalanceScreen(canTopUp: true),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

## 🎨 Customização

### Cores do App

O app usa as cores padrão do Material Design. Para customizar:

```dart
MaterialApp(
  theme: ThemeData(
    primarySwatch: Colors.purple, // Cor principal
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.purple),
  ),
)
```

### Logo e Branding

Adicione assets em `assets/` e registre no `pubspec.yaml`:

```yaml
flutter:
  assets:
    - assets/logo.png
    - assets/icons/
```

## 🐛 Debug

Para ver logs de NFC:

```bash
flutter run --verbose
```

Para testar sem NFC (mock):

```dart
// Em nfc_api_service.dart, adicione método de mock
Future<WristbandStatus> mockGetStatus(String uid) async {
  return WristbandStatus(
    uid: uid,
    status: 'new',
  );
}
```

## 📄 Licença

Proprietário - BXD Power Event © 2025
