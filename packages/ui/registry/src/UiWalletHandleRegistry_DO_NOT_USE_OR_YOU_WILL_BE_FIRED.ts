import type { Wallet, WalletAccount } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND,
    WalletStandardError,
    safeCaptureStackTrace,
} from '@wallet-standard/errors';
import type { UiWalletAccount, UiWalletHandle } from '@wallet-standard/ui-core';

const uiWalletHandleMap = new WeakMap<UiWalletHandle, Wallet>();

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * This method is for exclusive use by Wallet Standard UI library authors.
 * Associates a `UiWalletHandle` with its corresponding Wallet instance.
 *
 * @internal
 */
export function registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    uiWalletHandle: UiWalletHandle,
    wallet: Wallet
): void {
    uiWalletHandleMap.set(uiWalletHandle, wallet);
}

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * Returns the `WalletAccount` matching the address from the provided `UiWalletAccount`.
 * Throws if the account is not found in the associated wallet.
 *
 * @internal
 */
export function getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    uiWalletAccount: UiWalletAccount
): WalletAccount {
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletAccount);
    const account = wallet.accounts.find(
        ({ address }) => address === uiWalletAccount.address
    );

    if (!account) {
        const error = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, {
            address: uiWalletAccount.address,
            walletName: wallet.name,
        });
        safeCaptureStackTrace(error, getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw error;
    }

    return account;
}

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * Returns the original `Wallet` instance associated with the given `UiWalletHandle`.
 * Throws if no such Wallet has been registered.
 *
 * @internal
 */
export function getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    uiWalletHandle: UiWalletHandle
): Wallet {
    const wallet = uiWalletHandleMap.get(uiWalletHandle);

    if (!wallet) {
        const error = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND);
        safeCaptureStackTrace(error, getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw error;
    }

    return wallet;
}
