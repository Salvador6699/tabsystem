import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const RecoverView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { recoverPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsPending(true);
        try {
            const res = await recoverPassword(email);
            setSuccess(res.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsPending(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="Email enviado">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-foreground font-medium">{success}</p>
                    <button
                        onClick={onBack}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 mt-4 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Login
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Recuperar Contraseña"
            subtitle="Te enviaremos un enlace para restablecer tu clave"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tu Email</label>
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

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Enlace'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 mt-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Cancelar y volver
                </button>
            </form>
        </AuthLayout>
    );
};
