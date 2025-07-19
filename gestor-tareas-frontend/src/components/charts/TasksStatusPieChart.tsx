// src/components/charts/TasksStatusPieChart.tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    pendiente: '#FFBB28',
    en_progreso: '#0088FE',
    completada: '#00C49F',
};

interface ChartData {
    estado: keyof typeof COLORS;
    count: string;
}

export const TasksStatusPieChart = ({ data }: { data: ChartData[] }) => {
    const chartData = data.map(item => ({
        name: item.estado.charAt(0).toUpperCase() + item.estado.slice(1).replace('_', ' '),
        value: parseInt(item.count, 10),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[data[index].estado]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};