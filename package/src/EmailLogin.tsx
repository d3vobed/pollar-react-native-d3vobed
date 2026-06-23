import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { usePollar } from './usePollar'

interface EmailLoginProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function EmailLogin({ onSuccess, onError }: EmailLoginProps) {
  const { authState, beginEmailLogin, sendEmailCode, verifyEmailCode, isAuthenticated } = usePollar()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [flowStarted, setFlowStarted] = useState(false)

  const handleSendCode = useCallback(() => {
    if (!email.trim()) return
    if (!flowStarted) {
      beginEmailLogin()
    }
    sendEmailCode(email.trim())
    setFlowStarted(true)
  }, [email, beginEmailLogin, sendEmailCode, flowStarted])

  const handleVerifyCode = useCallback(() => {
    if (!code.trim()) return
    verifyEmailCode(code.trim())
  }, [code, verifyEmailCode])

  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.()
    }
  }, [isAuthenticated, onSuccess])

  useEffect(() => {
    if (authState.step === 'error') {
      onError?.(new Error(authState.message))
    }
  }, [authState, onError])

  const isLoading =
    authState.step === 'sending_email' ||
    authState.step === 'verifying_email_code' ||
    authState.step === 'creating_session' ||
    authState.step === 'authenticating'

  const showCodeInput = authState.step === 'entering_code' || authState.step === 'verifying_email_code'
  const showEmailInput = !showCodeInput

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign in with Email</Text>
        <Text style={styles.subtitle}>
          {showCodeInput
            ? 'Enter the verification code sent to your email'
            : 'Enter your email to receive a verification code'}
        </Text>

        {showEmailInput && (
          <>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.button, (!email.trim() || isLoading) && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={!email.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {showCodeInput && (
          <>
            <Text style={styles.emailDisplay}>{email}</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.button, (!code.trim() || isLoading) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={!code.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {authState.step === 'error' && (
          <Text style={styles.errorText}>{authState.message}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#0560a9',
    borderRadius: 12,
    justifyContent: 'center',
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
  emailDisplay: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
})
