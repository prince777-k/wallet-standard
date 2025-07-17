import type { IdentifierArray, Wallet } from '@wallet-standard/base';
import type { UiWalletAccount, UiWallet } from '@wallet-standard/ui-core';

import {
    getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from './UiWalletAccountRegistry_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.js';

import {
    registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from './UiWalletHandleRegistry_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.js';

import { identifierArraysAreDifferent } from './compare.js';

const walletsToUiWallets = new WeakMap<Wallet, UiWallet>();

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * DO NOT USE THIS OR YOU WILL BE FIRED
 *
 * This method is for exclusive use by Wallet Standard UI library authors. Use this if you need to
 * create or obtain the existing `UiWallet` object associated with a Wallet Standard `Wallet`.
 *
 * @internal
 */
export function getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED<TWallet extends Wallet>(
    wallet: TWallet
): UiWallet {
    let uiWallet = walletsToUiWallets.get(wallet) as Mutable<UiWallet> | undefined;
    const mustInitialize = !uiWallet;
    let isDirty = mustInitialize;

    if (!uiWallet) {
        uiWallet = {} as Mutable<UiWallet>;
    }

    function markDirty() {
        if (!isDirty) {
            uiWallet = { ...uiWallet };
            isDirty = true;
        }
    }

    const nextAccounts = {
        _cache: [] as UiWalletAccount[],

        *[Symbol.iterator]() {
            if (this._cache.length) {
                yield* this._cache;
            }

            for (const account of wallet.accounts.slice(this._cache.length)) {
                const uiAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                    wallet,
                    account
                );
                this._cache.push(uiAccount);
                yield uiAccount;
            }
        },

        some(predicate: (account: UiWalletAccount) => boolean): boolean {
            if (this._cache.some(predicate)) return true;

            for (const account of wallet.accounts.slice(this._cache.length)) {
                const uiAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                    wallet,
                    account
                );
                this._cache.push(uiAccount);
                if (predicate(uiAccount)) return true;
            }

            return false;
        },

        get length() {
            return wallet.accounts.length;
        },
    };

    // Sync accounts
    if (
        mustInitialize ||
        uiWallet.accounts.length !== wallet.accounts.length ||
        nextAccounts.some((acc) => !uiWallet!.accounts.includes(acc))
    ) {
        markDirty();
        uiWallet.accounts = Object.freeze(Array.from(nextAccounts));
    }

    // Sync features
    const nextFeatures = Object.keys(wallet.features) as IdentifierArray;
    if (mustInitialize || identifierArraysAreDifferent(uiWallet.features, nextFeatures)) {
        markDirty();
        uiWallet.features = Object.freeze(nextFeatures);
    }

    // Sync chains
    if (mustInitialize || identifierArraysAreDifferent(uiWallet.chains, wallet.chains)) {
        markDirty();
        uiWallet.chains = Object.freeze([...wallet.chains]);
    }

    // Sync basic info
    if (
        mustInitialize ||
        uiWallet.icon !== wallet.icon ||
        uiWallet.name !== wallet.name ||
        uiWallet.version !== wallet.version
    ) {
        markDirty();
        uiWallet.icon = wallet.icon;
        uiWallet.name = wallet.name;
        uiWallet.version = wallet.version;
    }

    if (isDirty) {
        walletsToUiWallets.set(wallet, uiWallet);
        registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWallet, wallet);
    }

    return Object.freeze(uiWallet);
}