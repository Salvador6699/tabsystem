import React from 'react';
import { Lock } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-6">
                        <img src="/logo.png" alt="TabSystem Logo" className="w-24 h-24 mx-auto rounded-3xl shadow-sm" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    {children}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    &copy; 2024 TabSystem. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
