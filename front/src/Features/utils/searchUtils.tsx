/**
 * Обработчик изменения строки поиска.
 * Преобразует значение в нижний регистр и убирает пробелы по краям.
 * 
 * @param {string} searchValue - Значение поискового запроса.
 * @returns {string} - Очищенная строка поиска.
 */
export const normalizeSearchQuery = (searchValue: string): string => {
  return searchValue.trim().toLowerCase();
};

/**
 * Фильтрует массив элементов по заданному ключу, проверяя, содержит ли он подстроку из поиска.
 * 
 * @param {T[]} items - Список элементов для фильтрации.
 * @param {string} searchQuery - Строка поиска.
 * @param {keyof T} key - Поле, по которому производится поиск (например, "name").
 * @returns {T[]} - Отфильтрованный список элементов.
 */
export const filterItemsBySearch = <T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  key: keyof T
): T[] => {
  return items.filter((item) =>
    String(item[key]).toLowerCase().includes(searchQuery)
  );
};

