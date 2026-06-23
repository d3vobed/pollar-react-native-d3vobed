# @pollar/react-native — React Native Package

React Native package for Pollar authentication on mobile. Built on `@pollar/core` with NobleKeyManager (pure JS crypto), Expo and Keychain storage adapters.

Closes pollar-xyz/pollar-backoffice#10.

## Structure

```
package/       → The @pollar/react-native library (ESM + CJS + types)
demo/          → Expo demo app consuming the package via tarball
```

## Getting Started

```sh
# Build the package
cd package && npm install && npm run build && npm pack
cp pollar-react-native-0.9.0.tgz ../

# Install & run the demo
cd ../demo && npm install && npx expo start
```

## Demo

The Expo demo app at `demo/` shows:
- Email login flow
- Wallet address display
- Balance display
- Send XLM transaction (build → sign → submit on testnet)

## Build

```sh
cd package
npm install
npm run build
npm pack   # produces pollar-react-native-0.9.0.tgz
```
