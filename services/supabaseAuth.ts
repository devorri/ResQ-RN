import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Add this for OAuth
WebBrowser.maybeCompleteAuthSession();

// Create the redirect URI for OAuth
const createRedirectUri = () => {
  return AuthSession.makeRedirectUri({
    scheme: 'myapp',
    path: 'auth/callback',
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const supabaseAuthService = {
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          first_name: userData.firstName,
          last_name: userData.lastName,
          gender: userData.gender,
          contact_number: userData.contactNumber,
          address: {
            house_number: userData.houseNumber,
            street: userData.street,
            barangay: userData.barangay,
            city: userData.city,
            province: userData.province,
            country: userData.country,
            zip_code: userData.zipCode,
          }
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: any) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Google OAuth
  async signInWithGoogle() {
    const redirectUri = createRedirectUri();
    console.log('Google Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (result.type === 'success') {
        // The session is automatically handled by Supabase when redirecting back
        // We just need to get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        return sessionData;
      } else if (result.type === 'cancel') {
        throw new Error('Google authentication was cancelled');
      } else {
        throw new Error('Google authentication failed');
      }
    }
    throw new Error('No authentication URL received');
  },

  // Facebook OAuth
  async signInWithFacebook() {
    const redirectUri = createRedirectUri();
    console.log('Facebook Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (result.type === 'success') {
        // The session is automatically handled by Supabase when redirecting back
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        return sessionData;
      } else if (result.type === 'cancel') {
        throw new Error('Facebook authentication was cancelled');
      } else {
        throw new Error('Facebook authentication failed');
      }
    }
    throw new Error('No authentication URL received');
  }
};