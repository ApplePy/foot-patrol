/**
 * Interface for objects that supply a function to sanitize user input strings.
 */
export interface ISanitizer {
  /**
   * Sanitize input string
   */
  sanitize(input: string): string;
}
