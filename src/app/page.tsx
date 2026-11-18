import { redirect } from "next/navigation";

// Sin esto, la validación de "instant navigation" de Next 16 intenta renderizar
// esta página, se encuentra con el redirect y lo muestra como error en desarrollo.
export const instant = false;

// La raíz lleva al inicio del panel
export default function RootPage() {
    redirect("/inicio");
}
