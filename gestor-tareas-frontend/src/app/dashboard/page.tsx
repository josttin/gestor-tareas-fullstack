// src/app/dashboard/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// --- INTERFACES CORREGIDAS ---
interface Task {
    id: number;
    titulo: string;
    descripcion: string;
    estado: 'pendiente' | 'en_progreso' | 'completada';
    nombre_asignado: string;
}
interface Employee {
    id: number;
    nombre_completo: string;
    departamento_id: number | null;
}
interface Department {
    id: number;
    nombre: string;
}
interface Solicitud {
    id: number;
    tipo: string;
    motivo: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    nombre_solicitante?: string;
    titulo_tarea: string;
}
interface NewTaskPayload {
    titulo: string;
    descripcion: string;
    asignado_id?: string;
    departamento_id?: string;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // --- ESTADOS (AÑADIMOS DEPARTAMENTOS) ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [mySolicitudes, setMySolicitudes] = useState<Solicitud[]>([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ titulo: '', descripcion: '', asignado_id: '', departamento_id: '' });
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [solicitudMotivo, setSolicitudMotivo] = useState('');
    const [assignType, setAssignType] = useState('empleado');
    // --- FUNCIÓN DE CARGA DE DATOS ACTUALIZADA ---

    const fetchData = useCallback(async () => {
        try {
            if (user?.rol === 'jefe') {
                const [tasksRes, employeesRes, deptoRes, solRes] = await Promise.all([ // <-- Añade solRes
                    api.get('/tareas'),
                    api.get('/usuarios/empleados'),
                    api.get('/departamentos'),
                    api.get('/solicitudes')
                ]);
                setTasks(tasksRes.data);
                setEmployees(employeesRes.data);
                setDepartments(deptoRes.data);
                setSolicitudes(solRes.data);
            } else if (user?.rol === 'empleado') {
                const tasksRes = await api.get('/tareas/mis-tareas');
                setTasks(tasksRes.data);
            }
        } catch (error) {
            console.error("Error al cargar los datos del dashboard", error);
        }
    }, [user]);

    useEffect(() => { if (user) { fetchData(); } }, [user, fetchData]);

    // --- NUEVAS FUNCIONES PARA DEPARTAMENTOS ---
    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDepartmentName) return;
        try {
            await api.post('/departamentos', { nombre: newDepartmentName });
            setNewDepartmentName('');
            fetchData(); // Recarga todos los datos
        } catch (error) {
            console.error("Error al crear departamento", error);
        }
    };

    const handleDeleteDepartment = async (id: number) => {
        try {
            await api.delete(`/departamentos/${id}`);
            fetchData(); // Recarga todos los datos
        } catch (error) {
            console.error("Error al eliminar departamento", error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // --- FUNCIÓN DE CREAR TAREA ACTUALIZADA ---
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: NewTaskPayload = { titulo: newTask.titulo, descripcion: newTask.descripcion };
            if (assignType === 'empleado') {
                payload.asignado_id = newTask.asignado_id;
            } else {
                payload.departamento_id = newTask.departamento_id;
            }

            await api.post('/tareas', payload);
            setShowTaskForm(false);
            setNewTask({ titulo: '', descripcion: '', asignado_id: '', departamento_id: '' });
            fetchData();
            toast.success("Tarea creada exitosamente.");
        } catch (error) {
            console.error("Error al crear la tarea", error);
            toast.error("Error al crear la tarea.");
        }
    };

    const handleAssignDepartment = async (employeeId: number, departmentId: string) => {
        try {
            const depId = departmentId ? parseInt(departmentId) : null;
            await api.put(`/usuarios/${employeeId}/departamento`, { departamento_id: depId });
            toast.success("Departamento asignado.");
            fetchData();
        } catch (error) {
            toast.error("Error al asignar departamento.");
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await api.put(`/tareas/${taskId}`, { estado: newStatus });
            fetchData(); // Recargamos las tareas para ver el cambio
        } catch (error) {
            console.error("Error al actualizar el estado", error);
        }
    };

    const handleUpdateRequestStatus = async (id: number, estado: 'aprobada' | 'rechazada') => {
        try {
            await api.put(`/solicitudes/${id}`, { estado });
            toast.success("Solicitud Actualizada", {
                description: `La solicitud ha sido ${estado}.`,
            });
            fetchData(); // Recarga los datos para que la solicitud desaparezca de la lista
        } catch (error) {
            toast.error("Error", {
                description: "No se pudo actualizar la solicitud.",
            });
        }
    };

    const handleCreateRequest = async (taskId: number) => {
        if (!solicitudMotivo) {
            toast.error("Error", { description: "Debes escribir un motivo para la solicitud." });
            return;
        }
        try {
            await api.post('/solicitudes', {
                tipo: 'extension_plazo',
                motivo: solicitudMotivo,
                tarea_id: taskId
            });
            toast.success("Solicitud enviada", { description: "Tu solicitud ha sido enviada para revisión." });
            setSolicitudMotivo('');
            fetchData(); // Recargamos los datos para ver la nueva solicitud en la lista
        } catch (error) {
            toast.error("Error", { description: "No se pudo enviar la solicitud." });
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    Bienvenido, <span className="text-blue-600">{user?.nombre}</span>
                </h1>
                <Button onClick={handleLogout} variant="destructive">
                    Cerrar Sesión
                </Button>
            </div>
            <p className="mb-6">Tu rol es: <strong>{user?.rol}</strong>.</p>

            {user?.rol === 'jefe' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Crear Nueva Tarea</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                {/* --- NUEVO SELECTOR DE TIPO DE ASIGNACIÓN --- */}
                                <RadioGroup defaultValue="empleado" onValueChange={setAssignType} className="flex gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="empleado" id="r1" /><Label htmlFor="r1">Por Empleado</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="departamento" id="r2" /><Label htmlFor="r2">Por Departamento</Label></div>
                                </RadioGroup>

                                <Input type="text" placeholder="Título de la tarea" value={newTask.titulo} onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })} required />
                                <Textarea placeholder="Descripción (opcional)" value={newTask.descripcion} onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })} />

                                {assignType === 'empleado' ? (
                                    <select value={newTask.asignado_id} onChange={(e) => setNewTask({ ...newTask, asignado_id: e.target.value })} className="w-full p-2 border rounded" required>
                                        <option value="">Selecciona un empleado</option>
                                        {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>))}
                                    </select>
                                ) : (
                                    <select value={newTask.departamento_id} onChange={(e) => setNewTask({ ...newTask, departamento_id: e.target.value })} className="w-full p-2 border rounded" required>
                                        <option value="">Selecciona un departamento</option>
                                        {departments.map(dep => (<option key={dep.id} value={dep.id}>{dep.nombre}</option>))}
                                    </select>
                                )}
                                <Button type="submit">Guardar Tarea</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* --- NUEVO PANEL DE GESTIÓN DE EMPLEADOS --- */}
                    <Card>
                        <CardHeader><CardTitle>Gestión de Empleados</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Departamento Asignado</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {employees.map(emp => (
                                        <TableRow key={emp.id}>
                                            <TableCell>{emp.nombre_completo}</TableCell>
                                            <TableCell>
                                                <select
                                                    value={emp.departamento_id || ''}
                                                    onChange={(e) => handleAssignDepartment(emp.id, e.target.value)}
                                                    className="p-2 rounded border"
                                                >
                                                    <option value="">Sin Departamento</option>
                                                    {departments.map(dep => (<option key={dep.id} value={dep.id}>{dep.nombre}</option>))}
                                                </select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Gestión de Departamentos</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateDepartment} className="flex gap-2 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Nombre del nuevo departamento"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                />
                                <Button type="submit">Crear</Button>
                            </form>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>{dept.nombre}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">Eliminar</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará el departamento {dept.nombre}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>
                                                                Continuar
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

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader><CardTitle>Solicitudes Pendientes</CardTitle></CardHeader>
                        <CardContent>{solicitudes.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {solicitudes.map((sol) => (
                                    <div key={sol.id} className="p-3 border rounded">
                                        <p className="font-semibold">{sol.nombre_solicitante}</p>
                                        <p className="text-sm"><b>Tipo:</b> {sol.tipo}</p>
                                        {sol.titulo_tarea && <p className="text-sm"><b>Tarea:</b> {sol.titulo_tarea}</p>}
                                        <p className="text-sm mt-1">{sol.motivo}</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button size="sm" onClick={() => handleUpdateRequestStatus(sol.id, 'aprobada')}>Aprobar</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleUpdateRequestStatus(sol.id, 'rechazada')}>Rechazar</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}</CardContent>
                    </Card>
                </div>
            )}

            {user?.rol === 'empleado' && (
                <div><div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* --- PANEL DE MIS TAREAS --- */}
                    <Card>
                        <CardHeader><CardTitle>Mis Tareas Asignadas</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center">No tienes tareas asignadas.</TableCell></TableRow>
                                    ) : (
                                        tasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/tarea/${task.id}`} className="font-medium hover:underline">
                                                        {task.titulo}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <select value={task.estado} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="p-2 rounded border">
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="en_progreso">En Progreso</option>
                                                        <option value="completada">Completada</option>
                                                    </select>
                                                </TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">Solicitar Extensión</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Solicitar extensión para {task.titulo}</DialogTitle></DialogHeader>
                                                            <DialogDescription>Describe el motivo por el cual necesitas más tiempo.</DialogDescription>
                                                            <Textarea placeholder="Escribe tu motivo aquí..." value={solicitudMotivo} onChange={(e) => setSolicitudMotivo(e.target.value)} />
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button type="button" onClick={() => handleCreateRequest(task.id)}>Enviar Solicitud</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* --- PANEL DE MIS SOLICITUDES --- */}
                    <Card>
                        <CardHeader><CardTitle>Mis Solicitudes</CardTitle></CardHeader>
                        <CardContent>
                            {mySolicitudes.length === 0 ? (<p>No has enviado ninguna solicitud.</p>) : (
                                mySolicitudes.map(sol => (
                                    <div key={sol.id} className="border-b last:border-b-0 py-2">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{sol.titulo_tarea || 'Solicitud General'}</p>
                                            <span className={`px-2 py-1 text-xs rounded-full ${sol.estado === 'aprobada' ? 'bg-green-200 text-green-800' : sol.estado === 'rechazada' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                {sol.estado}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Motivo: {sol.motivo}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div></div>
            )}
        </div>
    );
}