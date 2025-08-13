import type { WalletAccount } from '@wallet-standard/base';

// =============================================================================
// FEATURE CONSTANTS AND TYPES
// =============================================================================

/**
 * Standard connect feature identifier.
 * 
 * This feature allows apps to obtain authorization to use wallet accounts.
 * 
 * @group Connect Feature
 */
export const StandardConnect = 'standard:connect';

/**
 * Version of the standard connect feature.
 * 
 * @group Connect Feature
 */
export type StandardConnectVersion = '1.0.0';

// =============================================================================
// CORE FEATURE INTERFACE
// =============================================================================

/**
 * Standard connect feature implementation.
 * 
 * This feature allows the app to obtain authorization to use wallet accounts.
 * The wallet may prompt the user for permission or return previously authorized accounts.
 * 
 * @example
 * ```typescript
 * const wallet: WalletWithFeatures<StandardConnectFeature> = {
 *   // ... other wallet properties
 *   features: {
 *     'standard:connect': {
 *       version: '1.0.0',
 *       connect: async (input) => {
 *         const accounts = await requestUserPermission();
 *         return { accounts };
 *       }
 *     }
 *   }
 * };
 * ```
 * 
 * @group Connect Feature
 */
export type StandardConnectFeature = {
    /** Standard connect feature implementation. */
    readonly [StandardConnect]: {
        /** Version of the feature implemented by the wallet. */
        readonly version: StandardConnectVersion;
        /** Method to request account authorization. */
        readonly connect: StandardConnectMethod;
    };
};

// =============================================================================
// METHOD AND I/O TYPES
// =============================================================================

/**
 * Method to request account authorization from the wallet.
 * 
 * @param input - Optional input parameters for the connect request.
 * @returns Promise resolving to the connect output with authorized accounts.
 * 
 * @group Connect Method
 */
export type StandardConnectMethod = (input?: StandardConnectInput) => Promise<StandardConnectOutput>;

/**
 * Input parameters for the connect method.
 * 
 * @group Connect Input
 */
export interface StandardConnectInput {
    /**
     * Silent mode flag for authorization requests.
     * 
     * By default, the connect method should prompt the user to request authorization.
     * Set this flag to `true` to request accounts that have already been authorized
     * without prompting the user.
     * 
     * This flag is optional and wallets may or may not use it. Apps should not
     * depend on this flag being honored by all wallets.
     * 
     * @example
     * ```typescript
     * // Request previously authorized accounts without prompting
     * const result = await wallet.features['standard:connect'].connect({ silent: true });
     * 
     * // Request accounts with user prompt (default behavior)
     * const result = await wallet.features['standard:connect'].connect();
     * ```
     */
    readonly silent?: boolean;
}

/**
 * Output from the connect method.
 * 
 * Contains the list of accounts that the app has been authorized to use.
 * 
 * @group Connect Output
 */
export interface StandardConnectOutput {
    /**
     * List of accounts that the app has been authorized to use.
     * 
     * These accounts can be used for signing transactions, messages, and other
     * wallet operations that the wallet supports.
     * 
     * @example
     * ```typescript
     * const { accounts } = await wallet.features['standard:connect'].connect();
     * console.log(`Authorized ${accounts.length} accounts`);
     * accounts.forEach(account => {
     *   console.log(`Account: ${account.address}`);
     * });
     * ```
     */
    readonly accounts: readonly WalletAccount[];
}

// =============================================================================
// DEPRECATED ALIASES
// =============================================================================

/**
 * @deprecated Use {@link StandardConnect} instead.
 * 
 * Legacy feature identifier for backward compatibility.
 * 
 * @group Deprecated
 */
export const Connect = StandardConnect;

/**
 * @deprecated Use {@link StandardConnectFeature} instead.
 * 
 * Legacy feature type for backward compatibility.
 * 
 * @group Deprecated
 */
export type ConnectFeature = StandardConnectFeature;

/**
 * @deprecated Use {@link StandardConnectVersion} instead.
 * 
 * Legacy version type for backward compatibility.
 * 
 * @group Deprecated
 */
export type ConnectVersion = StandardConnectVersion;

/**
 * @deprecated Use {@link StandardConnectMethod} instead.
 * 
 * Legacy method type for backward compatibility.
 * 
 * @group Deprecated
 */
export type ConnectMethod = StandardConnectMethod;

/**
 * @deprecated Use {@link StandardConnectInput} instead.
 * 
 * Legacy input type for backward compatibility.
 * 
 * @group Deprecated
 */
export type ConnectInput = StandardConnectInput;

/**
 * @deprecated Use {@link StandardConnectOutput} instead.
 * 
 * Legacy output type for backward compatibility.
 * 
 * @group Deprecated
 */
export type ConnectOutput = StandardConnectOutput;
