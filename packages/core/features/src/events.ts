import type { Wallet } from '@wallet-standard/base';

// =============================================================================
// FEATURE CONSTANTS AND TYPES
// =============================================================================

/**
 * Standard events feature identifier.
 * 
 * This feature allows apps to subscribe to wallet property changes.
 * 
 * @group Events Feature
 */
export const StandardEvents = 'standard:events';

/**
 * Version of the standard events feature.
 * 
 * @group Events Feature
 */
export type StandardEventsVersion = '1.0.0';

// =============================================================================
// CORE FEATURE INTERFACE
// =============================================================================

/**
 * Standard events feature implementation.
 * 
 * This feature allows the app to subscribe to events emitted by the wallet
 * when properties of the wallet change.
 * 
 * @example
 * ```typescript
 * const wallet: WalletWithFeatures<StandardEventsFeature> = {
 *   // ... other wallet properties
 *   features: {
 *     'standard:events': {
 *       version: '1.0.0',
 *       on: (event, listener) => {
 *         // Add listener to internal event system
 *         addListener(event, listener);
 *         // Return unsubscribe function
 *         return () => removeListener(event, listener);
 *       }
 *     }
 *   }
 * };
 * ```
 * 
 * @group Events Feature
 */
export type StandardEventsFeature = {
    /** Standard events feature implementation. */
    readonly [StandardEvents]: {
        /** Version of the feature implemented by the wallet. */
        readonly version: StandardEventsVersion;
        /** Method to subscribe to wallet events. */
        readonly on: StandardEventsOnMethod;
    };
};

// =============================================================================
// EVENT SYSTEM TYPES
// =============================================================================

/**
 * Method to subscribe to wallet events.
 * 
 * @param event - Event type to listen for. Currently only 'change' is supported.
 * @param listener - Function that will be called when the event is emitted.
 * @returns Unsubscribe function to remove the event listener.
 * 
 * @example
 * ```typescript
 * // Subscribe to wallet property changes
 * const unsubscribe = wallet.features['standard:events'].on('change', (properties) => {
 *   console.log('Wallet properties changed:', properties);
 *   if (properties.accounts) {
 *     console.log('Accounts updated:', properties.accounts);
 *   }
 * });
 * 
 * // Later, unsubscribe to prevent memory leaks
 * unsubscribe();
 * ```
 * 
 * @group Events Method
 */
export type StandardEventsOnMethod = <E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E]
) => () => void;

/**
 * Event listener types for the standard events feature.
 * 
 * @group Events Listeners
 */
export interface StandardEventsListeners {
    /**
     * Listener for wallet property changes.
     * 
     * Called when properties of the wallet have changed. Only properties
     * that have actually changed are included in the properties object.
     * 
     * @param properties - Properties that changed with their new values.
     * 
     * @example
     * ```typescript
     * const changeListener = (properties: StandardEventsChangeProperties) => {
     *   if (properties.accounts) {
     *     // Handle account changes
     *     updateUI(properties.accounts);
     *   }
     *   if (properties.chains) {
     *     // Handle chain changes
     *     updateChainSupport(properties.chains);
     *   }
     * };
     * ```
     */
    change(properties: StandardEventsChangeProperties): void;
}

/**
 * Names of events that can be listened for.
 * 
 * @group Events Names
 */
export type StandardEventsNames = keyof StandardEventsListeners;

/**
 * Properties that can change on a wallet.
 * 
 * Only properties that have actually changed are included in change events.
 * Each property contains the new value after the change.
 * 
 * @group Events Properties
 */
export interface StandardEventsChangeProperties {
    /**
     * Chains supported by the wallet.
     * 
     * Only included if the chains property has changed.
     * Contains the new chains array.
     * 
     * @example
     * ```typescript
     * // Wallet now supports additional chains
     * if (properties.chains) {
     *   console.log('New supported chains:', properties.chains);
     * }
     * ```
     */
    readonly chains?: Wallet['chains'];
    
    /**
     * Features supported by the wallet.
     * 
     * Only included if the features property has changed.
     * Contains the new features object.
     * 
     * @example
     * ```typescript
     * // Wallet now supports new features
     * if (properties.features) {
     *   console.log('New supported features:', Object.keys(properties.features));
     * }
     * ```
     */
    readonly features?: Wallet['features'];
    
    /**
     * Accounts that the app is authorized to use.
     * 
     * Only included if the accounts property has changed.
     * Contains the new accounts array.
     * 
     * @example
     * ```typescript
     * // User connected/disconnected accounts
     * if (properties.accounts) {
     *   console.log('Account authorization changed:', properties.accounts.length);
     * }
     * ```
     */
    readonly accounts?: Wallet['accounts'];
}

// =============================================================================
// DEPRECATED ALIASES
// =============================================================================

/**
 * @deprecated Use {@link StandardEvents} instead.
 * 
 * Legacy feature identifier for backward compatibility.
 * 
 * @group Deprecated
 */
export const Events = StandardEvents;

/**
 * @deprecated Use {@link StandardEventsFeature} instead.
 * 
 * Legacy feature type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsFeature = StandardEventsFeature;

/**
 * @deprecated Use {@link StandardEventsVersion} instead.
 * 
 * Legacy version type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsVersion = StandardEventsVersion;

/**
 * @deprecated Use {@link StandardEventsOnMethod} instead.
 * 
 * Legacy method type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsOnMethod = StandardEventsOnMethod;

/**
 * @deprecated Use {@link StandardEventsListeners} instead.
 * 
 * Legacy listeners type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsListeners = StandardEventsListeners;

/**
 * @deprecated Use {@link StandardEventsNames} instead.
 * 
 * Legacy names type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsNames = StandardEventsNames;

/**
 * @deprecated Use {@link StandardEventsChangeProperties} instead.
 * 
 * Legacy properties type for backward compatibility.
 * 
 * @group Deprecated
 */
export type EventsChangeProperties = StandardEventsChangeProperties;
