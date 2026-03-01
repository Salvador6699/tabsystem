import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterView: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsPending(true);
        try {
            const res = await register(email, password);
            setSuccess(res.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsPending(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="¡Registro casi listo!">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-foreground font-medium">{success}</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 mt-4"
                    >
                        Ir al Login
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Crear Cuenta"
            subtitle="Únete a TabSystem para guardar tus datos en la nube"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrarse'}
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        {"¿Ya tienes cuenta? "}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-primary font-medium hover:underline"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};
