// src/app/registro/page.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import axios, { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/usuarios/registro', {
                nombre_completo: nombreCompleto,
                email,
                password,
                rol: 'empleado',
            });

            toast.success("¡Registro exitoso!", {
                description: "Ahora puedes iniciar sesión con tus nuevas credenciales.",
            });

            router.push('/login');

        } catch (err) { // Quitamos el ': any'
            if (isAxiosError(err)) {
                // Si es un error de Axios, podemos acceder a 'response' de forma segura
                setError(err.response?.data?.message || 'Error del servidor.');
            } else {
                // Si es otro tipo de error
                setError('Ha ocurrido un error inesperado al registrarse.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Crear una Cuenta</CardTitle>
                    <CardDescription>Regístrate como un nuevo empleado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input id="nombre" type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Registrarse</Button>
                        <div className="text-center text-sm">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:underline">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}