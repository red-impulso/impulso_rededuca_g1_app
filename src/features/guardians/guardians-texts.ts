// Textos literales del SDD (M9)
export const GUARDIANS_TITLE = "Tutores";
export const ADD_GUARDIAN_LABEL = "Agregar tutor";
export const EDIT_GUARDIAN_LABEL = "Editar tutor";
export const GUARDIAN_DETAIL_LABEL = "Ver detalle";
export const CONTACT_LABEL = "Contactar";
export const MAKE_PRIMARY_LABEL = "Marcar como principal";
export const UNLINK_LABEL = "Desvincular";
export const SHOW_INACTIVE_LABEL = "Mostrar inactivos";
export const HIDE_INACTIVE_LABEL = "Ocultar inactivos";
export const GROUP_LABELS = { primary: "Tutor principal", secondary: "Tutor secundario", others: "Otros contactos autorizados" } as const;
export const RELATIONSHIP_LABELS = {
    madre: "Madre",
    padre: "Padre",
    "tutor-legal": "Tutor legal",
    encargado: "Encargado/a",
    "familiar-autorizado": "Familiar autorizado",
    otro: "Otro",
} as const;
export const LINK_STATUS_LABELS = { active: "Activo", inactive: "Inactivo", pending: "Pendiente" } as const;
export const ROLE_LABELS = { isPrimary: "Principal", isEmergencyContact: "Contacto de emergencia", isFinancialResponsible: "Responsable económico" } as const;
export const GUARDIAN_FIELD_LABELS = {
    firstName: "Nombre",
    lastName: "Apellido",
    dni: "DNI",
    relationship: "Relación",
    email: "Email",
    phone: "Teléfono principal",
    altPhone: "Teléfono alternativo",
    address: "Dirección",
    roles: "Roles",
} as const;
export const PHONE_HELP_TEXT = "10 dígitos, con código de área. Ej.: 3884123456";
export const MODE_LABELS = { new: "Nuevo tutor", existing: "Tutor existente" } as const;
export const SEARCH_GUARDIAN_LABEL = "Buscar por nombre, DNI o correo";
export const NO_CANDIDATES_TEXT = "No encontramos tutores con ese dato.";
export const CANDIDATES_ERROR_TEXT = "No pudimos buscar tutores.";
export const NO_GUARDIANS_TITLE = "Sin tutores vinculados";
export const NO_GUARDIANS_TEXT = "Agrega un tutor para poder contactar a la familia.";
export const GUARDIANS_LOAD_ERROR_TEXT = "No pudimos cargar los tutores.";
export const GUARDIAN_SAVE_ERROR_TEXT = "No se pudo guardar el tutor. Tus datos siguen en el formulario.";
export const GUARDIAN_ADDED_TEXT = "Tutor vinculado";
export const GUARDIAN_UPDATED_TEXT = "Tutor actualizado";
export const GUARDIAN_PRIMARY_TEXT = "Tutor principal actualizado";
export const GUARDIAN_UNLINKED_TEXT = "Tutor desvinculado. Su historial se conserva.";
export const GUARDIAN_ACTION_ERROR_TEXT = "No se pudo completar la acción.";
export const SELECT_GUARDIAN_TEXT = "Elige un tutor de la lista.";
export function unlinkTitle(name: string): string {
    return `¿Desvincular a ${name}?`;
}
export const UNLINK_TEXT = "Dejará de ver la información del alumno. El historial del vínculo se conserva.";
export const UNLINK_PRIMARY_TEXT = "Es el tutor principal. Elige quién pasa a ser principal antes de desvincularlo.";
export const ONLY_PRIMARY_TEXT = "Es el único tutor principal. Agrega otro tutor antes de desvincularlo.";
export const NEW_PRIMARY_LABEL = "Nuevo tutor principal";
export function otherStudentsText(count: number): string {
    return count === 1 ? "Tutor de 1 alumno más" : `Tutor de ${count} alumnos más`;
}
export const NAME_LENGTH_TEXT = "Debe tener entre 2 y 60 caracteres.";
export const DNI_TEXT = "El DNI debe tener 7 u 8 dígitos.";
export const EMAIL_TEXT = "Ingresa un correo válido, por ejemplo nombre@dominio.com.";
export const PHONE_TEXT = "El teléfono debe tener 10 dígitos.";
export const ADDRESS_TEXT = "Máximo 120 caracteres.";
export const REQUIRED_TEXT = "Este campo es obligatorio.";
