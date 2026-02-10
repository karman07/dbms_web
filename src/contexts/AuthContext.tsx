import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginDto, RegisterUserDto, FirebaseLoginDto } from '@/types/user';
import authService from '@/services/auth.service';
import userService from '@/services/user.service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginDto) => Promise<void>;
    register: (data: RegisterUserDto) => Promise<void>;
    firebaseLogin: (data: FirebaseLoginDto) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token) {
                // 1. Optimistically set user from local storage
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Failed to parse stored user", e);
                    }
                }

                // 2. Validate/Refresh from API in background
                try {
                    const userData = await userService.getProfile();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error: any) {
                    console.error("Failed to restore auth session:", error);
                    // Only clear if stricly 401/403
                    if (error?.response?.status === 401 || error?.statusCode === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };

        initAuth();

        // Still listen to storage events for cross-tab sync
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    setUser(null);
                } else {
                    initAuth();
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, []);

    const login = async (data: LoginDto) => {
        const response = await authService.login(data);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
        }
    };

    const register = async (data: RegisterUserDto) => {
        const response = await authService.register(data);
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
        }
    };

    const firebaseLogin = async (data: FirebaseLoginDto) => {
        const response = await authService.firebaseLogin(data);
        if (response.token) {
            setUser(response.user);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        // Optional: Navigate to home?
        window.location.href = '/';
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep storage in sync
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            firebaseLogin,
            logout,
            updateUser,
            isAuthenticated: !!user
        }}>
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
