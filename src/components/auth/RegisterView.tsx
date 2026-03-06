import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { UserPlus, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";

interface RegisterViewProps {
    onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await register(email, password, username);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Error al registrarse");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="¡Cuenta creada!" subtitle="Tu cuenta ha sido creada con éxito">
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Ya puedes iniciar sesión con tus nuevas credenciales.
                    </p>
                    <button
                        onClick={onSwitchToLogin}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Ir al inicio de sesión
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Crea una cuenta" subtitle="Únete a TabSystem para guardar tus datos en la nube">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Usuario</label>
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Tu nombre de usuario"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {isLoading ? "Creando cuenta..." : "Registrarse"}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-primary hover:underline font-medium"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};
