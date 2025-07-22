// src/app/dashboard/admin/usuarios/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Interfaz de Usuario (sin cambios)
interface User { id: number; nombre_completo: string; email: string; rol: 'jefe' | 'empleado'; }

// Esquema de validación con Zod
const formSchema = z.object({
    nombre_completo: z.string().min(3, { message: "El nombre es demasiado corto." }),
    email: z.string().email({ message: "Email inválido." }),
    rol: z.enum(["jefe", "empleado"]),
});

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/usuarios');
            setUsers(res.data);
        } catch (error) {
            toast.error("No se pudo cargar la lista de usuarios.");
        }
    }, []);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    const handleDeleteUser = async (userId: number) => {
        try {
            await api.delete(`/usuarios/${userId}`);
            toast.success("Usuario eliminado exitosamente.");
            fetchUsers(); // Recargar la lista
        } catch (error) {
            toast.error("Error al eliminar el usuario.");
        }
    };

    // Abre el panel y establece los valores del formulario
    const handleEditClick = (user: User) => {
        setEditingUser(user);
        form.reset({
            nombre_completo: user.nombre_completo,
            email: user.email,
            rol: user.rol,
        });
        setIsSheetOpen(true);
    };

    // Función de envío del formulario de edición
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!editingUser) return;
        try {
            await api.put(`/usuarios/${editingUser.id}`, values);
            toast.success("Usuario actualizado exitosamente.");
            setIsSheetOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error("Error al actualizar el usuario.");
        }
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/dashboard"><Button variant="outline">{"< Volver al Dashboard"}</Button></Link>
            </div>
            <Card>
                <CardHeader><CardTitle>Administración de Usuarios</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.nombre_completo}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.rol}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                                            Editar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">Eliminar</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción es permanente y eliminará al usuario {user.nombre_completo}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                                        Sí, eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* --- PANEL DE EDICIÓN REFACTORIZADO --- */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Usuario</SheetTitle>
                        <SheetDescription>
                            Realiza cambios en el perfil del usuario. Haz clic en guardar cuando termines.
                        </SheetDescription>
                    </SheetHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-4">
                            <FormField
                                control={form.control}
                                name="nombre_completo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="empleado">Empleado</SelectItem>
                                                <SelectItem value="jefe">Jefe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Guardar Cambios</Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>
        </div>
    );
}