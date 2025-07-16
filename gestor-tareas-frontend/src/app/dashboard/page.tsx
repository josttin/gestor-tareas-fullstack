// src/app/dashboard/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// Tipos para los datos
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

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // --- NUEVOS ESTADOS ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ titulo: '', descripcion: '', asignado_id: '' });

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const fetchData = useCallback(async () => {
        try {
            if (user?.rol === 'jefe') {
                const [tasksRes, employeesRes] = await Promise.all([
                    api.get('/tareas'),
                    api.get('/usuarios/empleados')
                ]);
                setTasks(tasksRes.data);
                setEmployees(employeesRes.data);
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

    // --- NUEVA FUNCIÓN PARA MANEJAR EL FORMULARIO ---
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tareas', newTask);
            setShowForm(false); // Oculta el formulario
            setNewTask({ titulo: '', descripcion: '', asignado_id: '' }); // Limpia el formulario
            fetchData(); // Vuelve a cargar las tareas para mostrar la nueva
        } catch (error) {
            console.error("Error al crear la tarea", error);
        }
    };

    // --- NUEVA FUNCIÓN PARA ACTUALIZAR ESTADO (PARA EMPLEADOS) ---
    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await api.put(`/tareas/${taskId}`, { estado: newStatus });
            fetchData(); // Recargamos las tareas para ver el cambio
        } catch (error) {
            console.error("Error al actualizar el estado", error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    Bienvenido, <span className="text-blue-600">{user?.nombre}</span>
                </h1>
                <button onClick={handleLogout} className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700">
                    Cerrar Sesión
                </button>
            </div>
            <p className="mb-6">Tu rol es: <strong>{user?.rol}</strong>.</p>

            {/* ---------- VISTA DEL JEFE ---------- */}
            {user?.rol === 'jefe' && (
                <>
                    {/* --- NUEVO BOTÓN Y FORMULARIO --- */}
                    <div className="mb-6">
                        <button onClick={() => setShowForm(!showForm)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {showForm ? 'Cancelar' : 'Crear Nueva Tarea'}
                        </button>
                        {showForm && (
                            <form onSubmit={handleCreateTask} className="mt-4 p-4 bg-gray-800 rounded">
                                <div className="mb-4">
                                    <label className="block mb-2">Título</label>
                                    <input type="text" value={newTask.titulo} onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })} className="w-full p-2 rounded bg-gray-700" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">Descripción</label>
                                    <textarea value={newTask.descripcion} onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })} className="w-full p-2 rounded bg-gray-700"></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">Asignar a:</label>
                                    <select value={newTask.asignado_id} onChange={(e) => setNewTask({ ...newTask, asignado_id: e.target.value })} className="w-full p-2 rounded bg-gray-700" required>
                                        <option value="">Selecciona un empleado</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Guardar Tarea
                                </button>
                            </form>
                        )}
                    </div>

                    {/* --- LISTA DE TAREAS (SIN CAMBIOS) --- */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Lista de Tareas del Sistema</h2>
                        <div className="bg-white shadow-md rounded p-4 text-gray-900">
                            {tasks.length === 0 ? (
                                <p>No hay tareas en el sistema. ¡Crea una nueva!</p>
                            ) : (
                                <ul>
                                    {tasks.map((task) => (
                                        <li key={task.id} className="border-b last:border-b-0 py-2 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{task.titulo}</p>
                                                <p className="text-sm">Asignada a: <span className="font-semibold">{task.nombre_asignado}</span></p>
                                            </div>
                                            <span className="italic px-2 py-1 bg-gray-200 rounded-full text-sm">{task.estado}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </>
            )}
            {/* ---------- VISTA DEL EMPLEADO ---------- */}
            {user?.rol === 'empleado' && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Mis Tareas Asignadas</h2>
                    <div className="bg-white shadow-md rounded p-4 text-gray-900">
                        {tasks.length === 0 ? (
                            <p>No tienes tareas asignadas.</p>
                        ) : (
                            <ul>
                                {tasks.map((task) => (
                                    <li key={task.id} className="border-b last:border-b-0 py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{task.titulo}</p>
                                            <p className="text-sm">{task.descripcion}</p>
                                        </div>
                                        <div>
                                            <select
                                                value={task.estado}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                className="p-2 rounded border"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en_progreso">En Progreso</option>
                                                <option value="completada">Completada</option>
                                            </select>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}