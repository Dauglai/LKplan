/**
 * Получает инициалы из имени и отчества.
 * @param name Имя человека.
 * @param patronymic Отчество человека.
 * @returns Строка, содержащая инициалы в формате "И. О.".
 * Если одно из полей пустое, инициалы для него не будут добавлены.
 */
export function getInitials(name: string, patronymic: string): string {
    const nameInitial = name ? `${name.charAt(0).toUpperCase()}.` : "";  // Получаем первую букву имени и приводим к верхнему регистру.
    const patronymicInitial = patronymic ? `${patronymic.charAt(0).toUpperCase()}.` : "";  // Получаем первую букву отчества и приводим к верхнему регистру.
    return `${nameInitial} ${patronymicInitial}`.trim();  // Возвращаем строку с инициалами, убирая лишние пробелы.
}
