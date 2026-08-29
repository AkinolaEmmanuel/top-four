'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, fetchCurrentProfile, signIn as apiSignIn, signOut as apiSignOut } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (credentials: Parameters<typeof apiSignIn>[0]) => Promise<void>;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await fetchCurrentProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (credentials: Parameters<typeof apiSignIn>[0]) => {
    // 1. Authenticate (backend sets HttpOnly cookie)
    await apiSignIn(credentials);
    
    // 2. Explicitly call GET /auth/me with credentials included (apiFetch already includes them)
    // We only proceed if this succeeds (returns 200 and a profile)
    const profile = await fetchCurrentProfile();
    if (!profile) {
      throw new Error('Session verification failed after login');
    }
    
    setUser(profile);
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const refetchUser = async () => {
    try {
      const profile = await fetchCurrentProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to refetch session:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
