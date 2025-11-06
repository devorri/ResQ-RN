import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing authentication...');
        
        // Wait for Supabase to process the auth state
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Redirect to login - user can log in with their verified account
        console.log('✅ Authentication complete! Redirecting to login...');
        router.replace('/login' as any);
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        router.replace('/login' as any);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#e74c3c" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#333' }}>
        Completing authentication...
      </Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }}>
        Please wait while we verify your account
      </Text>
    </View>
  );
}