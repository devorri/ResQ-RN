import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/constants/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5m4gym6wul77ezedcbxmv' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>ResQ</Text>
        <Text style={styles.tagline}>Emergency Response System</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: COLORS.text.white,
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: COLORS.primary.lightYellow,
    letterSpacing: 1,
  },
});
