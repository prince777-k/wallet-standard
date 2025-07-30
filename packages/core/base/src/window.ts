import type { Wallet } from './wallet.js';

// =============================================================================
// EVENT TYPES AND CONSTANTS
// =============================================================================

/**
 * Event type constants for wallet standard events.
 * 
 * @group Event Types
 */
export const WALLET_EVENT_TYPES = {
    /** Event dispatched when the app is ready to register wallets. */
    APP_READY: 'wallet-standard:app-ready',
    /** Event dispatched when a wallet is ready to be registered. */
    REGISTER_WALLET: 'wallet-standard:register-wallet',
} as const;

/**
 * Type-safe event type constants.
 * 
 * @group Event Types
 */
export type WalletEventType = typeof WALLET_EVENT_TYPES[keyof typeof WALLET_EVENT_TYPES];

// =============================================================================
// CORE EVENT INTERFACES
// =============================================================================

/**
 * Base interface for wallet standard custom events that cannot be prevented or stopped.
 * 
 * This ensures wallet registration events are always processed, preventing
 * malicious code from blocking wallet discovery.
 * 
 * @internal
 * @group Internal
 */
export interface UnstoppableCustomEvent<T extends string, D> extends Event {
    /** Type of the event. */
    readonly type: T;
    /** Data attached to the event. */
    readonly detail: D;
    /** @deprecated Cannot prevent default - throws error if called. */
    preventDefault(): never;
    /** @deprecated Cannot stop immediate propagation - throws error if called. */
    stopImmediatePropagation(): never;
    /** @deprecated Cannot stop propagation - throws error if called. */
    stopPropagation(): never;
}

// =============================================================================
// APP READY EVENT SYSTEM
// =============================================================================

/**
 * Type of the app ready event.
 * 
 * @group App Ready Event
 */
export type WindowAppReadyEventType = typeof WALLET_EVENT_TYPES.APP_READY;

/**
 * API provided to wallets by the app when the app is ready to register wallets.
 * 
 * Wallets must call the {@link WindowAppReadyEventAPI.register | register} method
 * to register themselves with the app.
 * 
 * @group App Ready Event
 */
export interface WindowAppReadyEventAPI {
    /**
     * Register a wallet with the app.
     * 
     * @param wallet - The wallet to register.
     * @returns An unregister function to programmatically unregister the wallet.
     * 
     * @example
     * ```typescript
     * const unregister = api.register(myWallet);
     * // Later...
     * unregister(); // Unregister the wallet
     * ```
     */
    register(wallet: Wallet): () => void;
}

/**
 * Event dispatched by the app when it's ready to register wallets.
 * 
 * Wallets must listen for this event and register themselves when it's dispatched.
 * This ensures wallets are registered as soon as the app is ready, regardless
 * of whether the wallet loads before or after the app.
 * 
 * @group App Ready Event
 */
export type WindowAppReadyEvent = UnstoppableCustomEvent<WindowAppReadyEventType, WindowAppReadyEventAPI>;

// =============================================================================
// WALLET REGISTRATION EVENT SYSTEM
// =============================================================================

/**
 * Type of the wallet registration event.
 * 
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEventType = typeof WALLET_EVENT_TYPES.REGISTER_WALLET;

/**
 * Callback function provided by wallets to be called by the app when ready to register.
 * 
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEventCallback = (api: WindowAppReadyEventAPI) => void;

/**
 * Event dispatched by wallets when they're ready to be registered by the app.
 * 
 * The app must listen for this event and register wallets when it's dispatched.
 * This ensures wallets are registered as soon as they're ready, regardless
 * of whether the app loads before or after the wallet.
 * 
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEvent = UnstoppableCustomEvent<
    WindowRegisterWalletEventType,
    WindowRegisterWalletEventCallback
>;

// =============================================================================
// WINDOW INTERFACE EXTENSIONS
// =============================================================================

/**
 * Extended window interface for wallet standard event handling.
 * 
 * Provides type-safe event listeners and dispatchers for wallet registration events.
 * 
 * @example
 * ```typescript
 * import { WalletEventsWindow } from '@wallet-standard/base';
 * 
 * declare const window: WalletEventsWindow;
 * 
 * // Listen for app ready events
 * window.addEventListener('wallet-standard:app-ready', ({ detail: api }) => {
 *   api.register(myWallet);
 * });
 * 
 * // Listen for wallet registration events
 * window.addEventListener('wallet-standard:register-wallet', ({ detail: callback }) => {
 *   callback({ register: (wallet) => registerWallet(wallet) });
 * });
 * ```
 * 
 * @group Window
 */
export interface WalletEventsWindow extends Omit<Window, 'addEventListener' | 'dispatchEvent'> {
    /** Add a listener for app ready events. */
    addEventListener(type: WindowAppReadyEventType, listener: (event: WindowAppReadyEvent) => void): void;
    /** Add a listener for wallet registration events. */
    addEventListener(type: WindowRegisterWalletEventType, listener: (event: WindowRegisterWalletEvent) => void): void;
    /** Dispatch an app ready event. */
    dispatchEvent(event: WindowAppReadyEvent): void;
    /** Dispatch a wallet registration event. */
    dispatchEvent(event: WindowRegisterWalletEvent): void;
}

// =============================================================================
// DEPRECATED INTERFACES
// =============================================================================

/**
 * @deprecated Use {@link WalletEventsWindow} instead.
 * 
 * Legacy window interface for backward compatibility.
 * 
 * @group Deprecated
 */
export interface DEPRECATED_WalletsWindow extends Window {
    navigator: DEPRECATED_WalletsNavigator;
}

/**
 * @deprecated Use {@link WalletEventsWindow} instead.
 * 
 * Legacy navigator interface for backward compatibility.
 * 
 * @group Deprecated
 */
export interface DEPRECATED_WalletsNavigator extends Navigator {
    wallets?: DEPRECATED_Wallets;
}

/**
 * @deprecated Use {@link WalletEventsWindow} instead.
 * 
 * Legacy wallets interface for backward compatibility.
 * 
 * @group Deprecated
 */
export interface DEPRECATED_Wallets {
    push(...callbacks: DEPRECATED_WalletsCallback[]): void;
}

/**
 * @deprecated Use {@link WalletEventsWindow} instead.
 * 
 * Legacy callback type for backward compatibility.
 * 
 * @group Deprecated
 */
export type DEPRECATED_WalletsCallback = (wallets: { register(...wallets: Wallet[]): () => void }) => void;
