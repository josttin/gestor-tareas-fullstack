// src/app/dashboard/tarea/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormattedDate } from '@/components/FormattedDate';
import Link from 'next/link';

interface Task {
    id: number;
    titulo: string;
    descripcion: string;
    estado: 'pendiente' | 'en_progreso' | 'completada';
}
interface Comment {
    id: number;
    contenido: string | null;
    autor: string;
    fecha_creacion: string;
    // Propiedades del archivo adjunto
    nombre_archivo: string | null;
    url: string | null;
}

export default function TareaDetailPage() {
    const params = useParams();
    const taskId = params.id;
    const [task, setTask] = useState<Task | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchData = useCallback(async () => {
        if (!taskId) return;
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
    }, [taskId]);
    useEffect(() => { if (taskId) { fetchData(); } }, [fetchData, taskId]);

    const handleAddComment = async () => {
        if (!newComment && !selectedFile) return;

        const formData = new FormData();
        if (newComment) formData.append('contenido', newComment);
        if (selectedFile) formData.append('archivo', selectedFile);

        try {
            await api.post(`/tareas/${taskId}/comentarios`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewComment('');
            setSelectedFile(null);
            fetchData();
            toast.success("Comentario añadido.");
        } catch (error) {
            toast.error("No se pudo añadir el comentario.");
        }
    };

    if (!task) return <div>Cargando...</div>;

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
                    {/* LISTA DE COMENTARIOS Y ARCHIVOS */}
                    <div className="space-y-4 mb-6">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-4">
                                <Avatar><AvatarFallback>{comment.autor.substring(0, 2)}</AvatarFallback></Avatar>
                                <div className="w-full">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{comment.autor}</p>
                                        <p className="text-xs text-gray-500"><FormattedDate dateString={comment.fecha_creacion} /></p>
                                    </div>
                                    {comment.contenido && <p className="p-3 bg-gray-100 rounded-md mt-1 dark:bg-gray-800">{comment.contenido}</p>}
                                    {comment.url && (
                                        <a href={comment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-1 block">
                                            {comment.nombre_archivo}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* NUEVO FORMULARIO UNIFICADO */}
                    <div className="border-t pt-4">
                        <Textarea
                            placeholder="Escribe tu informe o comentario aquí..."
                            value={newComment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                            className="mb-2"
                        />
                        <div className="flex justify-between items-center">
                            <Input type="file" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="max-w-xs" />
                            <Button onClick={handleAddComment}>Añadir</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}