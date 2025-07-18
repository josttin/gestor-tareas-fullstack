// src/app/dashboard/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// --- INTERFACES (AÑADIMOS DEPARTAMENTO) ---
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
}
interface Department {
    id: number;
    nombre: string;
}
interface Solicitud {
    id: number;
    tipo: string;
    motivo: string;
    estado: string;
    nombre_solicitante: string;
    titulo_tarea: string;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // --- ESTADOS (AÑADIMOS DEPARTAMENTOS) ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ titulo: '', descripcion: '', asignado_id: '' });
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

    // --- FUNCIÓN DE CARGA DE DATOS ACTUALIZADA ---
    const fetchData = useCallback(async () => {
        try {
            if (user?.rol === 'jefe') {
                const [tasksRes, employeesRes, deptoRes] = await Promise.all([
                    api.get('/tareas'),
                    api.get('/usuarios/empleados'),
                    api.get('/departamentos') // <-- Carga los departamentos
                ]);
                setTasks(tasksRes.data);
                setEmployees(employeesRes.data);
                setDepartments(deptoRes.data);
            } else if (user?.rol === 'empleado') {
                const tasksRes = await api.get('/tareas/mis-tareas');
                setTasks(tasksRes.data);
            }
        } catch (error) {
            console.error("Error al cargar los datos del dashboard", error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

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

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tareas', newTask);
            setShowTaskForm(false); // Oculta el formulario
            setNewTask({ titulo: '', descripcion: '', asignado_id: '' }); // Limpia el formulario
            fetchData(); // Vuelve a cargar las tareas para mostrar la nueva
        } catch (error) {
            console.error("Error al crear la tarea", error);
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

            {/* ---------- VISTA DEL JEFE ---------- */}
            {user?.rol === 'jefe' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- SECCIÓN DE GESTIÓN DE TAREAS --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Tareas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <Button onClick={() => setShowTaskForm(!showTaskForm)} variant="secondary">
                                    {showTaskForm ? 'Cancelar' : 'Crear Nueva Tarea'}
                                </Button>
                                {showTaskForm && (
                                    <form onSubmit={handleCreateTask} className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                                        <div className="mb-4">
                                            <label className="block mb-2 text-sm font-medium">Título</label>
                                            <Input type="text" value={newTask.titulo} onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })} required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block mb-2 text-sm font-medium">Descripción</label>
                                            <Input value={newTask.descripcion} onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })} />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block mb-2 text-sm font-medium">Asignar a:</label>
                                            <select value={newTask.asignado_id} onChange={(e) => setNewTask({ ...newTask, asignado_id: e.target.value })} className="w-full p-2 border rounded" required>
                                                <option value="">Selecciona un empleado</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button type="submit">Guardar Tarea</Button>
                                    </form>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Lista de Tareas del Sistema</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Asignado a</TableHead>
                                            <TableHead>Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>{task.titulo}</TableCell>
                                                <TableCell>{task.nombre_asignado}</TableCell>
                                                <TableCell>{task.estado}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* --- NUEVA SECCIÓN DE GESTIÓN DE DEPARTAMENTOS --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Departamentos</CardTitle>
                        </CardHeader>
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

                    {/* --- NUEVA COLUMNA 3: SOLICITUDES PENDIENTES --- */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Solicitudes Pendientes</CardTitle>
                            <CardDescription>Aprueba o rechaza las solicitudes de tu equipo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {solicitudes.length === 0 ? (
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
                            )}
                        </CardContent>
                    </Card>

                </div>
            )}

            {/* ---------- VISTA DEL EMPLEADO ---------- */}
            {user?.rol === 'empleado' && (
                <div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Mis Tareas Asignadas</h2>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center">No tienes tareas asignadas.</TableCell>
                                            </TableRow>
                                        ) : (
                                            tasks.map((task) => (
                                                <TableRow key={task.id}>
                                                    <TableCell className="font-medium">{task.titulo}</TableCell>
                                                    <TableCell>{task.descripcion}</TableCell>
                                                    <TableCell className="text-right">
                                                        <select
                                                            value={task.estado}
                                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                            className="p-2 rounded border bg-white dark:bg-gray-800"
                                                        >
                                                            <option value="pendiente">Pendiente</option>
                                                            <option value="en_progreso">En Progreso</option>
                                                            <option value="completada">Completada</option>
                                                        </select>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}