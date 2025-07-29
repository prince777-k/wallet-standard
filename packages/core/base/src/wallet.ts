import type { ReadonlyUint8Array } from './bytes.js';
import type { IdentifierArray, IdentifierRecord, IdentifierString } from './identifier.js';

/**
 * Version of the Wallet Standard implemented by a {@link Wallet}.
 *
 * Used by {@link Wallet.version | Wallet::version}.
 *
 * Note that this is _NOT_ a version of the Wallet, but a version of the Wallet Standard itself that the Wallet
 * supports.
 *
 * This may be used by the app to determine compatibility and feature detect.
 *
 * @example
 * ```typescript
 * const walletVersion: WalletVersion = '1.0.0';
 * ```
 *
 * @group Wallet
 */
export type WalletVersion = '1.0.0';

/**
 * A data URI containing a base64-encoded SVG, WebP, PNG, or GIF image.
 *
 * Used by {@link Wallet.icon | Wallet::icon} and {@link WalletAccount.icon | WalletAccount::icon}.
 * This format ensures cross-platform compatibility and allows wallets to display their branding
 * consistently across different applications.
 *
 * @example
 * ```typescript
 * const walletIcon: WalletIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnpNMTIgMjBjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iY3VycmVudENvbG9yIi8+Cjwvc3ZnPgo=';
 * ```
 *
 * @group Wallet
 */
export type WalletIcon = `data:image/${'svg+xml' | 'webp' | 'png' | 'gif'};base64,${string}`;

/**
 * Interface of a **Wallet**, also referred to as a **Standard Wallet**.
 *
 * A Standard Wallet implements and adheres to the Wallet Standard, providing a consistent
 * interface for blockchain applications to interact with different wallet implementations.
 * This ensures interoperability across different blockchain ecosystems and wallet providers.
 *
 * @example
 * ```typescript
 * const wallet: Wallet = {
 *   version: '1.0.0',
 *   name: 'Phantom',
 *   icon: 'data:image/svg+xml;base64,...',
 *   chains: ['solana:mainnet', 'solana:devnet'],
 *   features: {
 *     'standard:connect': { version: '1.0.0' },
 *     'standard:disconnect': { version: '1.0.0' }
 *   },
 *   accounts: []
 * };
 * ```
 *
 * @group Wallet
 */
export interface Wallet {
    /**
     * {@link WalletVersion | Version} of the Wallet Standard implemented by the Wallet.
     *
     * Must be read-only, static, and canonically defined by the Wallet Standard.
     * This version indicates which features and behaviors the wallet supports.
     */
    readonly version: WalletVersion;

    /**
     * Name of the Wallet. This may be displayed by the app.
     *
     * Must be read-only, static, descriptive, unique, and canonically defined by the wallet extension or application.
     * This name should be user-friendly and recognizable to users.
     */
    readonly name: string;

    /**
     * {@link WalletIcon | Icon} of the Wallet. This may be displayed by the app.
     *
     * Must be read-only, static, and canonically defined by the wallet extension or application.
     * The icon should be high-quality and represent the wallet's branding.
     */
    readonly icon: WalletIcon;

    /**
     * Chains supported by the Wallet.
     *
     * A **chain** is an {@link IdentifierString} which identifies a blockchain in a canonical, human-readable format.
     * [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) chain IDs are compatible with this,
     * but are not required to be used.
     *
     * Each blockchain should define its own **chains** by extension of the Wallet Standard, using its own namespace.
     * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
     *
     * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
     * app if the value changes.
     *
     * @example
     * ```typescript
     * const chains: IdentifierArray = [
     *   'solana:mainnet',
     *   'solana:devnet',
     *   'ethereum:mainnet'
     * ];
     * ```
     */
    readonly chains: IdentifierArray;

    /**
     * Features supported by the Wallet.
     *
     * A **feature name** is an {@link IdentifierString} which identifies a **feature** in a canonical, human-readable
     * format.
     *
     * Each blockchain should define its own features by extension of the Wallet Standard.
     *
     * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
     *
     * A **feature** may have any type. It may be a single method or value, or a collection of them.
     *
     * A **conventional feature** has the following structure:
     *
     * ```ts
     * export type ExperimentalEncryptFeature = {
     *     // Name of the feature.
     *     'experimental:encrypt': {
     *         // Version of the feature.
     *         version: '1.0.0';
     *         // Properties of the feature.
     *         ciphers: readonly 'x25519-xsalsa20-poly1305'[];
     *         // Methods of the feature.
     *         encrypt(data: Uint8Array): Promise<Uint8Array>;
     *     };
     * };
     * ```
     *
     * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
     * app if the value changes.
     *
     * @example
     * ```typescript
     * const features: IdentifierRecord<unknown> = {
      *   'standard:connect': { version: '1.0.0' },
 *   'experimental:encrypt': { version: '1.0.0' }
     * };
     * ```
     */
    readonly features: IdentifierRecord<unknown>;

    /**
     * {@link WalletAccount | Accounts} that the app is authorized to use.
     *
     * This can be set by the Wallet so the app can use authorized accounts on the initial page load.
     * The accounts array represents all accounts that the user has authorized the application to access.
     *
     * The {@link "@wallet-standard/features".ConnectFeature | `standard:connect` feature} should be used to obtain
     * authorization to the accounts.
     *
     * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
     * app if the value changes.
     *
     * @example
     * ```typescript
     * const accounts: readonly WalletAccount[] = [
     *   {
      *     address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
 *     publicKey: new Uint8Array([1, 2, 3, 4]),
     *     chains: ['solana:mainnet'],
     *     features: ['standard:connect'],
     *     label: 'My Wallet',
     *     icon: 'data:image/svg+xml;base64,...'
     *   }
     * ];
     * ```
     */
    readonly accounts: readonly WalletAccount[];
}

/**
 * Interface of a **WalletAccount**, also referred to as an **Account**.
 *
 * An account is a _read-only data object_ that is provided from the Wallet to the app, authorizing the app to use it.
 * This represents a specific account within a wallet that the user has authorized the application to access.
 *
 * The app can use an account to display and query information from a chain.
 *
 * The app can also act using an account by passing it to {@link Wallet.features | features} of the Wallet.
 *
 * Wallets may use or extend {@link "@wallet-standard/wallet".ReadonlyWalletAccount} which implements this interface.
 *
 * @example
 * ```typescript
 * const account: WalletAccount = {
 *   address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
 *   publicKey: new Uint8Array([1, 2, 3, 4]),
 *   chains: ['solana:mainnet'],
 *   features: ['standard:connect', 'standard:signTransaction'],
 *   label: 'My Wallet',
 *   icon: 'data:image/svg+xml;base64,...'
 * };
 * ```
 *
 * @group Wallet
 */
export interface WalletAccount {
    /**
     * Address of the account, corresponding with a public key.
     * 
     * This is the human-readable address that users see and can share.
     * The format depends on the blockchain (e.g., base58 for Solana, hex for Ethereum).
     */
    readonly address: string;

    /**
     * Public key of the account, corresponding with a secret key to use.
     * 
     * This is the raw public key bytes that can be used for cryptographic operations.
     * The format is blockchain-specific but typically a byte array.
     */
    readonly publicKey: ReadonlyUint8Array;

    /**
     * Chains supported by the account.
     *
     * This must be a subset of the {@link Wallet.chains | chains} of the Wallet.
     * An account may support fewer chains than the wallet itself.
     *
     * @example
     * ```typescript
     * const chains: IdentifierArray = ['solana:mainnet', 'solana:devnet'];
     * ```
     */
    readonly chains: IdentifierArray;

    /**
     * Feature names supported by the account.
     *
     * This must be a subset of the names of {@link Wallet.features | features} of the Wallet.
     * An account may support fewer features than the wallet itself.
     *
     * @example
     * ```typescript
     * const features: IdentifierArray = [
     *   'standard:connect',
     *   'standard:signTransaction',
     *   'standard:signMessage'
     * ];
     * ```
     */
    readonly features: IdentifierArray;

    /**
     * Optional user-friendly descriptive label or name for the account. This may be displayed by the app.
     * 
     * This allows users to give their accounts meaningful names like "My Savings" or "Trading Account".
     */
    readonly label?: string;

    /**
     * Optional user-friendly icon for the account. This may be displayed by the app.
     * 
     * This allows wallets to provide custom icons for different account types or user preferences.
     */
    readonly icon?: WalletIcon;
}

/**
 * Helper type for defining a {@link Wallet} with a union or intersection of {@link Wallet.features | features}.
 *
 * This type allows for more precise typing when implementing wallets with specific feature sets.
 * It ensures type safety while allowing flexibility in feature implementation.
 *
 * @example
 * ```typescript
 * type MyWallet = WalletWithFeatures<{
 *   'standard:connect': {
 *     version: '1.0.0';
 *     connect: () => Promise<void>;
 *   };
 *   'standard:signTransaction': {
 *     version: '1.0.0';
 *     signTransaction: (transaction: Uint8Array) => Promise<Uint8Array>;
 *   };
 * }>;
 * ```
 *
 * @group Wallet
 */
export type WalletWithFeatures<Features extends Wallet['features']> = Omit<Wallet, 'features'> & {
    features: Features;
};
