// src/app/dashboard/layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    )
}