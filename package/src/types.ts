import type { AuthState, PollarClient, PollarClientConfig, SubmitOutcome, BuildOutcome, TxBuildBody, TransactionState, WalletBalanceState, SessionsState, StellarNetwork, PollarLogger, OnStorageDegrade, PollarLoginOptions, WalletId } from '@pollar/core'

export interface PollarReactNativeConfig extends Omit<PollarClientConfig, 'storage'> {
  storage?: PollarClientConfig['storage']
}

export interface PollarContextValue {
  walletAddress: string
  isAuthenticated: boolean
  verified: boolean
  walletType: WalletId | null
  getClient: () => PollarClient
  login: (options: PollarLoginOptions) => void
  logout: () => Promise<void>
  authState: AuthState
  tx: TransactionState
  buildTx: (operation: TxBuildBody['operation'], params: TxBuildBody['params'], options?: TxBuildBody['options']) => Promise<BuildOutcome>
  signAndSubmitTx: (unsignedXdr?: string) => Promise<SubmitOutcome>
  beginEmailLogin: () => void
  sendEmailCode: (email: string) => void
  verifyEmailCode: (code: string) => void
  network: StellarNetwork
  setNetwork: (network: StellarNetwork) => void
  walletBalance: WalletBalanceState
  refreshWalletBalance: () => Promise<void>
  sessions: SessionsState
}

export interface PollarProviderProps {
  apiKey: string
  stellarNetwork?: StellarNetwork
  storage?: PollarClientConfig['storage']
  logLevel?: PollarClientConfig['logLevel']
  logger?: PollarLogger
  onStorageDegrade?: OnStorageDegrade
  children: React.ReactNode
}
