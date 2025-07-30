// =============================================================================
// FEATURE CONSTANTS AND TYPES
// =============================================================================

/**
 * Standard disconnect feature identifier.
 * 
 * This feature allows apps to request cleanup operations from wallets.
 * 
 * @group Disconnect Feature
 */
export const StandardDisconnect = 'standard:disconnect';

/**
 * Version of the standard disconnect feature.
 * 
 * @group Disconnect Feature
 */
export type StandardDisconnectVersion = '1.0.0';

// =============================================================================
// CORE FEATURE INTERFACE
// =============================================================================

/**
 * Standard disconnect feature implementation.
 * 
 * This feature allows the app to request cleanup operations from the wallet.
 * The wallet should perform any necessary cleanup but should not revoke
 * authorization to previously granted accounts.
 * 
 * @example
 * ```typescript
 * const wallet: WalletWithFeatures<StandardDisconnectFeature> = {
 *   // ... other wallet properties
 *   features: {
 *     'standard:disconnect': {
 *       version: '1.0.0',
 *       disconnect: async () => {
 *         // Perform cleanup operations
 *         await clearTemporaryData();
 *         await closeConnections();
 *       }
 *     }
 *   }
 * };
 * ```
 * 
 * @group Disconnect Feature
 */
export type StandardDisconnectFeature = {
    /** Standard disconnect feature implementation. */
    readonly [StandardDisconnect]: {
        /** Version of the feature implemented by the wallet. */
        readonly version: StandardDisconnectVersion;
        /** Method to request cleanup operations. */
        readonly disconnect: StandardDisconnectMethod;
    };
};

// =============================================================================
// METHOD TYPE
// =============================================================================

/**
 * Method to request cleanup operations from the wallet.
 * 
 * This method should perform any necessary cleanup operations such as:
 * - Clearing temporary data or caches
 * - Closing network connections
 * - Resetting internal state
 * 
 * Note: This should NOT revoke authorization to accounts previously granted
 * through the connect feature. Account authorization should persist until
 * explicitly revoked by the user.
 * 
 * @returns Promise that resolves when cleanup is complete.
 * 
 * @example
 * ```typescript
 * // Request cleanup from wallet
 * await wallet.features['standard:disconnect'].disconnect();
 * console.log('Wallet cleanup completed');
 * ```
 * 
 * @group Disconnect Method
 */
export type StandardDisconnectMethod = () => Promise<void>;

// =============================================================================
// DEPRECATED ALIASES
// =============================================================================

/**
 * @deprecated Use {@link StandardDisconnect} instead.
 * 
 * Legacy feature identifier for backward compatibility.
 * 
 * @group Deprecated
 */
export const Disconnect = StandardDisconnect;

/**
 * @deprecated Use {@link StandardDisconnectFeature} instead.
 * 
 * Legacy feature type for backward compatibility.
 * 
 * @group Deprecated
 */
export type DisconnectFeature = StandardDisconnectFeature;

/**
 * @deprecated Use {@link StandardDisconnectVersion} instead.
 * 
 * Legacy version type for backward compatibility.
 * 
 * @group Deprecated
 */
export type DisconnectVersion = StandardDisconnectVersion;

/**
 * @deprecated Use {@link StandardDisconnectMethod} instead.
 * 
 * Legacy method type for backward compatibility.
 * 
 * @group Deprecated
 */
export type DisconnectMethod = StandardDisconnectMethod;
