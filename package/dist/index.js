"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  EmailLogin: () => EmailLogin,
  PollarContext: () => PollarContext,
  PollarProvider: () => PollarProvider,
  usePollar: () => usePollar
});
module.exports = __toCommonJS(index_exports);

// src/PollarProvider.tsx
var import_react = require("react");
var import_core = require("@pollar/core");
var import_jsx_runtime = require("react/jsx-runtime");
var PollarContext = (0, import_react.createContext)(null);
function PollarProvider({
  apiKey,
  stellarNetwork,
  storage,
  logLevel,
  logger,
  onStorageDegrade,
  children
}) {
  const [pollarClient] = (0, import_react.useState)(() => {
    const config = {
      apiKey,
      stellarNetwork: stellarNetwork ?? "testnet",
      logLevel: logLevel ?? "info",
      ...logger && { logger },
      ...storage && { storage }
    };
    return new import_core.PollarClient(config);
  });
  const [authState, setAuthState] = (0, import_react.useState)(() => pollarClient.getAuthState());
  const [transaction, setTransaction] = (0, import_react.useState)({ step: "idle" });
  const [networkState, setNetworkState] = (0, import_react.useState)(() => {
    const ns = pollarClient.getNetworkState();
    return ns;
  });
  const [walletBalanceState, setWalletBalanceState] = (0, import_react.useState)(() => pollarClient.getWalletBalanceState());
  const [sessionsState, setSessionsState] = (0, import_react.useState)(() => pollarClient.getSessionsState());
  (0, import_react.useEffect)(() => {
    return pollarClient.onAuthStateChange((state) => {
      setAuthState(state);
    });
  }, [pollarClient]);
  (0, import_react.useEffect)(() => {
    return pollarClient.onTransactionStateChange((state) => {
      setTransaction(state);
    });
  }, [pollarClient]);
  (0, import_react.useEffect)(() => {
    return pollarClient.onNetworkStateChange((state) => {
      setNetworkState(state);
    });
  }, [pollarClient]);
  (0, import_react.useEffect)(() => {
    return pollarClient.onWalletBalanceStateChange((state) => {
      setWalletBalanceState(state);
    });
  }, [pollarClient]);
  (0, import_react.useEffect)(() => {
    return pollarClient.onSessionsStateChange((state) => {
      setSessionsState(state);
    });
  }, [pollarClient]);
  (0, import_react.useEffect)(() => {
    if (!onStorageDegrade) return;
    return pollarClient.onStorageDegrade(onStorageDegrade);
  }, [pollarClient, onStorageDegrade]);
  const session = authState.step === "authenticated" ? authState.session : null;
  const walletAddress = session?.wallet?.address ?? "";
  const verified = authState.step === "authenticated" ? authState.verified : false;
  const getClient = (0, import_react.useCallback)(() => pollarClient, [pollarClient]);
  const refreshWalletBalance = (0, import_react.useCallback)(() => pollarClient.refreshBalance(), [pollarClient, walletAddress]);
  const contextValue = (0, import_react.useMemo)(() => ({
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollarContext.Provider, { value: contextValue, children });
}

// src/usePollar.ts
var import_react2 = require("react");
function usePollar() {
  const ctx = (0, import_react2.useContext)(PollarContext);
  if (!ctx) {
    throw new Error("usePollar must be used inside <PollarProvider>");
  }
  return ctx;
}

// src/EmailLogin.tsx
var import_react3 = require("react");
var import_react_native = require("react-native");
var import_jsx_runtime2 = require("react/jsx-runtime");
function EmailLogin({ onSuccess, onError }) {
  const { authState, beginEmailLogin, sendEmailCode, verifyEmailCode, isAuthenticated } = usePollar();
  const [email, setEmail] = (0, import_react3.useState)("");
  const [code, setCode] = (0, import_react3.useState)("");
  const [sendingCode, setSendingCode] = (0, import_react3.useState)(false);
  const pendingEmailRef = (0, import_react3.useRef)("");
  const handleBeginFlow = (0, import_react3.useCallback)(() => {
    if (!email.trim()) return;
    pendingEmailRef.current = email.trim();
    setSendingCode(true);
    beginEmailLogin();
  }, [email, beginEmailLogin]);
  const handleVerifyCode = (0, import_react3.useCallback)(() => {
    if (!code.trim()) return;
    verifyEmailCode(code.trim());
  }, [code, verifyEmailCode]);
  (0, import_react3.useEffect)(() => {
    if (authState.step === "entering_email" && sendingCode) {
      const emailToSend = pendingEmailRef.current;
      if (emailToSend) {
        sendEmailCode(emailToSend);
        setSendingCode(false);
      }
    }
  }, [authState, sendingCode, sendEmailCode]);
  (0, import_react3.useEffect)(() => {
    if (isAuthenticated) {
      onSuccess?.();
    }
  }, [isAuthenticated, onSuccess]);
  (0, import_react3.useEffect)(() => {
    if (authState.step === "error") {
      onError?.(new Error(authState.message));
    }
  }, [authState, onError]);
  const isLoading = authState.step === "sending_email" || authState.step === "verifying_email_code" || authState.step === "creating_session" || authState.step === "authenticating";
  const showCodeInput = authState.step === "entering_code" || authState.step === "verifying_email_code";
  const showEmailInput = !showCodeInput;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_react_native.KeyboardAvoidingView,
    {
      style: styles.container,
      behavior: import_react_native.Platform.OS === "ios" ? "padding" : "height",
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_react_native.View, { style: styles.card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.title, children: "Sign in with Email" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.subtitle, children: showCodeInput ? "Enter the verification code sent to your email" : "Enter your email to receive a verification code" }),
        showEmailInput && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_react_native.TextInput,
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_react_native.TouchableOpacity,
            {
              style: [styles.button, (!email.trim() || isLoading) && styles.buttonDisabled],
              onPress: handleBeginFlow,
              disabled: !email.trim() || isLoading,
              children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.ActivityIndicator, { color: "#fff" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.buttonText, children: "Send Code" })
            }
          )
        ] }),
        showCodeInput && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.emailDisplay, children: email }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_react_native.TextInput,
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_react_native.TouchableOpacity,
            {
              style: [styles.button, (!code.trim() || isLoading) && styles.buttonDisabled],
              onPress: handleVerifyCode,
              disabled: !code.trim() || isLoading,
              children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.ActivityIndicator, { color: "#fff" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.buttonText, children: "Verify Code" })
            }
          )
        ] }),
        authState.step === "error" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_native.Text, { style: styles.errorText, children: authState.message })
      ] })
    }
  );
}
var styles = import_react_native.StyleSheet.create({
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
//# sourceMappingURL=index.js.map