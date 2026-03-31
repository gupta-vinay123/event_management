import { createContext, useContext, useState, useCallback } from 'react';
const AuthContext = createContext(null);


const TOKEN_KEY = 'ep_token';    
const USER_KEY  = 'ep_user';

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [user,  setUser]  = useState(() => {
        try {
            const stored = localStorage.getItem(USER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback((userData) => {
        const { token, ...userInfo } = userData;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        setToken(token);
        setUser(userInfo);
    }, []);


    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        
    }, []);


    const isLoggedIn = !!token;
    const isAdmin    = user?.role === 'admin';

    const value = {
        user,       
        token,     
        isLoggedIn, 
        isAdmin,    
        login,      
        logout,     
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside <AuthProvider>. Check your index.js.');
    }
    return context;
};
