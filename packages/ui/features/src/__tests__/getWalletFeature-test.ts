import type { Wallet, WalletVersion } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
} from '@wallet-standard/errors';
import type { UiWalletHandle } from '@wallet-standard/ui-core';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

import { getWalletFeature } from '../getWalletFeature.js';

jest.mock('@wallet-standard/ui-registry');

describe('getWalletFeature', () => {
    const TEST_FEATURE_A = 'feature:a';
    const TEST_FEATURE_B = 'feature:b';
    const TEST_CHAIN = 'solana:mainnet';
    const TEST_WALLET_NAME = 'Mock Wallet';
    const TEST_WALLET_VERSION = '1.0.0' as WalletVersion;
    const TEST_ICON = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=';

    let mockFeatureA: object;
    let mockWallet: Wallet;
    let mockWalletHandle: UiWalletHandle;

    beforeEach(() => {
        mockFeatureA = {};
        mockWallet = {
            accounts: [],
            chains: [TEST_CHAIN],
            features: {
                [TEST_FEATURE_A]: mockFeatureA,
            },
            icon: TEST_ICON,
            name: TEST_WALLET_NAME,
            version: TEST_WALLET_VERSION,
        };
        mockWalletHandle = {
            '~uiWalletHandle': Symbol(),
            features: [TEST_FEATURE_A],
        } as UiWalletHandle;

        jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
        
        // Suppress console output when an `ErrorBoundary` is hit.
        // See https://stackoverflow.com/a/72632884/802047
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    describe('when requesting an unsupported feature', () => {
        it('throws WalletStandardError with correct error details', () => {
            expect(() => {
                getWalletFeature(mockWalletHandle, TEST_FEATURE_B);
            }).toThrow(
                new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED, {
                    featureName: TEST_FEATURE_B,
                    supportedChains: [TEST_CHAIN],
                    supportedFeatures: [TEST_FEATURE_A],
                    walletName: TEST_WALLET_NAME,
                })
            );
        });
    });

    describe('when requesting a supported feature', () => {
        it('returns the feature from the underlying wallet', () => {
            jest.mocked(getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).mockReturnValue(mockWallet);
            
            const result = getWalletFeature(mockWalletHandle, TEST_FEATURE_A);
            
            expect(result).toBe(mockFeatureA);
        });
    });
});
