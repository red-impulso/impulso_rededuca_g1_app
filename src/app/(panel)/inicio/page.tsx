import { HomeScreen } from "@/components/home/home-screen";

// El layout del panel carga la sesión antes de mostrar la página, así que Next
// no puede validarla como "navegación instantánea": se excluye de esa validación
export const instant = false;

export default function InicioPage() {
  return <HomeScreen />;
}
