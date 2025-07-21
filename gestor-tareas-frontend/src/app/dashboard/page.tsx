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
import { DatePicker } from "@/components/ui/DatePicker";
import { TasksStatusPieChart } from "@/components/charts/TasksStatusPieChart";
import { TasksByDeptBarChart } from "@/components/charts/TasksByDeptBarChart";
import { TasksByUserBarChart } from "@/components/charts/TasksByUserBarChart";
import { AvgTimeBarChart } from "@/components/charts/AvgTimeBarChart";

// --- INTERFACES ---
interface Task {
    id: number;
    titulo: string;
    descripcion: string;
    estado: 'pendiente' | 'en_progreso' | 'completada';
    nombre_asignado: string;
    fecha_limite: string;
}
interface Employee {
    id: number;
    nombre_completo: string;
    departamento_id: number | null;
}
interface Department {
    id: number;
    nombre: string;
    lider_id: number | null;
}
interface Solicitud {
    id: number;
    tipo: string;
    motivo: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    nombre_solicitante?: string;
    titulo_tarea: string;
    fecha_sugerida?: string;
}
interface NewTaskPayload {
    titulo: string;
    descripcion: string;
    asignado_id?: string;
    departamento_id?: string;
    fecha_limite?: Date;
}
interface UpdateSolicitudPayload {
    estado: 'aprobada' | 'rechazada';
    fecha_limite_final?: Date;
}
interface TasksByStatus {
    estado: 'pendiente' | 'en_progreso' | 'completada';
    count: string;
}

interface TasksByDepartment {
    nombre: string;
    count: string;
}

interface TasksByUser {
    name: string;
    count: string;
}

interface AvgCompletionTime {
    name: string;
    avg_duration: {
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
    } | null;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // --- ESTADOS ---
    const [tasksData, setTasksData] = useState<{ tareas: Task[], currentPage: number, totalPages: number }>({ tareas: [], currentPage: 1, totalPages: 1 });
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [mySolicitudes, setMySolicitudes] = useState<Solicitud[]>([]);
    const [stats, setStats] = useState<{
        tasksByStatus: TasksByStatus[],
        tasksByDepartment: TasksByDepartment[],
        tasksCompletedByUser: TasksByUser[],
        avgCompletionTime: AvgCompletionTime[]
    } | null>(null);
    const [newTask, setNewTask] = useState({ titulo: '', descripcion: '', asignado_id: '', departamento_id: '' });
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [solicitudMotivo, setSolicitudMotivo] = useState('');
    const [taskDueDate, setTaskDueDate] = useState<Date | undefined>();
    const [solicitudFechaSugerida, setSolicitudFechaSugerida] = useState<Date | undefined>();
    const [assignType, setAssignType] = useState('empleado');
    const [departmentTasks, setDepartmentTasks] = useState<Task[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');


    // --- FUNCIÓN DE CARGA DE DATOS ACTUALIZADA ---
    const fetchData = useCallback(async () => {
        try {
            if (user?.rol === 'jefe') {
                const params = new URLSearchParams();
                params.append('page', currentPage.toString());
                params.append('limit', '5');
                if (employeeFilter) params.append('empleadoId', employeeFilter);
                if (departmentFilter) params.append('departamentoId', departmentFilter);

                const [tasksRes, employeesRes, deptoRes, solRes, statsRes] = await Promise.all([
                    api.get(`/tareas?${params.toString()}`),
                    api.get('/usuarios/empleados'),
                    api.get('/departamentos'),
                    api.get('/solicitudes'),
                    api.get('/dashboard/stats')
                ]);

                setTasksData(tasksRes.data);
                setEmployees(employeesRes.data);
                setDepartments(deptoRes.data);
                setSolicitudes(solRes.data);
                setStats(statsRes.data); // <-- Guarda las estadísticas

            } else if (user?.rol === 'empleado') {
                const [tasksRes, mySolRes, depTasksRes] = await Promise.all([
                    api.get('/tareas/mis-tareas'),
                    api.get('/solicitudes/mis-solicitudes'),
                    api.get('/tareas/departamento')
                ]);
                setMyTasks(tasksRes.data);
                setMySolicitudes(mySolRes.data);
                setDepartmentTasks(depTasksRes.data);
            }
        } catch (error) {
            console.error("Error al cargar los datos del dashboard", error);
            toast.error("No se pudieron cargar los datos del dashboard.");
        }
    }, [user, currentPage, employeeFilter, departmentFilter]);

    useEffect(() => {
        if (user) { fetchData(); }
    }, [user, fetchData]);


    // --- OTRAS FUNCIONES (SIN CAMBIOS) ---
    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDepartmentName) return;
        try {
            await api.post('/departamentos', { nombre: newDepartmentName });
            setNewDepartmentName('');
            fetchData();
            toast.success("Departamento creado.");
        } catch (error) {
            console.error("Error al crear departamento", error);
            toast.error("Error al crear el departamento.");
        }
    };

    const handleDeleteDepartment = async (id: number) => {
        try {
            await api.delete(`/departamentos/${id}`);
            fetchData();
            toast.success("Departamento eliminado.");
        } catch (error) {
            console.error("Error al eliminar departamento", error);
            toast.error("Error al eliminar el departamento.");
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: NewTaskPayload = {
                titulo: newTask.titulo,
                descripcion: newTask.descripcion,
                fecha_limite: taskDueDate,
            };

            if (assignType === 'empleado') {
                payload.asignado_id = newTask.asignado_id;
            } else {
                payload.departamento_id = newTask.departamento_id;
            }

            await api.post('/tareas', payload);
            setNewTask({ titulo: '', descripcion: '', asignado_id: '', departamento_id: '' });
            setTaskDueDate(undefined);
            fetchData();
            toast.success("Tarea creada exitosamente.");
        } catch (error) {
            console.error("Error al crear la tarea", error);
            toast.error("Error al crear la tarea.");
        }
    };

    const handleAssignDepartment = async (employeeId: number, departmentId: string) => {
        const depId = departmentId ? parseInt(departmentId) : null;
        try {
            await api.put(`/usuarios/${employeeId}/departamento`, { departamento_id: depId });
            toast.success("Departamento asignado.");
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp.id === employeeId ? { ...emp, departamento_id: depId } : emp
                )
            );
        } catch (error) {
            toast.error("Error al asignar departamento.");
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await api.put(`/tareas/${taskId}`, { estado: newStatus });
            fetchData();
        } catch (error) {
            console.error("Error al actualizar el estado", error);
        }
    };

    const handleUpdateRequestStatus = async (id: number, estado: 'aprobada' | 'rechazada', fechaFinal?: Date) => {
        try {
            const payload: UpdateSolicitudPayload = { estado };
            if (estado === 'aprobada' && fechaFinal) {
                payload.fecha_limite_final = fechaFinal;
            }

            await api.put(`/solicitudes/${id}`, payload);
            toast.success("Solicitud Actualizada");
            setSolicitudFechaSugerida(undefined);
            fetchData();
        } catch (error) {
            toast.error("Error al actualizar la solicitud.");
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
                tarea_id: taskId,
                fecha_sugerida: solicitudFechaSugerida
            });
            toast.success("Solicitud enviada");
            setSolicitudMotivo('');
            setSolicitudFechaSugerida(undefined);
            fetchData();
        } catch (error) {
            toast.error("Error", { description: "No se pudo enviar la solicitud." });
        }
    };

    const handleAssignLeader = async (departmentId: number, leaderId: string) => {
        try {
            const lider_id = leaderId ? parseInt(leaderId) : null;
            await api.put(`/departamentos/${departmentId}/lider`, { lider_id });
            toast.success("Líder de departamento actualizado.");
            fetchData();
        } catch (error) {
            toast.error("Error al asignar el líder.");
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
                <>
                    {/* --- NUEVO PANEL DE MÉTRICAS --- */}
                    {stats && (
                        <Card className="col-span-1 md:col-span-2 mb-8">
                            <CardHeader><CardTitle>Métricas Generales</CardTitle></CardHeader>
                            {/* Cambia a 2 columnas */}
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-center">Tareas por Estado</h3>
                                    <TasksStatusPieChart data={stats.tasksByStatus} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-center">Completadas por Empleado</h3>
                                    <TasksByUserBarChart data={stats.tasksCompletedByUser} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-center">Tareas por Departamento</h3>
                                    <TasksByDeptBarChart data={stats.tasksByDepartment} />
                                </div>
                                {/* --- NUEVO GRÁFICO --- */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-center">Tiempo Promedio por Tarea</h3>
                                    <AvgTimeBarChart data={stats.avgCompletionTime} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* --- El resto del grid con las otras tarjetas --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* --- SECCIÓN DE GESTIÓN DE TAREAS --- */}
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle>Gestión de Tareas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-8 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-3">Crear Nueva Tarea</h3>
                                    <form onSubmit={handleCreateTask} className="space-y-4">
                                        <RadioGroup defaultValue="empleado" onValueChange={setAssignType} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="empleado" id="r1" /><Label htmlFor="r1">Por Empleado</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="departamento" id="r2" /><Label htmlFor="r2">Por Departamento</Label></div>
                                        </RadioGroup>
                                        <Input type="text" placeholder="Título de la tarea" value={newTask.titulo} onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })} required />
                                        <Textarea placeholder="Descripción (opcional)" value={newTask.descripcion} onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })} />
                                        <DatePicker date={taskDueDate} setDate={setTaskDueDate} placeholder="Selecciona una fecha de entrega" />
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
                                </div>

                                <div className="flex gap-4 my-4">
                                    <select onChange={(e) => { setEmployeeFilter(e.target.value); setCurrentPage(1); }} value={employeeFilter} className="w-full p-2 border rounded">
                                        <option value="">Filtrar por Empleado</option>
                                        {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>))}
                                    </select>
                                    <select onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }} value={departmentFilter} className="w-full p-2 border rounded">
                                        <option value="">Filtrar por Departamento</option>
                                        {departments.map(dep => (<option key={dep.id} value={dep.id}>{dep.nombre}</option>))}
                                    </select>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Asignado a</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fecha Límite</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasksData.tareas.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/tarea/${task.id}`} className="font-medium hover:underline">
                                                        {task.titulo}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{task.nombre_asignado}</TableCell>
                                                <TableCell>{task.estado}</TableCell>
                                                <TableCell>
                                                    {task.fecha_limite ? new Date(task.fecha_limite).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        disabled={tasksData.currentPage <= 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm">Página {tasksData.currentPage} de {tasksData.totalPages}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={tasksData.currentPage >= tasksData.totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

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
                                            <TableHead>Líder Asignado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departments.map((dept) => (
                                            <TableRow key={dept.id}>
                                                <TableCell>{dept.nombre}</TableCell>
                                                {/* --- NUEVO SELECT PARA LÍDER --- */}
                                                <TableCell>
                                                    <select
                                                        value={dept.lider_id || ''}
                                                        onChange={(e) => handleAssignLeader(dept.id, e.target.value)}
                                                        className="p-2 rounded border"
                                                    >
                                                        <option value="">Sin Líder</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                                                        ))}
                                                    </select>
                                                </TableCell>
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
                                                {sol.fecha_sugerida && <p className="text-sm"><b>Fecha Sugerida:</b> {new Date(sol.fecha_sugerida).toLocaleDateString()}</p>}
                                                <p className="text-sm mt-1">{sol.motivo}</p>
                                                <div className="flex gap-2 mt-3">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm">Aprobar</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Aprobar Solicitud</DialogTitle>
                                                                <DialogDescription>
                                                                    El empleado sugiere la fecha: {sol.fecha_sugerida ? new Date(sol.fecha_sugerida).toLocaleDateString() : 'N/A'}.
                                                                    Puedes aceptar esta fecha o proponer una nueva.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DatePicker
                                                                date={solicitudFechaSugerida}
                                                                setDate={setSolicitudFechaSugerida}
                                                                placeholder="Elige la fecha final"
                                                            />
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button onClick={() => handleUpdateRequestStatus(sol.id, 'aprobada', solicitudFechaSugerida)}>Confirmar Aprobación</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateRequestStatus(sol.id, 'rechazada')}>Rechazar</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {user?.rol === 'empleado' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Mis Tareas Asignadas</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                        <TableHead>Fecha Límite</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myTasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">No tienes tareas asignadas.</TableCell>
                                        </TableRow>
                                    ) : (
                                        myTasks.map((task) => (
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
                                                            <DatePicker date={solicitudFechaSugerida} setDate={setSolicitudFechaSugerida} placeholder="Selecciona una fecha sugerida" />
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
                                                <TableCell>
                                                    {task.fecha_limite ? new Date(task.fecha_limite).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

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

                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Tareas de Mi Departamento</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha Límite</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departmentTasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">No hay tareas asignadas a tu departamento.</TableCell>
                                        </TableRow>
                                    ) : (
                                        departmentTasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/tarea/${task.id}`} className="font-medium hover:underline">
                                                        {task.titulo}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{task.descripcion}</TableCell>
                                                <TableCell>
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
                                                <TableCell>
                                                    {task.fecha_limite ? new Date(task.fecha_limite).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
