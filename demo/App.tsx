import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ScrollView, ActivityIndicator, TextInput } from 'react-native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { PollarProvider, usePollar, EmailLogin } from '@pollar/react-native'
import { createSecureStoreAdapter } from '@pollar/core/adapters/expo'

const PUBLISHABLE_KEY = 'pat_047619d453971851f2d58d54e68f988c01e4f501dbda240cc1f6d1eb39385eec'

function WalletDashboard() {
  const {
    walletAddress,
    logout,
    buildTx,
    signAndSubmitTx,
    tx,
    walletBalance,
    refreshWalletBalance,
    network,
    setNetwork,
  } = usePollar()

  const [dest, setDest] = useState('')
  const [amount, setAmount] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (walletBalance.step === 'idle') {
      refreshWalletBalance()
    }
  }, [walletBalance.step, refreshWalletBalance])

  useEffect(() => {
    if (tx.step === 'success') {
      setStatusMessage(`Tx succeeded! Hash: ${tx.hash}`)
    } else if (tx.step === 'error') {
      setStatusMessage(`Error: ${tx.details || 'Unknown error'}`)
    } else if (tx.step === 'submitted') {
      setStatusMessage(`Tx submitted: ${tx.hash}`)
    }
  }, [tx])

  async function handleSend() {
    if (!dest.trim() || !amount.trim()) return
    setStatusMessage('Building transaction...')

    const buildResult = await buildTx('payment', {
      destination: dest.trim(),
      amount: amount.trim(),
      asset: 'XLM',
    })

    if (buildResult.status === 'error') {
      setStatusMessage(`Build error: ${buildResult.details}`)
      return
    }

    setStatusMessage('Signing and submitting...')
    const result = await signAndSubmitTx()

    if (result.status === 'success') {
      setStatusMessage(`Done! Hash: ${result.hash}`)
    } else if (result.status === 'pending') {
      setStatusMessage(`Pending, hash: ${result.hash}`)
    } else {
      setStatusMessage(`Failed: ${result.details || result.resultCode || 'Unknown'}`)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Pollar Wallet</Text>
        <Text style={styles.networkBadge}>{network}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Wallet Address</Text>
          <Text style={styles.address} selectable>{walletAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Balance</Text>
          {walletBalance.step === 'loading' && <ActivityIndicator />}
          {walletBalance.step === 'loaded' && (
            <View>
              {walletBalance.data.balances.map((b, i) => (
                <Text key={i} style={styles.balanceItem}>
                  {b.balance} {b.asset}
                </Text>
              ))}
            </View>
          )}
          {walletBalance.step === 'error' && (
            <Text style={styles.errorText}>{walletBalance.message}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Send XLM</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination address (G...)"
            placeholderTextColor="#9CA3AF"
            value={dest}
            onChangeText={setDest}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={[styles.button, tx.step !== 'idle' && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={tx.step !== 'idle'}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
          {tx.step === 'building' || tx.step === 'signing' || tx.step === 'submitting' || tx.step === 'signing-submitting' || tx.step === 'building-signing-submitting' ? (
            <ActivityIndicator style={{ marginTop: 12 }} />
          ) : null}
        </View>

        {statusMessage ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default function App() {
  const [storage, setStorage] = useState(null)

  useEffect(() => {
    createSecureStoreAdapter()
      .then(setStorage)
      .catch((err) => {
        console.warn('SecureStore unavailable, using memory:', err.message)
        setStorage(null)
      })
  }, [])

  return (
    <PollarProvider
      apiKey={PUBLISHABLE_KEY}
      stellarNetwork="testnet"
      storage={storage || undefined}
    >
      <AppInner />
    </PollarProvider>
  )
}

function AppInner() {
  const { isAuthenticated } = usePollar()

  return (
    <>
      <ExpoStatusBar style="dark" />
      {isAuthenticated ? <WalletDashboard /> : <EmailLogin />}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  networkBadge: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  address: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  balanceItem: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0560a9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
})
