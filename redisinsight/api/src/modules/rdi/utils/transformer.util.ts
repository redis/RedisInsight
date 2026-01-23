interface ColumnConfig {
  header?: string;
  type?: string;
}

interface Column {
  id: string;
  header: string;
  type?: string;
}

/**
 * Generates a human-readable header from a field name
 * Handles snake_case, kebab-case, camelCase, PascalCase, and space-separated
 * Examples:
 *   'id' -> 'Id'
 *   'age_sec' -> 'Age sec'
 *   'age-sec' -> 'Age sec'
 *   'ageSec' -> 'Age sec'
 *   'user' -> 'User'
 */
export const generateHeaderFromFieldName = (fieldName: string): string => {
  const normalized = fieldName
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .replace(/[_-]/g, ' ') // snake_case, kebab-case -> space separated
    .toLowerCase() // convert all to lowercase
    .replace(/\s+/g, ' ') // normalize multiple spaces
    .trim();

  // Capitalize only the first letter
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

/**
 * Generates column definitions from data entries
 * @param data - Array of data objects
 * @param customColumns - Optional custom column definitions to override auto-generated ones
 *                        Can be a string (header only) or an object with header and type
 */
export const generateColumns = (
  data: Record<string, unknown>[],
  customColumns?: Record<string, string | ColumnConfig>,
): Column[] => {
  if (!data?.length) {
    return [];
  }

  return Object.keys(data[0]).map((fieldName) => {
    const customConfig = customColumns?.[fieldName];
    const config: ColumnConfig =
      typeof customConfig === 'string'
        ? { header: customConfig }
        : customConfig || {};

    return {
      id: fieldName,
      header: config.header || generateHeaderFromFieldName(fieldName),
      ...(config.type && { type: config.type }),
    };
  });
};
