/**
 * A namespaced identifier in the format `${namespace}:${reference}`.
 * 
 * This type ensures that identifiers follow a consistent namespace:reference pattern,
 * which is essential for blockchain applications to avoid naming conflicts between
 * different protocols, chains, and features.
 * 
 * The namespace provides context and ownership, while the reference identifies
 * the specific resource within that namespace.
 * 
 * @example
 * ```typescript
 * const chainId: IdentifierString = 'solana:mainnet';
 * const featureName: IdentifierString = 'standard:connect';
 * const customFeature: IdentifierString = 'experimental:encrypt';
 * ```
 * 
 * Used by {@link IdentifierArray} and {@link IdentifierRecord}.
 *
 * @group Identifier
 */
export type IdentifierString = `${string}:${string}`;

/**
 * A read-only array of namespaced identifiers in the format `${namespace}:${reference}`.
 * 
 * This type represents a collection of identifiers that cannot be modified after creation,
 * ensuring data integrity in blockchain applications. It's commonly used to represent
 * lists of supported chains, features, or other categorized resources.
 * 
 * @example
 * ```typescript
 * const supportedChains: IdentifierArray = [
 *   'solana:mainnet',
 *   'solana:devnet',
 *   'ethereum:mainnet'
 * ];
 * 
 * const walletFeatures: IdentifierArray = [
 *   'standard:connect',
 *   'standard:disconnect',
 *   'experimental:encrypt'
 * ];
 * ```
 * 
 * Used by {@link Wallet.chains | Wallet::chains}, {@link WalletAccount.chains | WalletAccount::chains}, and
 * {@link WalletAccount.features | WalletAccount::features}.
 *
 * @group Identifier
 */
export type IdentifierArray = readonly IdentifierString[];

/**
 * A read-only object with keys of namespaced identifiers in the format `${namespace}:${reference}`.
 * 
 * This type represents a mapping of identifiers to their associated values, where both
 * the keys and the object itself are immutable. This is crucial for representing
 * feature sets, configuration objects, and other structured data in blockchain applications.
 * 
 * @example
 * ```typescript
 * const walletFeatures: IdentifierRecord<unknown> = {
 *   'standard:connect': { version: '1.0.0' },
 *   'experimental:encrypt': { version: '1.0.0' }
 * };
 * ```
 * 
 * Used by {@link Wallet.features | Wallet::features}.
 *
 * @group Identifier
 */
export type IdentifierRecord<T> = Readonly<Record<IdentifierString, T>>;
