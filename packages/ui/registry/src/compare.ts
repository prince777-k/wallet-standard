import type { IdentifierArray } from '@wallet-standard/base';

/**
 * Determines if two IdentifierArrays are different, ignoring duplicate items and order.
 * Note: Does not optimize with length check due to possible duplicates.
 */
export function identifierArraysAreDifferent(a: IdentifierArray, b: IdentifierArray): boolean {
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) return true;
    for (const item of setA) {
        if (!setB.has(item)) return true;
    }
    return false;
}
