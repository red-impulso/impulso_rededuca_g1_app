import type { ReactNode } from "react";
import { StudentShell } from "@/features/grades/student-shell";

// La ficha del hijo (nombre, curso y pestañas) se arma en el cliente con useParams
export default function StudentLayout({ children }: { children: ReactNode }) {
    return <StudentShell>{children}</StudentShell>;
}
