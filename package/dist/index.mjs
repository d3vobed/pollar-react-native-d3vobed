// src/PollarProvider.tsx
import { createContext, useState, useCallback, useEffect, useMemo } from "react";
import { PollarClient } from "@pollar/core";
import { jsx } from "react/jsx-runtime";
var PollarContext = createContext(null);
function PollarProvider({
  apiKey,
  stellarNetwork,
  storage,
  logLevel,
  logger,
  onStorageDegrade,
  children
}) {
  const [pollarClient] = useState(() => {
    const config = {
      apiKey,
      stellarNetwork: stellarNetwork ?? "testnet",
      logLevel: logLevel ?? "info",
      ...logger && { logger },
      ...storage && { storage }
    };
    return new PollarClient(config);
  });
  const [authState, setAuthState] = useState(() => pollarClient.getAuthState());
  const [transaction, setTransaction] = useState({ step: "idle" });
  const [networkState, setNetworkState] = useState(() => {
    const ns = pollarClient.getNetworkState();
    return ns;
  });
  const [walletBalanceState, setWalletBalanceState] = useState(() => pollarClient.getWalletBalanceState());
  const [sessionsState, setSessionsState] = useState(() => pollarClient.getSessionsState());
  useEffect(() => {
    return pollarClient.onAuthStateChange((state) => {
      setAuthState(state);
    });
  }, [pollarClient]);
  useEffect(() => {
    return pollarClient.onTransactionStateChange((state) => {
      setTransaction(state);
    });
  }, [pollarClient]);
  useEffect(() => {
    return pollarClient.onNetworkStateChange((state) => {
      setNetworkState(state);
    });
  }, [pollarClient]);
  useEffect(() => {
    return pollarClient.onWalletBalanceStateChange((state) => {
      setWalletBalanceState(state);
    });
  }, [pollarClient]);
  useEffect(() => {
    return pollarClient.onSessionsStateChange((state) => {
      setSessionsState(state);
    });
  }, [pollarClient]);
  useEffect(() => {
    if (!onStorageDegrade) return;
    return pollarClient.onStorageDegrade(onStorageDegrade);
  }, [pollarClient, onStorageDegrade]);
  const session = authState.step === "authenticated" ? authState.session : null;
  const walletAddress = session?.wallet?.address ?? "";
  const verified = authState.step === "authenticated" ? authState.verified : false;
  const getClient = useCallback(() => pollarClient, [pollarClient]);
  const refreshWalletBalance = useCallback(() => pollarClient.refreshBalance(), [pollarClient, walletAddress]);
  const contextValue = useMemo(() => ({
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
    network: networkState.step === "connected" ? networkState.network : "testnet",
    setNetwork: (network) => pollarClient.setNetwork(network),
    walletBalance: walletBalanceState,
    refreshWalletBalance,
    sessions: sessionsState
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
    sessionsState
  ]);
  return /* @__PURE__ */ jsx(PollarContext.Provider, { value: contextValue, children });
}

// src/usePollar.ts
import { useContext } from "react";
function usePollar() {
  const ctx = useContext(PollarContext);
  if (!ctx) {
    throw new Error("usePollar must be used inside <PollarProvider>");
  }
  return ctx;
}

// src/EmailLogin.tsx
import { useState as useState2, useCallback as useCallback2, useEffect as useEffect2 } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
function EmailLogin({ onSuccess, onError }) {
  const { authState, beginEmailLogin, sendEmailCode, verifyEmailCode, isAuthenticated } = usePollar();
  const [email, setEmail] = useState2("");
  const [code, setCode] = useState2("");
  const [flowStarted, setFlowStarted] = useState2(false);
  const handleSendCode = useCallback2(() => {
    if (!email.trim()) return;
    if (!flowStarted) {
      beginEmailLogin();
    }
    sendEmailCode(email.trim());
    setFlowStarted(true);
  }, [email, beginEmailLogin, sendEmailCode, flowStarted]);
  const handleVerifyCode = useCallback2(() => {
    if (!code.trim()) return;
    verifyEmailCode(code.trim());
  }, [code, verifyEmailCode]);
  useEffect2(() => {
    if (isAuthenticated) {
      onSuccess?.();
    }
  }, [isAuthenticated, onSuccess]);
  useEffect2(() => {
    if (authState.step === "error") {
      onError?.(new Error(authState.message));
    }
  }, [authState, onError]);
  const isLoading = authState.step === "sending_email" || authState.step === "verifying_email_code" || authState.step === "creating_session" || authState.step === "authenticating";
  const showCodeInput = authState.step === "entering_code" || authState.step === "verifying_email_code";
  const showEmailInput = !showCodeInput;
  return /* @__PURE__ */ jsx2(
    KeyboardAvoidingView,
    {
      style: styles.container,
      behavior: Platform.OS === "ios" ? "padding" : "height",
      children: /* @__PURE__ */ jsxs(View, { style: styles.card, children: [
        /* @__PURE__ */ jsx2(Text, { style: styles.title, children: "Sign in with Email" }),
        /* @__PURE__ */ jsx2(Text, { style: styles.subtitle, children: showCodeInput ? "Enter the verification code sent to your email" : "Enter your email to receive a verification code" }),
        showEmailInput && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx2(
            TextInput,
            {
              style: styles.input,
              placeholder: "you@example.com",
              placeholderTextColor: "#9CA3AF",
              value: email,
              onChangeText: setEmail,
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
              editable: !isLoading
            }
          ),
          /* @__PURE__ */ jsx2(
            TouchableOpacity,
            {
              style: [styles.button, (!email.trim() || isLoading) && styles.buttonDisabled],
              onPress: handleSendCode,
              disabled: !email.trim() || isLoading,
              children: isLoading ? /* @__PURE__ */ jsx2(ActivityIndicator, { color: "#fff" }) : /* @__PURE__ */ jsx2(Text, { style: styles.buttonText, children: "Send Code" })
            }
          )
        ] }),
        showCodeInput && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx2(Text, { style: styles.emailDisplay, children: email }),
          /* @__PURE__ */ jsx2(
            TextInput,
            {
              style: styles.input,
              placeholder: "000000",
              placeholderTextColor: "#9CA3AF",
              value: code,
              onChangeText: setCode,
              keyboardType: "number-pad",
              maxLength: 6,
              editable: !isLoading
            }
          ),
          /* @__PURE__ */ jsx2(
            TouchableOpacity,
            {
              style: [styles.button, (!code.trim() || isLoading) && styles.buttonDisabled],
              onPress: handleVerifyCode,
              disabled: !code.trim() || isLoading,
              children: isLoading ? /* @__PURE__ */ jsx2(ActivityIndicator, { color: "#fff" }) : /* @__PURE__ */ jsx2(Text, { style: styles.buttonText, children: "Verify Code" })
            }
          )
        ] }),
        authState.step === "error" && /* @__PURE__ */ jsx2(Text, { style: styles.errorText, children: authState.message })
      ] })
    }
  );
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB"
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 16
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#0560a9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  emailDisplay: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500"
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16
  }
});
export {
  EmailLogin,
  PollarContext,
  PollarProvider,
  usePollar
};
//# sourceMappingURL=index.mjs.map