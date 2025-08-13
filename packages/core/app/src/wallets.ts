import type {
    DEPRECATED_WalletsCallback,
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowAppReadyEvent,
    WindowAppReadyEventAPI,
    WindowRegisterWalletEvent,
} from '@wallet-standard/base';

// Global state management
let wallets: Wallets | undefined = undefined;
const registeredWalletsSet = new Set<Wallet>();
let cachedWalletsArray: readonly Wallet[] | undefined;

// Event listeners registry
const listeners: { [E in WalletsEventNames]?: WalletsEventsListeners[E][] } = {};

/**
 * Adds a wallet to the registered wallets set and invalidates the cache.
 * 
 * @param wallet - The wallet to add to the registered set.
 */
function addRegisteredWallet(wallet: Wallet): void {
    cachedWalletsArray = undefined;
    registeredWalletsSet.add(wallet);
}

/**
 * Removes a wallet from the registered wallets set and invalidates the cache.
 * 
 * @param wallet - The wallet to remove from the registered set.
 */
function removeRegisteredWallet(wallet: Wallet): void {
    cachedWalletsArray = undefined;
    registeredWalletsSet.delete(wallet);
}

/**
 * Safely executes a callback function and logs any errors.
 * 
 * @param callback - The function to execute safely.
 */
function guard(callback: () => void): void {
    try {
        callback();
    } catch (error) {
        console.error('Error in wallet event callback:', error);
    }
}

/**
 * Get an API for {@link Wallets.get | getting}, {@link Wallets.on | listening for}, and
 * {@link Wallets.register | registering} {@link "@wallet-standard/base".Wallet | Wallets}.
 *
 * When called for the first time --
 *
 * This dispatches a {@link "@wallet-standard/base".WindowAppReadyEvent} to notify each Wallet that the app is ready
 * to register it.
 *
 * This also adds a listener for {@link "@wallet-standard/base".WindowRegisterWalletEvent} to listen for a notification
 * from each Wallet that the Wallet is ready to be registered by the app.
 *
 * This combination of event dispatch and listener guarantees that each Wallet will be registered synchronously as soon
 * as the app is ready whether the app loads before or after each Wallet.
 *
 * @return API for getting, listening for, and registering Wallets.
 *
 * @group App
 */
export function getWallets(): Wallets {
    if (wallets) return wallets;
    
    wallets = Object.freeze({ register, get, on });
    
    if (typeof window === 'undefined') return wallets;

    const api = Object.freeze({ register });
    
    // Listen for wallet registration events
    try {
        (window as WalletEventsWindow).addEventListener('wallet-standard:register-wallet', (event: WindowRegisterWalletEvent) => {
            const callback = event.detail;
            guard(() => callback(api));
        });
    } catch (error) {
        console.error('wallet-standard:register-wallet event listener could not be added\n', error);
    }
    
    // Dispatch app ready event
    try {
        (window as WalletEventsWindow).dispatchEvent(new AppReadyEvent(api));
    } catch (error) {
        console.error('wallet-standard:app-ready event could not be dispatched\n', error);
    }

    return wallets;
}

/**
 * API for {@link Wallets.get | getting}, {@link Wallets.on | listening for}, and
 * {@link Wallets.register | registering} {@link "@wallet-standard/base".Wallet | Wallets}.
 *
 * @group App
 */
export interface Wallets {
    /**
     * Get all Wallets that have been registered.
     *
     * @return Registered Wallets.
     */
    get(): readonly Wallet[];

    /**
     * Add an event listener and subscribe to events for Wallets that are
     * {@link WalletsEventsListeners.register | registered} and
     * {@link WalletsEventsListeners.unregister | unregistered}.
     *
     * @param event    Event type to listen for. {@link WalletsEventsListeners.register | `register`} and
     * {@link WalletsEventsListeners.unregister | `unregister`} are the only event types.
     * @param listener Function that will be called when an event of the type is emitted.
     *
     * @return
     * `off` function which may be called to remove the event listener and unsubscribe from events.
     *
     * As with all event listeners, be careful to avoid memory leaks.
     */
    on<E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): () => void;

    /**
     * Register Wallets. This can be used to programmatically wrap non-standard wallets as Standard Wallets.
     *
     * Apps generally do not need to, and should not, call this.
     *
     * @param wallets Wallets to register.
     *
     * @return
     * `unregister` function which may be called to programmatically unregister the registered Wallets.
     *
     * Apps generally do not need to, and should not, call this.
     */
    register(...wallets: Wallet[]): () => void;
}

/**
 * Types of event listeners of the {@link Wallets} API.
 *
 * @group App
 */
export interface WalletsEventsListeners {
    /**
     * Emitted when Wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(...wallets: Wallet[]): void;

    /**
     * Emitted when Wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(...wallets: Wallet[]): void;
}

/**
 * Names of {@link WalletsEventsListeners} that can be listened for.
 *
 * @group App
 */
export type WalletsEventNames = keyof WalletsEventsListeners;

/**
 * @deprecated Use {@link WalletsEventsListeners} instead.
 *
 * @group Deprecated
 */
export type WalletsEvents = WalletsEventsListeners;

/**
 * Registers wallets and returns an unregister function.
 * 
 * Filters out wallets that have already been registered to prevent duplicates.
 * 
 * @param wallets - The wallets to register.
 * @returns A function that unregisters the registered wallets.
 */
function register(...wallets: Wallet[]): () => void {
    // Filter out wallets that have already been registered.
    // This prevents the same wallet from being registered twice, but it also prevents wallets from being
    // unregistered by reusing a reference to the wallet to obtain the unregister function for it.
    const newWallets = wallets.filter((wallet) => !registeredWalletsSet.has(wallet));
    
    // If there are no new wallets to register, just return a no-op unregister function.
    if (!newWallets.length) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }

    // Register the new wallets
    newWallets.forEach((wallet) => addRegisteredWallet(wallet));
    
    // Notify listeners about registration
    listeners['register']?.forEach((listener) => guard(() => listener(...newWallets)));
    
    // Return a function that unregisters the registered wallets.
    return function unregister(): void {
        newWallets.forEach((wallet) => removeRegisteredWallet(wallet));
        listeners['unregister']?.forEach((listener) => guard(() => listener(...newWallets)));
    };
}

/**
 * Gets all registered wallets with caching for performance.
 * 
 * @returns A readonly array of all registered wallets.
 */
function get(): readonly Wallet[] {
    if (!cachedWalletsArray) {
        cachedWalletsArray = Object.freeze([...registeredWalletsSet]);
    }
    return cachedWalletsArray!;
}

/**
 * Adds an event listener and returns a function to remove it.
 * 
 * @param event - The event type to listen for.
 * @param listener - The listener function to call when the event occurs.
 * @returns A function that removes the event listener.
 */
function on<E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): () => void {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event]!.push(listener);
    
    // Return a function that removes the event listener.
    return function off(): void {
        listeners[event] = listeners[event]?.filter((existingListener) => listener !== existingListener);
    };
}

/**
 * Custom event class for app ready notifications.
 * 
 * Implements the {@link WindowAppReadyEvent} interface and provides
 * the API for wallet registration.
 */
class AppReadyEvent extends Event implements WindowAppReadyEvent {
    readonly #detail: WindowAppReadyEventAPI;

    /**
     * Gets the API for wallet registration.
     */
    get detail(): WindowAppReadyEventAPI {
        return this.#detail;
    }

    /**
     * Gets the event type.
     */
    get type(): 'wallet-standard:app-ready' {
        return 'wallet-standard:app-ready';
    }

    /**
     * Creates a new AppReadyEvent.
     * 
     * @param api - The API for wallet registration.
     */
    constructor(api: WindowAppReadyEventAPI) {
        super(APP_READY_EVENT, {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.#detail = api;
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    preventDefault(): never {
        throw new Error('preventDefault cannot be called on wallet-standard:app-ready events');
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    stopImmediatePropagation(): never {
        throw new Error('stopImmediatePropagation cannot be called on wallet-standard:app-ready events');
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    stopPropagation(): never {
        throw new Error('stopPropagation cannot be called on wallet-standard:app-ready events');
    }
}

/**
 * @deprecated Use {@link getWallets} instead.
 * 
 * This function provides backward compatibility with the legacy wallet discovery
 * mechanism using window.navigator.wallets.
 *
 * @return API for getting, listening for, and registering Wallets.
 *
 * @group Deprecated
 */
export function DEPRECATED_getWallets(): Wallets {
    if (wallets) return wallets;
    
    wallets = getWallets();
    
    if (typeof window === 'undefined') return wallets;

    const callbacks = (window as DEPRECATED_WalletsWindow).navigator.wallets || [];
    if (!Array.isArray(callbacks)) {
        console.error('window.navigator.wallets is not an array');
        return wallets;
    }

    const { register } = wallets;
    const push = (...callbacks: DEPRECATED_WalletsCallback[]): void =>
        callbacks.forEach((callback) => guard(() => callback({ register })));
    
    try {
        Object.defineProperty((window as DEPRECATED_WalletsWindow).navigator, 'wallets', {
            value: Object.freeze({ push }),
        });
    } catch (error) {
        console.error('window.navigator.wallets could not be set');
        return wallets;
    }

    push(...callbacks);
    return wallets;
}
