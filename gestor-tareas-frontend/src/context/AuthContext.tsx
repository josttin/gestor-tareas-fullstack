// src/context/AuthContext.tsx
'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Tipos para la data del usuario y el contexto
interface User {
    id: number;
    rol: 'jefe' | 'empleado';
    nombre: string;
}

interface IAuthContext {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

// Crear el contexto con un valor inicial
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// El "Proveedor" del contexto. Este componente envolverá nuestra aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const login = (token: string) => {
        // Guardamos el token en localStorage para persistir la sesión
        localStorage.setItem('token', token);
        const decodedUser: User = jwtDecode(token);
        setUser(decodedUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Opcional: Verificar si ya existe un token al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            login(token);
        }
    }, []);


    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};