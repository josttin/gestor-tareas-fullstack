// src/components/FormattedDate.tsx
'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
// Corregido: La función ahora se llama 'toZonedTime'
import { toZonedTime } from 'date-fns-tz';

interface Props {
    dateString: string;
}

export const FormattedDate = ({ dateString }: Props) => {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        try {
            const utcDate = new Date(dateString);
            const timeZone = 'America/Bogota';

            // Corregido: Usamos 'toZonedTime'
            const zonedDate = toZonedTime(utcDate, timeZone);

            const pattern = 'dd/MM/yyyy, h:mm:ss a';
            // Corregido: El objeto de opciones ya no es necesario aquí
            const output = format(zonedDate, pattern);

            setFormattedDate(output);
        } catch (error) {
            setFormattedDate(dateString);
        }
    }, [dateString]);

    return <>{formattedDate}</>;
};