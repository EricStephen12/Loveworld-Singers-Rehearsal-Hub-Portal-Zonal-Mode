/**
 * Normalizes a string for search by:
 * 1. Converting to lowercase
 * 2. Removing punctuation (non-alphanumeric except spaces)
 * 3. Collapsing multiple spaces into one
 * 4. Trimming whitespace
 * 
 * @param str The string to normalize
 * @returns The normalized string
 */
export const normalizeSearchString = (str: string | null | undefined): string => {
    if (!str) return '';

    return str
        .toLowerCase()
        // Remove punctuation: everything that is not a letter, number, or space
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        // Replace multiple spaces/newlines with a single space
        .replace(/\s+/g, ' ')
        .trim();
};
