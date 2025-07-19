// src/components/charts/TasksByDeptBarChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    nombre: string;
    count: string;
}

export const TasksByDeptBarChart = ({ data }: { data: ChartData[] }) => {
    const chartData = data.map(item => ({
        name: item.nombre,
        tareas: parseInt(item.count, 10),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tareas" fill="#8884d8" name="Nº de Tareas" />
            </BarChart>
        </ResponsiveContainer>
    );
};