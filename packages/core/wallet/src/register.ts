import type {
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowAppReadyEvent,
    WindowAppReadyEventAPI,
    WindowRegisterWalletEvent,
    WindowRegisterWalletEventCallback,
} from '@wallet-standard/base';

/**
 * Register a {@link "@wallet-standard/base".Wallet} as a Standard Wallet with the app.
 *
 * This dispatches a {@link "@wallet-standard/base".WindowRegisterWalletEvent} to notify the app that the Wallet is
 * ready to be registered.
 *
 * This also adds a listener for {@link "@wallet-standard/base".WindowAppReadyEvent} to listen for a notification from
 * the app that the app is ready to register the Wallet.
 *
 * This combination of event dispatch and listener guarantees that the Wallet will be registered synchronously as soon
 * as the app is ready whether the Wallet loads before or after the app.
 *
 * @param wallet - Wallet to register.
 *
 * @group Wallet
 */
export function registerWallet(wallet: Wallet): void {
    const callback: WindowRegisterWalletEventCallback = (api: WindowAppReadyEventAPI) => {
        try {
            api.register(wallet);
        } catch (error) {
            console.error('Failed to register wallet with app:', error);
        }
    };

    // Dispatch register wallet event
    try {
        (window as WalletEventsWindow).dispatchEvent(new RegisterWalletEvent(callback));
    } catch (error) {
        console.error('wallet-standard:register-wallet event could not be dispatched\n', error);
    }

    // Listen for app ready event
    try {
        (window as WalletEventsWindow).addEventListener('wallet-standard:app-ready', (event: WindowAppReadyEvent) => {
            const api = event.detail;
            callback(api);
        });
    } catch (error) {
        console.error('wallet-standard:app-ready event listener could not be added\n', error);
    }
}

/**
 * Custom event class for wallet registration.
 * 
 * Implements the {@link WindowRegisterWalletEvent} interface and provides
 * a callback mechanism for wallet registration.
 */
class RegisterWalletEvent extends Event implements WindowRegisterWalletEvent {
    readonly #detail: WindowRegisterWalletEventCallback;

    /**
     * Gets the callback function for wallet registration.
     */
    get detail(): WindowRegisterWalletEventCallback {
        return this.#detail;
    }

    /**
     * Gets the event type.
     */
    get type(): 'wallet-standard:register-wallet' {
        return 'wallet-standard:register-wallet';
    }

    /**
     * Creates a new RegisterWalletEvent.
     * 
     * @param callback - The callback function to be called when the app is ready.
     */
    constructor(callback: WindowRegisterWalletEventCallback) {
        super('wallet-standard:register-wallet', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.#detail = callback;
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    preventDefault(): never {
        throw new Error('preventDefault cannot be called on wallet-standard:register-wallet events');
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    stopImmediatePropagation(): never {
        throw new Error('stopImmediatePropagation cannot be called on wallet-standard:register-wallet events');
    }

    /**
     * @deprecated This method cannot be called on this event type.
     * @throws {Error} Always throws an error when called.
     */
    stopPropagation(): never {
        throw new Error('stopPropagation cannot be called on wallet-standard:register-wallet events');
    }
}

/**
 * @deprecated Use {@link registerWallet} instead.
 * 
 * This function provides backward compatibility with the legacy wallet registration
 * mechanism using window.navigator.wallets.
 *
 * @param wallet - Wallet to register.
 *
 * @group Deprecated
 */
export function DEPRECATED_registerWallet(wallet: Wallet): void {
    // Use the new registration mechanism
    registerWallet(wallet);
    
    // Legacy registration for backward compatibility
    try {
        const walletsWindow = window as DEPRECATED_WalletsWindow;
        if (!walletsWindow.navigator.wallets) {
            walletsWindow.navigator.wallets = [];
        }
        
        walletsWindow.navigator.wallets.push(({ register }: { register(...wallets: Wallet[]): () => void }) => {
            try {
                register(wallet);
            } catch (error) {
                console.error('Failed to register wallet via legacy mechanism:', error);
            }
        });
    } catch (error) {
        console.error('window.navigator.wallets could not be pushed\n', error);
    }
}
