// src/app/dashboard/tarea/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

// Interfaces para los datos
interface Task { id: number; titulo: string; descripcion: string; estado: string; }
interface Comment { id: number; contenido: string; autor: string; fecha_creacion: string; }

export default function TareaDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const taskId = params.id;

    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    const fetchData = async () => {
        try {
            const [taskRes, commentsRes] = await Promise.all([
                api.get(`/tareas/${taskId}`),
                api.get(`/tareas/${taskId}/comentarios`)
            ]);
            setTask(taskRes.data);
            setComments(commentsRes.data);
        } catch (error) {
            console.error("Error al cargar los datos de la tarea", error);
            toast.error("No se pudo cargar la información de la tarea.");
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchData();
        }
    }, [taskId]);

    const handleAddComment = async () => {
        if (!newComment) return;
        try {
            await api.post(`/tareas/${taskId}/comentarios`, { contenido: newComment });
            setNewComment('');
            fetchData(); // Recargar comentarios
            toast.success("Comentario añadido.");
        } catch (error) {
            toast.error("No se pudo añadir el comentario.");
        }
    };

    if (!task) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="p-8">
            <Link href="/dashboard"><Button variant="outline">{"< Volver al Dashboard"}</Button></Link>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-3xl">{task.titulo}</CardTitle>
                    <CardDescription>Estado actual: <span className="font-semibold">{task.estado}</span></CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{task.descripcion}</p>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>Informes y Comentarios</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarFallback>{comment.autor.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="w-full">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{comment.autor}</p>
                                        <p className="text-xs text-gray-500">{new Date(comment.fecha_creacion).toLocaleString()}</p>
                                    </div>
                                    <p className="p-3 bg-gray-100 rounded-md mt-1">{comment.contenido}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Textarea
                            placeholder="Escribe tu informe o comentario aquí..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="mb-2"
                        />
                        <Button onClick={handleAddComment}>Añadir Comentario</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}