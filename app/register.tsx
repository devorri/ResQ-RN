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

type Step = 1 | 2 | 3 | 4;

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other' | '';
  contactNumber: string;
  email: string;
  houseNumber: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  country: string;
  zipCode: string;
}

export default function Register() {
  const router = useRouter();
  const { register, authMode } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '',
    contactNumber: '',
    email: '',
    houseNumber: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    country: '',
    zipCode: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }
    if (!formData.gender) {
      Alert.alert('Validation Error', 'Please select your gender');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.contactNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your contact number');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!formData.houseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your house number');
      return false;
    }
    if (!formData.street.trim()) {
      Alert.alert('Validation Error', 'Please enter your street');
      return false;
    }
    if (!formData.barangay.trim()) {
      Alert.alert('Validation Error', 'Please enter your barangay');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city');
      return false;
    }
    if (!formData.province.trim()) {
      Alert.alert('Validation Error', 'Please enter your province');
      return false;
    }
    if (!formData.country.trim()) {
      Alert.alert('Validation Error', 'Please enter your country');
      return false;
    }
    if (!formData.zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter your ZIP code');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else if (isValid && currentStep === 4) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Create base registration data
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.contactNumber,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        houseNumber: formData.houseNumber,
        street: formData.street,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        zipCode: formData.zipCode,
      };

      const result = await register(registrationData);

      // Handle different success messages based on auth mode
      if (authMode === 'supabase' && result.requiresEmailVerification) {
        Alert.alert(
          'Email Verification Required',
          'Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        // Mock mode - go directly to app
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)' as any),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={styles.stepText}>Step {currentStep} of 4</Text>
      <View style={styles.stepDots}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.stepDot,
              step <= currentStep && styles.stepDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Account Information</Text>
      <Text style={styles.stepSubtitle}>Create your login credentials</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          placeholder="Choose a username"
          value={formData.username}
          onChangeText={(text) => updateField('username', text)}
          autoCapitalize="none"
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your first name"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          autoCapitalize="words"
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your last name"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
          autoCapitalize="words"
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {(['male', 'female', 'other'] as const).map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                formData.gender === gender && styles.genderButtonActive,
              ]}
              onPress={() => updateField('gender', gender)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  formData.gender === gender && styles.genderButtonTextActive,
                ]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contact Details</Text>
      <Text style={styles.stepSubtitle}>How can we reach you?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="+63 912 345 6789"
          value={formData.contactNumber}
          onChangeText={(text) => updateField('contactNumber', text)}
          keyboardType="phone-pad"
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address</Text>
      <Text style={styles.stepSubtitle}>Where do you live?</Text>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>House Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            value={formData.houseNumber}
            onChangeText={(text) => updateField('houseNumber', text)}
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>Street *</Text>
          <TextInput
            style={styles.input}
            placeholder="Main St"
            value={formData.street}
            onChangeText={(text) => updateField('street', text)}
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Barangay *</Text>
        <TextInput
          style={styles.input}
          placeholder="Barangay name"
          value={formData.barangay}
          onChangeText={(text) => updateField('barangay', text)}
          editable={!isLoading}
          placeholderTextColor={COLORS.text.tertiary}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City name"
            value={formData.city}
            onChangeText={(text) => updateField('city', text)}
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>Province *</Text>
          <TextInput
            style={styles.input}
            placeholder="Province name"
            value={formData.province}
            onChangeText={(text) => updateField('province', text)}
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            placeholder="Philippines"
            value={formData.country}
            onChangeText={(text) => updateField('country', text)}
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.label}>ZIP Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="1000"
            value={formData.zipCode}
            onChangeText={(text) => updateField('zipCode', text)}
            keyboardType="numeric"
            editable={!isLoading}
            placeholderTextColor={COLORS.text.tertiary}
          />
        </View>
      </View>
    </View>
  );

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
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Logo */}
            <View style={styles.headerContainer}>
              <View style={styles.logoTitleContainer}>
                <Image
                  source={require('../local-assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.appName}>ResQ</Text>
              </View>
              <Text style={styles.headerSubtitle}>Create your account</Text>
            </View>

            {renderStepIndicator()}

            <View style={styles.form}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.backButton, isLoading && styles.buttonDisabled]}
              onPress={handleBack}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, isLoading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {isLoading ? 'Processing...' : currentStep === 4 ? 'Complete Registration' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border.light,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary.red,
  },
  form: {
    gap: 20,
  },
  stepContainer: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary.red,
    backgroundColor: COLORS.background.white,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary.red,
    borderColor: COLORS.primary.red,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.red,
  },
  genderButtonTextActive: {
    color: COLORS.text.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'transparent',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary.red,
    backgroundColor: COLORS.background.white,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary.red,
  },
  nextButton: {
    flex: 2,
    backgroundColor: COLORS.primary.gold,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});