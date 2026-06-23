import * as react from 'react';
import { WalletId, PollarClient, PollarLoginOptions, AuthState, TransactionState, TxBuildBody, BuildOutcome, SubmitOutcome, StellarNetwork, WalletBalanceState, SessionsState, PollarClientConfig, PollarLogger, OnStorageDegrade } from '@pollar/core';
export { AuthState, BuildOutcome, PollarLoginOptions, SessionsState, StellarNetwork, SubmitOutcome, TransactionState, WalletBalanceState, WalletId } from '@pollar/core';

interface PollarReactNativeConfig extends Omit<PollarClientConfig, 'storage'> {
    storage?: PollarClientConfig['storage'];
}
interface PollarContextValue {
    walletAddress: string;
    isAuthenticated: boolean;
    verified: boolean;
    walletType: WalletId | null;
    getClient: () => PollarClient;
    login: (options: PollarLoginOptions) => void;
    logout: () => Promise<void>;
    authState: AuthState;
    tx: TransactionState;
    buildTx: (operation: TxBuildBody['operation'], params: TxBuildBody['params'], options?: TxBuildBody['options']) => Promise<BuildOutcome>;
    signAndSubmitTx: (unsignedXdr?: string) => Promise<SubmitOutcome>;
    beginEmailLogin: () => void;
    sendEmailCode: (email: string) => void;
    verifyEmailCode: (code: string) => void;
    network: StellarNetwork;
    setNetwork: (network: StellarNetwork) => void;
    walletBalance: WalletBalanceState;
    refreshWalletBalance: () => Promise<void>;
    sessions: SessionsState;
}
interface PollarProviderProps {
    apiKey: string;
    stellarNetwork?: StellarNetwork;
    storage?: PollarClientConfig['storage'];
    logLevel?: PollarClientConfig['logLevel'];
    logger?: PollarLogger;
    onStorageDegrade?: OnStorageDegrade;
    children: React.ReactNode;
}

declare const PollarContext: react.Context<PollarContextValue | null>;
declare function PollarProvider({ apiKey, stellarNetwork, storage, logLevel, logger, onStorageDegrade, children, }: PollarProviderProps): react.JSX.Element;

declare function usePollar(): PollarContextValue;

interface EmailLoginProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}
declare function EmailLogin({ onSuccess, onError }: EmailLoginProps): react.JSX.Element;

export { EmailLogin, PollarContext, type PollarContextValue, PollarProvider, type PollarProviderProps, type PollarReactNativeConfig, usePollar };
