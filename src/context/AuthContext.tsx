import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
    id: number;
    email: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<{ message: string }>;
    recoverPassword: (email: string) => Promise<{ message: string }>;
    resetPassword: (token: string, password: string) => Promise<{ message: string }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

const API_BASE = `${window.location.origin}/php`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar sesión al cargar
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`${API_BASE}/login.php`, { method: "POST" }); // Un login vacío o check_auth.php
                // Para simplificar, asumimos que el usuario sigue en localStorage si no cerramos sesión,
                // pero lo ideal es un check_auth.php en el servidor.
                const storedUser = localStorage.getItem("tabsystem_user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error("Error checking session", err);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

        setUser(data.user);
        localStorage.setItem("tabsystem_user", JSON.stringify(data.user));
    };

    const register = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/register.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al registrarse");
        return data;
    };

    const recoverPassword = async (email: string) => {
        const res = await fetch(`${API_BASE}/recover.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al solicitar recuperación");
        return data;
    };

    const resetPassword = async (token: string, password: string) => {
        const res = await fetch(`${API_BASE}/reset.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al restablecer contraseña");
        return data;
    };

    const logout = async () => {
        await fetch(`${API_BASE}/logout.php`, { method: "POST", credentials: "include" });
        setUser(null);
        localStorage.removeItem("tabsystem_user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                recoverPassword,
                resetPassword,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
