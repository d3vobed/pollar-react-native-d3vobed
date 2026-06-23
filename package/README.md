# @pollar/react-native

React Native package for Pollar authentication on mobile. Built on top of `@pollar/core` using the NobleKeyManager (pure JS crypto) and the core's Expo / Keychain storage adapters.

## Peer Dependencies

- `react` >= 18
- `react-native` >= 0.81
- `@pollar/core` ^0.9.0

For secure storage, install **one** of:

- **Expo**: `expo-secure-store` (automatic with Expo SDK 56)
- **Bare RN**: `react-native-keychain`

## Install

```sh
npm install @pollar/react-native
```

Make sure `@pollar/core@^0.9.0` is also installed:

```sh
npm install @pollar/core@^0.9.0
```

> **Note**: This package is not published on npm. For testing, run `npm pack` and install the tarball in your app.

## RN Crypto Polyfills

`@pollar/core` uses pure JS crypto (Noble) so no native crypto polyfills are needed. However, `getRandomValues` and `Buffer` must be available. The Expo SDK includes them automatically. For bare RN, install:

```sh
npm install react-native-get-random-values buffer
```

And import them at the top of your entry file:

```ts
import 'react-native-get-random-values'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer
```

## Usage

### 1. Wrap your app with `PollarProvider`

```tsx
import { PollarProvider } from '@pollar/react-native'

export default function App() {
  return (
    <PollarProvider apiKey="pub_testnet_..." stellarNetwork="testnet">
      <MyApp />
    </PollarProvider>
  )
}
```

### 2. Use the `usePollar` hook

```tsx
import { usePollar, EmailLogin } from '@pollar/react-native'
import { View, Text, Button } from 'react-native'

function MyApp() {
  const { isAuthenticated, walletAddress, signAndSubmitTx, buildTx, logout } = usePollar()

  if (!isAuthenticated) {
    return <EmailLogin />
  }

  return (
    <View>
      <Text>Wallet: {walletAddress}</Text>
      <Button title="Logout" onPress={() => logout()} />
    </View>
  )
}
```

### 3. Build and submit a transaction

```tsx
const { buildTx, signAndSubmitTx } = usePollar()

async function handleSend() {
  const build = await buildTx('payment', {
    destination: 'G...',
    amount: '10',
    asset: 'XLM',
  })

  if (build.status === 'built') {
    const result = await signAndSubmitTx()
    if (result.status === 'success') {
      console.log('Tx hash:', result.hash)
    }
  }
}
```

Or use the one-shot `runTx` (available through `getClient().runTx()`).

### 4. Custom storage

By default, the provider uses in-memory storage. For real persistence, inject one of the core's adapters:

```tsx
import { PollarProvider } from '@pollar/react-native'
import { createSecureStoreAdapter } from '@pollar/core/adapters/expo'

export default function App() {
  const [storage, setStorage] = useState(null)

  useEffect(() => {
    createSecureStoreAdapter().then(setStorage)
  }, [])

  if (!storage) return null

  return (
    <PollarProvider apiKey="pub_testnet_..." storage={storage}>
      <MyApp />
    </PollarProvider>
  )
}
```

## API

### `PollarProvider`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | — | Your Pollar publishable key |
| `stellarNetwork` | `'testnet' \| 'mainnet'` | `'testnet'` | Stellar network |
| `storage` | `Storage` | in-memory | Storage adapter (from `@pollar/core/adapters/*`) |
| `logLevel` | `LogLevel` | `'info'` | Logging level |
| `logger` | `PollarLogger` | `console` | Custom logger |
| `onStorageDegrade` | `OnStorageDegrade` | — | Called when storage degrades |

### `usePollar()`

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `walletAddress` | `string` | Current wallet address (empty string if not authenticated) |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `verified` | `boolean` | Whether session is server-verified |
| `walletType` | `WalletId \| null` | Type of wallet connected |
| `authState` | `AuthState` | Current authentication state machine |
| `login` | `(opts) => void` | Start a login flow |
| `logout` | `() => Promise<void>` | Log out |
| `beginEmailLogin` | `() => void` | Start email login flow |
| `sendEmailCode` | `(email) => void` | Send email verification code |
| `verifyEmailCode` | `(code) => void` | Verify email code |
| `buildTx` | `(op, params, opts?) => Promise<BuildOutcome>` | Build an unsigned transaction |
| `signAndSubmitTx` | `(xdr?) => Promise<SubmitOutcome>` | Sign and submit a transaction |
| `network` | `StellarNetwork` | Current Stellar network |
| `setNetwork` | `(net) => void` | Change network |
| `walletBalance` | `WalletBalanceState` | Wallet balance state |
| `refreshWalletBalance` | `() => Promise<void>` | Refresh balance |
| `sessions` | `SessionsState` | Active sessions |
| `getClient` | `() => PollarClient` | Get the underlying PollarClient |

### `EmailLogin`

A ready-to-use email login screen component.

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Called after successful authentication |
| `onError` | `(err) => void` | Called on login error |

## Build

```sh
npm install
npm run build
npm pack
```

This produces a tarball (`pollar-react-native-0.9.0.tgz`) that can be installed in the demo app.
