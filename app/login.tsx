import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const router = useRouter();
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the actual login function from AuthContext
      await login(email, password);
      
      // Navigate to home after successful login
      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setSocialLoading(provider);
      
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'facebook') {
        await signInWithFacebook();
      }
      
      // Navigate to home after successful social login
      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      Alert.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`, 
        error.message || `Something went wrong with ${provider} login`
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const isSocialLoading = (provider: 'google' | 'facebook') => socialLoading === provider;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[COLORS.background.white, COLORS.background.white, COLORS.primary.red]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with local logo using require() */}
            <View style={styles.headerContainer}>
              <View style={styles.logoTitleContainer}>
                <Image
                  source={require('../local-assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.appName}>ResQ</Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !socialLoading}
                  placeholderTextColor={COLORS.text.tertiary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading && !socialLoading}
                  placeholderTextColor={COLORS.text.tertiary}
                />
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={isLoading || !!socialLoading}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity disabled={isLoading || !!socialLoading}>
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, (isLoading || socialLoading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading || !!socialLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>New user? </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/register')}
                  disabled={isLoading || !!socialLoading}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialLogosContainer}>
                <TouchableOpacity 
                  style={[
                    styles.socialLogoButton,
                    isSocialLoading('facebook') && styles.buttonDisabled
                  ]}
                  onPress={() => handleSocialLogin('facebook')}
                  disabled={isLoading || !!socialLoading}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }}
                    style={styles.socialLogo}
                  />
                  {isSocialLoading('facebook') && (
                    <View style={styles.socialLoadingOverlay}>
                      <Text style={styles.socialLoadingText}>...</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.socialLogoButton,
                    isSocialLoading('google') && styles.buttonDisabled
                  ]}
                  onPress={() => handleSocialLogin('google')}
                  disabled={isLoading || !!socialLoading}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                    style={styles.socialLogo}
                  />
                  {isSocialLoading('google') && (
                    <View style={styles.socialLoadingOverlay}>
                      <Text style={styles.socialLoadingText}>...</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Loading indicator for social login */}
              {(socialLoading) && (
                <View style={styles.socialLoadingContainer}>
                  <Text style={styles.socialLoadingMessage}>
                    Signing in with {socialLoading}...
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginRight: 5,
  },
  appName: {
    fontSize: 70,
    fontWeight: '800',
    color: COLORS.primary.red,
    letterSpacing: 1,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.primary.red,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.white,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary.red,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary.red,
    backgroundColor: COLORS.primary.red,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.text.white,
    borderRadius: 2,
  },
  rememberMeText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary.red,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: COLORS.primary.gold,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.primary.red,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.light,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  socialLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    position: 'relative',
  },
  socialLogoButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: COLORS.background.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  socialLogo: {
    width: 30,
    height: 30,
  },
  socialLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLoadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary.red,
  },
  socialLoadingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  socialLoadingMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});