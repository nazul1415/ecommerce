import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const storedUser = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        // Clean up in case of corruption
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Validate against hardcoded static credentials
    if (email === 'admin@ecommerce.com' && password === 'Admin123!') {
      const mockUser: User = {
        email: 'admin@ecommerce.com',
        role: 'admin',
      };
      
      const mockToken = 'mock-jwt-token-for-admin-session-12345';

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('admin_user', JSON.stringify(mockUser));
      localStorage.setItem('admin_token', mockToken);
      return true;
    }
    
    throw new Error('Incorrect credentials. Please try again.');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
