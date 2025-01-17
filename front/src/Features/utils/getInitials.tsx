export function getInitials(name: string, patronymic: string): string {
    const nameInitial = name ? `${name.charAt(0).toUpperCase()}.` : "";
    const patronymicInitial = patronymic ? `${patronymic.charAt(0).toUpperCase()}.` : "";
    return `${nameInitial} ${patronymicInitial}`.trim();
}