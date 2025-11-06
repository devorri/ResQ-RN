import { MOCK_USERS } from '@/mocks/data';
import { supabaseAuthService } from '@/services/supabaseAuth';
import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Change this to false to use Supabase
const USE_MOCK_DATA = false;

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        // Your existing mock loading logic
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('user'),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } else {
        // Supabase loading logic
        const session = await supabaseAuthService.getSession();
        if (session?.user) {
          // Convert Supabase user to your User type
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'user',
            station_id: session.user.user_metadata?.station_id || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            is_active: true,
            phone: session.user.user_metadata?.phone || '',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          
          setToken(session.access_token);
          setUser(userData);
          // Store in AsyncStorage for consistency
          await AsyncStorage.setItem('auth_token', session.access_token);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    if (!USE_MOCK_DATA) {
      // Set up auth state listener for Supabase
      const { data: { subscription } } = supabaseAuthService.onAuthStateChange(
        async (event: string, session: Session | null) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setToken(null);
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
          } else if (event === 'SIGNED_IN' && session) {
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || '',
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'user',
              station_id: session.user.user_metadata?.station_id || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              is_active: true,
              phone: session.user.user_metadata?.phone || '',
              created_at: session.user.created_at || new Date().toISOString(),
            };
            
            setToken(session.access_token);
            setUser(userData);
            await AsyncStorage.setItem('auth_token', session.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Your existing mock login
        console.log('[AUTH] login called', { email, password });
        const normalized = email.trim().toLowerCase();
        console.log('[AUTH] normalized email:', normalized);
        const mockUser = MOCK_USERS.find((u) => (u.email ?? '').toLowerCase() === normalized);
        console.log('[AUTH] found mockUser:', mockUser?.email);
        if (!mockUser) throw new Error('Invalid credentials');

        const expected = (mockUser.password ?? 'password');
        console.log('[AUTH] expected password:', expected);
        if (password !== expected) throw new Error('Invalid credentials');
        console.log('[AUTH] password match, signing in', mockUser.id);

        const mockToken = `mock_token_${mockUser.id}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return { user: mockUser, token: mockToken };
      } else {
        // Supabase login
        const { session, user: supabaseUser } = await supabaseAuthService.signIn(email, password);
        
        if (!session || !supabaseUser) {
          throw new Error('Login failed');
        }

        // Check if email is verified
        if (!supabaseUser.email_confirmed_at) {
          throw new Error('Please verify your email before logging in. Check your email for the verification link.');
        }

        const userData: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || '',
          email: supabaseUser.email || '',
          role: supabaseUser.user_metadata?.role || 'user',
          station_id: supabaseUser.user_metadata?.station_id || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          is_active: true,
          phone: supabaseUser.user_metadata?.phone || '',
          created_at: supabaseUser.created_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem('auth_token', session.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(session.access_token);
        setUser(userData);

        return { user: userData, token: session.access_token };
      }
    } catch (err) {
      throw new Error((err as Error).message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    contactNumber?: string;
    houseNumber?: string;
    street?: string;
    barangay?: string;
    city?: string;
    province?: string;
    country?: string;
    zipCode?: string;
  }) => {
    try {
      if (USE_MOCK_DATA) {
        // Mock registration - create user directly
        const newUser: User = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          password: data.password ?? 'password',
          role: 'user',
          station_id: null,
          avatar_url: null,
          is_active: true,
          phone: data.phone,
          created_at: new Date().toISOString(),
        };

        const mockToken = `mock_token_${newUser.id}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setToken(mockToken);
        setUser(newUser);
        return { user: newUser, token: mockToken };
      } else {
        // Supabase registration
        const result = await supabaseAuthService.signUp(
          data.email, 
          data.password, 
          {
            name: data.name,
            phone: data.phone || data.contactNumber,
            username: data.username,
            first_name: data.firstName,
            last_name: data.lastName,
            gender: data.gender,
            contact_number: data.contactNumber,
            house_number: data.houseNumber,
            street: data.street,
            barangay: data.barangay,
            city: data.city,
            province: data.province,
            country: data.country,
            zip_code: data.zipCode,
          }
        );

        if (!result.user) {
          throw new Error('Registration failed - no user returned');
        }

        console.log('Registration successful, user:', result.user);
        
        // For Supabase, return success but indicate email verification is needed
        return { 
          success: true,
          requiresEmailVerification: true,
          message: 'Registration successful! Please check your email to verify your account before signing in.'
        };
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!USE_MOCK_DATA) {
        await supabaseAuthService.signOut();
      }
      
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        const mockUser = MOCK_USERS[0];
        const mockToken = `mock_google_token_${mockUser.id}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return { user: mockUser, token: mockToken };
      } else {
        const sessionData = await supabaseAuthService.signInWithGoogle();
        
        if (!sessionData?.session || !sessionData.session.user) {
          throw new Error('Google login failed - no session');
        }

        const supabaseUser = sessionData.session.user;
        const userData: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
          email: supabaseUser.email || '',
          role: supabaseUser.user_metadata?.role || 'user',
          station_id: supabaseUser.user_metadata?.station_id || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
          is_active: true,
          phone: supabaseUser.user_metadata?.phone || '',
          created_at: supabaseUser.created_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem('auth_token', sessionData.session.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(sessionData.session.access_token);
        setUser(userData);

        return { user: userData, token: sessionData.session.access_token };
      }
    } catch (err) {
      console.error('Google login error:', err);
      throw new Error((err as Error).message || 'Google login failed');
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      if (USE_MOCK_DATA) {
        const mockUser = MOCK_USERS[0];
        const mockToken = `mock_facebook_token_${mockUser.id}`;
        await AsyncStorage.setItem('auth_token', mockToken);
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return { user: mockUser, token: mockToken };
      } else {
        const sessionData = await supabaseAuthService.signInWithFacebook();
        
        if (!sessionData?.session || !sessionData.session.user) {
          throw new Error('Facebook login failed - no session');
        }

        const supabaseUser = sessionData.session.user;
        const userData: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || '',
          email: supabaseUser.email || '',
          role: supabaseUser.user_metadata?.role || 'user',
          station_id: supabaseUser.user_metadata?.station_id || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
          is_active: true,
          phone: supabaseUser.user_metadata?.phone || '',
          created_at: supabaseUser.created_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem('auth_token', sessionData.session.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(sessionData.session.access_token);
        setUser(userData);

        return { user: userData, token: sessionData.session.access_token };
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      throw new Error((err as Error).message || 'Facebook login failed');
    }
  }, []);

  const switchUserRole = useCallback(async (role: 'user' | 'police_station' | 'fire_station' | 'ambulance' | 'admin') => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      role,
      station_id: role !== 'user' && role !== 'admin' ? 1 : null,
    };

    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  return useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      signInWithGoogle,
      signInWithFacebook,
      switchUserRole,
      authMode: USE_MOCK_DATA ? 'mock' : 'supabase' as 'mock' | 'supabase',
    }),
    [
      user, token, isLoading, login, register, logout, 
      signInWithGoogle, signInWithFacebook, switchUserRole
    ]
  );
});