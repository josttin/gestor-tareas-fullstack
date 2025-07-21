// src/components/charts/TasksByUserBarChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    count: string;
}

// Función auxiliar para abreviar nombres
const abreviarNombre = (nombre: string, maxLength: number) => {
    if (nombre.length <= maxLength) {
        return nombre;
    }
    return nombre.substring(0, maxLength) + '...';
};

export const TasksByUserBarChart = ({ data }: { data: ChartData[] }) => {
    const chartData = data.map(item => ({
        name: abreviarNombre(item.name, 4), // Abreviamos el nombre en el eje Y
        fullName: item.name, // Guardamos el nombre completo para el tooltip
        completadas: parseInt(item.count, 10),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} />
                {/* El tooltip ahora mostrará el nombre completo */}
                <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                <Legend />
                <Bar dataKey="completadas" fill="#82ca9d" name="Tareas Completadas" />
            </BarChart>
        </ResponsiveContainer>
    );
};