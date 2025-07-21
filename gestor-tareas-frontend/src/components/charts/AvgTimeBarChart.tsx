// src/components/charts/AvgTimeBarChart.tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Duration {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

interface ChartData {
    name: string;
    avg_duration: Duration | null;
}

// Función para convertir la duración a horas totales
const durationToHours = (duration: Duration | null): number => {
    if (!duration) return 0;
    const days = duration.days || 0;
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    return parseFloat((days * 24 + hours + minutes / 60).toFixed(1));
};

export const AvgTimeBarChart = ({ data }: { data: ChartData[] }) => {
    const chartData = data.map(item => ({
        name: item.name.split(' ')[0],
        "horas promedio": durationToHours(item.avg_duration),
        fullName: item.name
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} horas`, props.payload.fullName]} />
                <Legend />
                <Bar dataKey="horas promedio" fill="#ffc658" />
            </BarChart>
        </ResponsiveContainer>
    );
};