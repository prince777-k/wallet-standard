/**
 * Mutable properties that should be excluded from readonly byte arrays.
 * 
 * These properties allow modification of the underlying array data,
 * which is not allowed for readonly byte arrays.
 */
type TypedArrayMutableProperties = 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort';

/**
 * A read-only byte array that prevents mutation of the underlying data.
 * 
 * This type extends Uint8Array but excludes all mutable methods and properties,
 * ensuring that the byte data cannot be modified after creation. This is crucial
 * for blockchain applications where data integrity is paramount.
 * 
 * Used throughout the wallet standard for representing immutable byte data
 * such as public keys, transaction signatures, and other cryptographic data.
 * 
 * @example
 * ```typescript
 * const publicKey: ReadonlyUint8Array = new Uint8Array([1, 2, 3, 4]);
 * // publicKey[0] = 5; // TypeScript error - cannot modify readonly array
 * // publicKey.fill(0); // TypeScript error - method not available
 * ```
 * 
 * @group Bytes
 */
export interface ReadonlyUint8Array extends Omit<Uint8Array, TypedArrayMutableProperties> {
    /**
     * Read-only access to byte values by index.
     * 
     * @param index - The index of the byte to access.
     * @returns The byte value at the specified index.
     */
    readonly [n: number]: number;
}

export {};
