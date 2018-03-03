/**
 * Interface for objects that supply a function to sanitize user input strings.
 */
export interface ISanitizer {
  /**
   * Sanitize input string
   */
  sanitize(input: string): string;

  /**
   * Sanitizes a flat map with the mapped sanitize functions
   *
   * @param sanitizeMap The functions to use to sanitize different keys
   * @param newData The flat map to sanitize
   * @returns an array of key-value objects
   */
  sanitizeMap(sanitizeMap: any, newData: any): {[key: string]: any};
}
