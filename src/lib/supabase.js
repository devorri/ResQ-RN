import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-url-polyfill/auto';

// Let Expo complete any pending OAuth session
WebBrowser.maybeCompleteAuthSession();

// Get values from app.config.js
const SUPABASE_URL = Constants.expoConfig.extra.supabaseUrl;
const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;

// 👇 Create a deep link that Supabase will redirect back to
const redirectTo = Linking.createURL('/auth/callback');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // 👈 must be true for OAuth
    flowType: 'pkce', // recommended for mobile apps
    redirectTo, // 👈 this is what fixes the redirect
  },
});
