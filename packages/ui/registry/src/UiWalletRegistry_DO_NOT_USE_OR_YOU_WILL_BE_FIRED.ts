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
 * Creates a lazy-loading accounts iterator that caches UiWalletAccount instances
 */
function createAccountsIterator(wallet: Wallet) {
    const cache: UiWalletAccount[] = [];
    
    return {
        _cache: cache,

        *[Symbol.iterator]() {
            if (cache.length) {
                yield* cache;
            }

            for (const account of wallet.accounts.slice(cache.length)) {
                const uiAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                    wallet,
                    account
                );
                cache.push(uiAccount);
                yield uiAccount;
            }
        },

        some(predicate: (account: UiWalletAccount) => boolean): boolean {
            if (cache.some(predicate)) return true;

            for (const account of wallet.accounts.slice(cache.length)) {
                const uiAccount = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
                    wallet,
                    account
                );
                cache.push(uiAccount);
                if (predicate(uiAccount)) return true;
            }

            return false;
        },

        get length() {
            return wallet.accounts.length;
        },
    };
}

/**
 * Checks if accounts need to be synchronized between wallet and UI wallet
 */
function shouldSyncAccounts(
    uiWallet: Mutable<UiWallet>,
    wallet: Wallet,
    accountsIterator: ReturnType<typeof createAccountsIterator>
): boolean {
    return (
        uiWallet.accounts.length !== wallet.accounts.length ||
        accountsIterator.some((acc) => !uiWallet.accounts.includes(acc))
    );
}

/**
 * Checks if basic wallet info needs to be synchronized
 */
function shouldSyncBasicInfo(uiWallet: Mutable<UiWallet>, wallet: Wallet): boolean {
    return (
        uiWallet.icon !== wallet.icon ||
        uiWallet.name !== wallet.name ||
        uiWallet.version !== wallet.version
    );
}

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
    const isNewWallet = !uiWallet;
    let hasChanges = isNewWallet;

    if (!uiWallet) {
        uiWallet = {} as Mutable<UiWallet>;
    }

    function markAsChanged() {
        if (!hasChanges) {
            uiWallet = { ...uiWallet };
            hasChanges = true;
        }
    }

    const accountsIterator = createAccountsIterator(wallet);

    // Synchronize accounts
    if (isNewWallet || shouldSyncAccounts(uiWallet, wallet, accountsIterator)) {
        markAsChanged();
        uiWallet.accounts = Object.freeze(Array.from(accountsIterator));
    }

    // Synchronize features
    const walletFeatures = Object.keys(wallet.features) as IdentifierArray;
    if (isNewWallet || identifierArraysAreDifferent(uiWallet.features, walletFeatures)) {
        markAsChanged();
        uiWallet.features = Object.freeze(walletFeatures);
    }

    // Synchronize chains
    if (isNewWallet || identifierArraysAreDifferent(uiWallet.chains, wallet.chains)) {
        markAsChanged();
        uiWallet.chains = Object.freeze([...wallet.chains]);
    }

    // Synchronize basic wallet information
    if (isNewWallet || shouldSyncBasicInfo(uiWallet, wallet)) {
        markAsChanged();
        uiWallet.icon = wallet.icon;
        uiWallet.name = wallet.name;
        uiWallet.version = wallet.version;
    }

    if (hasChanges) {
        walletsToUiWallets.set(wallet, uiWallet);
        registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWallet, wallet);
    }

    return Object.freeze(uiWallet);
}