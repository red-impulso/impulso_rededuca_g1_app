import { redirect } from "next/navigation";

// La raíz lleva al inicio del panel
export default function RootPage() {
    redirect("/inicio");
}
