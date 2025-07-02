import { ITokenContract } from '@/contracts/tokens/TokenContract';
import { IConnector, IWallet, useWalletConnectors } from '@phoenix-wallet/wallet-adapter';
import { IChain, ChainType } from '@/phoenix-wallet/chains/Chain';
import { useEffect, useMemo, useRef } from 'react';
import { SolanaTokenContract } from '@/contracts/tokens/SolanaTokenContract';
import { EvmTokenContract } from '@/contracts/tokens/EvmTokenContract';
import { Connection } from '@solana/web3.js';
import { createPublicClient, http } from 'viem';
import { SuiClient } from '@mysten/sui/client';
import { SuiTokenContract } from '@/contracts/tokens/SuiTokenContract';

interface TokenContractState {
  contract: ITokenContract | null;
  error: Error | null;
  getContract: () => ITokenContract | null;
}

interface TokenContractOptions {
  contractAddress: string;
  chainId: string;
  wallet?: IWallet<any, IChain<any>, IConnector, any> | null;
}

/**
 * Hook to create and use token contracts
 *
 * Can be used in two ways:
 * 1. With a wallet - for operations that require signing (transfers)
 * 2. Without a wallet - for read-only operations (getting balances, token info)
 *
 * @param options The token contract options
 * @returns TokenContractState
 */
export function useTokenContract(options: TokenContractOptions): TokenContractState {
  const { contractAddress, wallet, chainId } = options;
  const { chainConfigs } = useWalletConnectors();

  const contractRef = useRef<ITokenContract | null>(null);

  const contractConfig = useMemo(() => {
    let contract: ITokenContract | null = null;
    if (!contractAddress) {
      return {
        contract: null,
        error: new Error('Token address is required'),
      };
    }

    // find chain config for the provided chainId
    const chainConfig = chainConfigs.find((c) => c.id === chainId);

    if (!chainConfig) {
      return {
        contract: null,
        error: new Error(`Chain config not found for chainId: ${chainId}`),
      };
    }

    switch (chainConfig.chainType) {
      case ChainType.SOLANA: {
        const connection = new Connection(chainConfig.privateRpcUrl);
        contract = new SolanaTokenContract(connection, contractAddress);
        break;
      }

      case ChainType.EVM: {
        const publicClient = createPublicClient({
          chain: {
            id: chainConfig.chainId,
            name: chainConfig.name,
            nativeCurrency: {
              name: chainConfig.nativeCurrency.name,
              symbol: chainConfig.nativeCurrency.symbol,
              decimals: chainConfig.nativeCurrency.decimals,
            },
            rpcUrls: {
              default: { http: [chainConfig.privateRpcUrl] },
            },
          },
          transport: http(chainConfig.privateRpcUrl),
        });

        contract = new EvmTokenContract(publicClient, contractAddress);
        break;
      }

      case ChainType.SUI: {
        const suiClient = new SuiClient({
          url: chainConfig.privateRpcUrl,
        });
        contract = new SuiTokenContract(suiClient, contractAddress);
        break;
      }
    }

    if (!contract) {
      return {
        contract: null,
        error: new Error('Unsupported chain type'),
      };
    }

    if (wallet) {
      console.log('setting wallet', wallet);
      contract.wallet = wallet;
    }

    return {
      contract,
      error: null,
    };
  }, [contractAddress, wallet, chainId, chainConfigs]);

  useEffect(() => {
    if (contractConfig.contract) {
      contractRef.current = contractConfig.contract;
    }
  }, [contractConfig]);

  return {
    contract: contractConfig.contract,
    error: contractConfig.error,
    getContract: () => contractRef.current,
  };
}
