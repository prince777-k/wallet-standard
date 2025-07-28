import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/**
 * Base implementation of a {@link "@wallet-standard/base".WalletAccount} to be used or extended by a
 * {@link "@wallet-standard/base".Wallet}.
 *
 * `WalletAccount` properties must be read-only. This class enforces this by making all properties
 * [truly private](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) and
 * read-only, using getters for access, returning copies instead of references, and calling
 * [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
 * on the instance.
 *
 * @group Account
 */
export class ReadonlyWalletAccount implements WalletAccount {
    readonly #address: WalletAccount['address'];
    readonly #publicKey: ReadonlyUint8Array;
    readonly #chains: readonly string[];
    readonly #features: readonly string[];
    readonly #label?: string;
    readonly #icon?: string;

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.address | WalletAccount::address} */
    get address(): string {
        return this.#address;
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.publicKey | WalletAccount::publicKey} */
    get publicKey(): ReadonlyUint8Array {
        return this.#publicKey.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.chains | WalletAccount::chains} */
    get chains(): readonly string[] {
        return this.#chains.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.features | WalletAccount::features} */
    get features(): readonly string[] {
        return this.#features.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.label | WalletAccount::label} */
    get label(): string | undefined {
        return this.#label;
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.icon | WalletAccount::icon} */
    get icon(): string | undefined {
        return this.#icon;
    }

    /**
     * Create and freeze a read-only account.
     *
     * @param account Account to copy properties from.
     * @throws {Error} If the account is invalid or missing required properties.
     */
    constructor(account: WalletAccount) {
        // Validate required properties
        if (!account?.address) {
            throw new Error('WalletAccount must have a valid address');
        }
        if (!account.publicKey || account.publicKey.length === 0) {
            throw new Error('WalletAccount must have a valid publicKey');
        }
        if (!Array.isArray(account.chains) || account.chains.length === 0) {
            throw new Error('WalletAccount must have at least one supported chain');
        }
        if (!Array.isArray(account.features)) {
            throw new Error('WalletAccount must have a valid features array');
        }

        // Deep freeze the instance for immutability
        if (new.target === ReadonlyWalletAccount) {
            Object.freeze(this);
        }

        this.#address = account.address;
        this.#publicKey = new Uint8Array(account.publicKey);
        this.#chains = [...account.chains];
        this.#features = [...account.features];
        this.#label = account.label;
        this.#icon = account.icon;
    }
}

/**
 * Efficiently compare {@link Indexed} arrays (e.g. `Array` and `Uint8Array`) with optimized performance.
 *
 * @param a An array to compare.
 * @param b Another array to compare.
 *
 * @return `true` if the arrays have the same length and elements, `false` otherwise.
 *
 * @group Util
 */
export function arraysEqual<T>(a: Indexed<T>, b: Indexed<T>): boolean {
    // Early return for same reference
    if (a === b) return true;

    // Validate inputs
    if (!a || !b) return false;

    const length = a.length;
    if (length !== b.length) return false;

    // Use native TypedArray comparison for better performance
    if (a instanceof Uint8Array && b instanceof Uint8Array) {
        return a.every((value, index) => value === b[index]);
    }

    // Fallback to manual comparison
    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

/**
 * Efficiently compare byte arrays with optimized performance for cryptographic operations.
 *
 * @param a A byte array to compare.
 * @param b Another byte array to compare.
 *
 * @return `true` if the byte arrays have the same length and bytes, `false` otherwise.
 *
 * @group Util
 */
export function bytesEqual(a: ReadonlyUint8Array, b: ReadonlyUint8Array): boolean {
    return arraysEqual(a, b);
}

/**
 * Efficiently concatenate byte arrays without modifying the original arrays.
 * Optimized for cryptographic operations with minimal memory allocation.
 *
 * @param first  The first byte array.
 * @param others Additional byte arrays to concatenate.
 *
 * @return New byte array containing the concatenation of all the byte arrays.
 *
 * @group Util
 */
export function concatBytes(first: ReadonlyUint8Array, ...others: ReadonlyUint8Array[]): Uint8Array {
    // Validate inputs
    if (!first) {
        throw new Error('First byte array is required');
    }

    // Calculate total length for pre-allocation
    const totalLength = others.reduce((length, bytes) => {
        if (!bytes) {
            throw new Error('All byte arrays must be valid');
        }
        return length + bytes.length;
    }, first.length);

    // Pre-allocate the result array for better performance
    const result = new Uint8Array(totalLength);
    
    // Copy first array
    result.set(first, 0);
    
    // Copy remaining arrays
    let offset = first.length;
    for (const other of others) {
        result.set(other, offset);
        offset += other.length;
    }

    return result;
}

/**
 * Create a new object with a subset of fields from a source object.
 * Provides type safety and validation.
 *
 * @param source Object to pick fields from.
 * @param keys   Names of fields to pick.
 *
 * @return New object with only the picked fields.
 *
 * @group Util
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
    source: T,
    ...keys: K[]
): Pick<T, K> {
    // Validate inputs
    if (!source || typeof source !== 'object') {
        throw new Error('Source must be a valid object');
    }
    if (!keys.length) {
        throw new Error('At least one key must be provided');
    }

    const picked = {} as Pick<T, K>;
    
    for (const key of keys) {
        if (key in source) {
            picked[key] = source[key];
        }
    }
    
    return picked;
}

/**
 * Call a callback function with comprehensive error handling and logging.
 * Provides structured error reporting for debugging.
 *
 * @param callback Function to call.
 * @param context Optional context for error reporting.
 *
 * @group Util
 */
export function guard(callback: () => void, context?: string): void {
    try {
        callback();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const contextPrefix = context ? `[${context}] ` : '';
        console.error(`${contextPrefix}Error in guarded callback:`, errorMessage);
        
        // Re-throw in development for better debugging
        if (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__) {
            throw error;
        }
    }
}

/**
 * Create a deep copy of a WalletAccount with validation.
 * Useful for creating immutable copies of account data.
 *
 * @param account The account to copy.
 * @return A new ReadonlyWalletAccount instance.
 *
 * @group Util
 */
export function createReadonlyAccount(account: WalletAccount): ReadonlyWalletAccount {
    return new ReadonlyWalletAccount(account);
}

/**
 * Validate if an object implements the WalletAccount interface.
 *
 * @param account The object to validate.
 * @return `true` if the object is a valid WalletAccount, `false` otherwise.
 *
 * @group Util
 */
export function isValidWalletAccount(account: any): account is WalletAccount {
    return (
        account &&
        typeof account === 'object' &&
        typeof account.address === 'string' &&
        account.address.length > 0 &&
        account.publicKey instanceof Uint8Array &&
        account.publicKey.length > 0 &&
        Array.isArray(account.chains) &&
        account.chains.length > 0 &&
        Array.isArray(account.features)
    );
}

/**
 * @internal
 *
 * Type with a numeric `length` and numerically indexed elements of a generic type `T`.
 * Used for efficient array operations and type safety.
 *
 * For example, `Array<T>` and `Uint8Array`.
 *
 * @group Internal
 */
export interface Indexed<T> {
    readonly length: number;
    readonly [index: number]: T;
}
