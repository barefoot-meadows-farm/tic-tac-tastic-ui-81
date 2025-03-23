
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  isPremium: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Improved AuthProvider with better error handling and session management
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Define function to fetch premium status
    const fetchPremiumStatus = async (userId: string) => {
      try {
        const { data } = await supabase
            .from('subscriptions')
            .select('is_premium')
            .eq('user_id', userId)
            .single();

        if (mounted) {
          setIsPremium(data?.is_premium || false);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    // First immediately check for an existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchPremiumStatus(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Important: Always set loading to false even if there's an error
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Then set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.id);

          if (!mounted) return;

          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchPremiumStatus(currentSession.user.id);
          } else {
            setSession(null);
            setUser(null);
            setIsPremium(false);
          }

          // Always update loading state on auth state change
          if (mounted) {
            setIsLoading(false);
          }
        }
    );

    // Call check session immediately
    checkSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

useEffect(() => {
    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
        console.log('Auth loading safety timeout triggered');
        setIsLoading(false);

        // If we still don't have user data, ensure we're in a "not logged in" state
        // This ensures components waiting for auth know the user isn't authenticated
        setUser(null);
        setSession(null);
    }, 5000); // 5 seconds max loading time

    return () => clearTimeout(loadingTimeout);
}, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created!",
        description: "You've successfully signed up. Welcome!",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            session,
            isLoading,
            signIn,
            signUp,
            signOut,
            isPremium,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
