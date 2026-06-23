import { createContext, useState, useCallback, useEffect, useMemo } from 'react'
import { PollarClient, type AuthState, type StellarNetwork, type PollarClientConfig, type TransactionState } from '@pollar/core'
import type { PollarContextValue, PollarProviderProps } from './types'

export const PollarContext = createContext<PollarContextValue | null>(null)

export function PollarProvider({
  apiKey,
  stellarNetwork,
  storage,
  logLevel,
  logger,
  onStorageDegrade,
  children,
}: PollarProviderProps) {
  const [pollarClient] = useState<PollarClient>(() => {
    const config: PollarClientConfig = {
      apiKey,
      stellarNetwork: stellarNetwork ?? 'testnet',
      logLevel: logLevel ?? 'info',
      ...(logger && { logger }),
      ...(storage && { storage }),
    }
    return new PollarClient(config)
  })

  const [authState, setAuthState] = useState<AuthState>(() => pollarClient.getAuthState())
  const [transaction, setTransaction] = useState<TransactionState>({ step: 'idle' })
  const [networkState, setNetworkState] = useState<{ step: string; network?: StellarNetwork }>(() => {
    const ns = pollarClient.getNetworkState()
    return ns
  })
  const [walletBalanceState, setWalletBalanceState] = useState(() => pollarClient.getWalletBalanceState())
  const [sessionsState, setSessionsState] = useState(() => pollarClient.getSessionsState())

  useEffect(() => {
    return pollarClient.onAuthStateChange((state: AuthState) => {
      setAuthState(state)
    })
  }, [pollarClient])

  useEffect(() => {
    return pollarClient.onTransactionStateChange((state: TransactionState) => {
      setTransaction(state)
    })
  }, [pollarClient])

  useEffect(() => {
    return pollarClient.onNetworkStateChange((state) => {
      setNetworkState(state)
    })
  }, [pollarClient])

  useEffect(() => {
    return pollarClient.onWalletBalanceStateChange((state) => {
      setWalletBalanceState(state)
    })
  }, [pollarClient])

  useEffect(() => {
    return pollarClient.onSessionsStateChange((state) => {
      setSessionsState(state)
    })
  }, [pollarClient])

  useEffect(() => {
    if (!onStorageDegrade) return
    return pollarClient.onStorageDegrade(onStorageDegrade)
  }, [pollarClient, onStorageDegrade])

  const session = authState.step === 'authenticated' ? authState.session : null
  const walletAddress = session?.wallet?.address ?? ''
  const verified = authState.step === 'authenticated' ? authState.verified : false

  const getClient = useCallback(() => pollarClient, [pollarClient])
  const refreshWalletBalance = useCallback(() => pollarClient.refreshBalance(), [pollarClient, walletAddress])

  const contextValue = useMemo<PollarContextValue>(() => ({
    walletAddress,
    isAuthenticated: !!walletAddress,
    verified,
    walletType: pollarClient.getWalletType(),
    getClient,
    login: (options) => pollarClient.login(options),
    logout: () => pollarClient.logout(),
    beginEmailLogin: () => pollarClient.beginEmailLogin(),
    sendEmailCode: (email) => pollarClient.sendEmailCode(email),
    verifyEmailCode: (code) => pollarClient.verifyEmailCode(code),
    authState,
    tx: transaction,
    buildTx: (operation, params, options) => pollarClient.buildTx(operation, params, options),
    signAndSubmitTx: (unsignedXdr) => pollarClient.signAndSubmitTx(unsignedXdr),
    network: networkState.step === 'connected' ? networkState.network! : 'testnet',
    setNetwork: (network) => pollarClient.setNetwork(network),
    walletBalance: walletBalanceState,
    refreshWalletBalance,
    sessions: sessionsState,
  }), [
    walletAddress,
    verified,
    pollarClient,
    getClient,
    authState,
    transaction,
    networkState,
    walletBalanceState,
    refreshWalletBalance,
    sessionsState,
  ])

  return (
    <PollarContext.Provider value={contextValue}>
      {children}
    </PollarContext.Provider>
  )
}
