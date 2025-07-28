import type { Wallet, WalletAccount } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND,
    WalletStandardError,
    safeCaptureStackTrace,
} from '@wallet-standard/errors';
import type { UiWalletAccount, UiWalletHandle } from '@wallet-standard/ui-core';

// Internal registry mapping UI wallet handles to their underlying Wallet instances
const uiWalletHandlesToWallets = new WeakMap<UiWalletHandle, Wallet>();

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * This method is for exclusive use by Wallet Standard UI library authors. Use this to associate a
 * `UiWallet` or `UiWalletAccount` object with a Wallet Standard `Wallet` in the central registry.
 *
 * @param uiWalletHandle - The UI wallet handle to register
 * @param wallet - The underlying Wallet instance to associate with the handle
 * @internal
 */
export function registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    uiWalletHandle: UiWalletHandle,
    wallet: Wallet
): void {
    uiWalletHandlesToWallets.set(uiWalletHandle, wallet);
}

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * This method is for exclusive use by Wallet Standard UI library authors. If you are building APIs
 * that need to materialize wallet-based features given a `UiWalletAccount` UI object, this
 * function will vend you the underlying `Wallet` object associated with it.
 *
 * @param uiWalletHandle - The UI wallet handle to look up
 * @returns The underlying Wallet instance
 * @throws {WalletStandardError} When the wallet is not found in the registry
 * @internal
 */
export function getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletHandle: UiWalletHandle): Wallet {
    const wallet = uiWalletHandlesToWallets.get(uiWalletHandle);
    if (!wallet) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND);
        safeCaptureStackTrace(err, getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw err;
    }
    return wallet;
}

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * This method is for exclusive use by Wallet Standard UI library authors. If you are building APIs
 * that need to materialize account-based features given a `UiWalletAccount` UI object, this
 * function will vend you the underlying `WalletAccount` object associated with it.
 *
 * @param uiWalletAccount - The UI wallet account to look up
 * @returns The underlying WalletAccount instance
 * @throws {WalletStandardError} When the wallet or account is not found in the registry
 * @internal
 */
export function getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    uiWalletAccount: UiWalletAccount
): WalletAccount {
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletAccount);
    
    const account = wallet.accounts.find(({ address }: { address: string }) => 
        address === uiWalletAccount.address
    );
    
    if (!account) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, {
            address: uiWalletAccount.address,
            walletName: wallet.name,
        });
        safeCaptureStackTrace(err, getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw err;
    }
    
    return account;
}
