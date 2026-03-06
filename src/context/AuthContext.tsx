import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
    id: number;
    email: string;
    username: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<{ message: string }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

const isLocal = window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.endsWith(".local");

const AUTH_CREDENTIALS = "plantr753:zGTk9J8N";
const AUTH_URL = `${window.location.protocol}//${AUTH_CREDENTIALS}@www.plantrabajo.com.mialias.net/`;

// Detectar ruta del proyecto dinamícamente
const pathParts = window.location.pathname.split('/');
const projectPath = pathParts.slice(0, pathParts.length - 2).join('/');

// URL limpia sin credenciales. Usamos el protocolo actual.
const API_BASE = isLocal
    ? `${window.location.origin.replace(":5173", "")}${projectPath}/php`
    : `${window.location.protocol}//www.plantrabajo.com.mialias.net/php`;

// Generar cabeceras de autenticación básica para CDMon
const getAuthHeaders = (): Record<string, string> => {
    if (isLocal) return {};
    return {
        "Authorization": `Basic ${btoa(AUTH_CREDENTIALS)}`
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Forzar el uso de la URL base en producción mediante redirección única
    useEffect(() => {
        if (isLocal) return;

        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParam = urlParams.get("auth") === "1";

        // Redirigimos para asegurar que el parámetro esté presente
        if (!hasAuthParam) {
            window.location.href = `${AUTH_URL}?auth=1`;
        }
    }, []);

    // Verificar sesión al cargar
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Intentamos verificar con el servidor primero para estar seguros
                const res = await fetch(`${API_BASE}/verify_session.php`, {
                    headers: getAuthHeaders(),
                    credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    localStorage.setItem("tabsystem_user", JSON.stringify(data.user));
                } else {
                    // Si el servidor dice que no hay sesión, limpiamos local
                    setUser(null);
                    localStorage.removeItem("tabsystem_user");
                }
            } catch (err) {
                console.error("Error checking session", err);
                // Si hay error de red, confiamos en lo que tengamos en local temporalmente
                const storedUser = localStorage.getItem("tabsystem_user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/login.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

        setUser(data.user);
        localStorage.setItem("tabsystem_user", JSON.stringify(data.user));
    };

    const register = async (email: string, password: string, username: string) => {
        const res = await fetch(`${API_BASE}/register.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({ email, password, username }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al registrarse");
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/logout.php`, {
                method: "POST",
                headers: getAuthHeaders(),
                credentials: "include"
            });
        } catch (e) {
            console.error("Logout fetch failed", e);
        }
        setUser(null);
        localStorage.removeItem("tabsystem_user");

        // Al salir, redirigimos de nuevo a la URL base con credenciales para que CDMon no las pida al volver a entrar
        if (isLocal) {
            window.location.reload();
        } else {
            window.location.href = `${AUTH_URL}?auth=1`;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
