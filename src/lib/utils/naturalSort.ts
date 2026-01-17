/**
 * Natural sort comparison function
 * Sorts strings containing numbers in a human-friendly way
 * Example: "Tent-1", "Tent-2", "Tent-10" instead of "Tent-1", "Tent-10", "Tent-2"
 */
export function naturalSort(a: string, b: string): number {
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.match(regex) || [];
    const bParts = b.match(regex) || [];

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || '';
        const bPart = bParts[i] || '';

        // Check if both parts are numbers
        const aNum = parseInt(aPart, 10);
        const bNum = parseInt(bPart, 10);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            // Both are numbers, compare numerically
            if (aNum !== bNum) {
                return aNum - bNum;
            }
        } else {
            // At least one is not a number, compare as strings
            if (aPart !== bPart) {
                return aPart.localeCompare(bPart);
            }
        }
    }

    return 0;
}

/**
 * Sort an array of objects by a property using natural sort
 */
export function naturalSortBy<T>(array: T[], key: keyof T): T[] {
    return [...array].sort((a, b) => {
        const aValue = String(a[key]);
        const bValue = String(b[key]);
        return naturalSort(aValue, bValue);
    });
}
