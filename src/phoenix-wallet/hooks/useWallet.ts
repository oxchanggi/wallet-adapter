import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChainType, IChain, IChainConfig } from '../chains/Chain';
import { EvmChain } from '../chains/EvmChain';
import { EvmConnector, SolanaConnector, SuiConnector } from '../connectors';
import { IConnector } from '../connectors/IConnector';
import { ConnectorStatus } from '../connectors/types';
import { useWalletConnectors } from '../contexts/WalletContext';
import { useWalletConnectorEvent } from './useWalletConnectorEvent';
import { IWallet } from '../wallets/IWallet';
import { EvmWallet } from '../wallets/EvmWallet';
import { SuiWallet } from '../wallets/SuiWallet';
import { SuiChain } from '../chains/SuiChain';
import { JsonRpcProvider } from 'ethers';
import { SuiClient } from '@mysten/sui/client';
import { SolanaChain } from '../chains/SolanaChain';
import { Connection } from '@solana/web3.js';
import { SolanaWallet } from '../wallets/SolanaWallet';
// Interface for the connector-specific return values
interface WalletState {
  connector: IConnector | null;
  status: ConnectorStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  hasError: boolean;
  isInstalled: boolean | null;
  isWalletReady: boolean;
  address: string | null;
  chainId: string | null;
  connect: () => Promise<any>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<IWallet<any, IChain<any>, IConnector, any>>;
  wallet: IWallet<any, IChain<any>, IConnector, any> | null;
  getWallet: () => IWallet<any, IChain<any>, IConnector, any> | null;
}

/**
 * Hook to interact with a specific wallet connector
 *
 * @param connectorId The connector ID to use
 * @returns Connector-specific state and methods
 */
export function useWallet(
  connectorId: string,
  {
    onConnect,
    onDisconnect,
    onAccountChanged,
    onChainChanged,
  }: {
    onConnect?: (
      cId: string,
      addr: string,
      wallet: IWallet<any, IChain<any>, IConnector, any>,
      chainConfig?: IChainConfig
    ) => void;
    onDisconnect?: (cId: string) => void;
    onAccountChanged?: (cId: string, address: string, wallet: IWallet<any, IChain<any>, IConnector, any>) => void;
    onChainChanged?: (
      cId: string,
      wallet: IWallet<any, IChain<any>, IConnector, any>,
      chainConfig?: IChainConfig
    ) => void;
  } = {}
): WalletState {
  const walletContext = useWalletConnectors();
  const { connectors, activeConnectors, connectorStatuses, chainConfigs, reconnect } = walletContext;

  // State for tracking transitional statuses (connecting, error)
  const [transitionalStatus, setTransitionalStatus] = useState<ConnectorStatus | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Track connection attempts to prevent race conditions
  const connectionAttemptRef = useRef<number>(0);
  const hasAttemptedReconnect = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);
  const walletRef = useRef<IWallet<any, IChain<any>, IConnector, any> | null>(null);

  // Get the connector instance
  const connector = useMemo(
    () => activeConnectors[connectorId] || connectors.find((c) => c.id === connectorId) || null,
    [activeConnectors, connectors, connectorId]
  );

  // Get current status, prioritizing transitional status
  const status = useMemo(() => {
    if (transitionalStatus) return transitionalStatus;
    return connectorStatuses[connectorId] || ConnectorStatus.DISCONNECTED;
  }, [connectorStatuses, connectorId, transitionalStatus]);

  // Initialize wallet state on first load
  useEffect(() => {
    const initializeWalletState = async () => {
      if (!connector || initializedRef.current) return;

      initializedRef.current = true;

      try {
        // Check if wallet is already connected
        const isConnectedResult = await connector.isConnected();

        if (isConnectedResult) {
          // Get connected addresses
          const addresses = await connector.getConnectedAddresses();
          if (addresses && addresses.length > 0) {
            setAddress(addresses[0]);

            // Get chain ID
            try {
              const currentChainId = await connector.getChainId();
              if (currentChainId) {
                setChainId(currentChainId);
              }
            } catch (chainError) {
              console.error(`Connected to ${connectorId} but failed to get chain ID:`, chainError);
            }
          }
        }

        // Mark initialization as complete
        setIsInitialized(true);
      } catch (error) {
        console.error(`Error initializing wallet state for ${connectorId}:`, error);
        // Even on error, mark as initialized to prevent infinite retry loops
        setIsInitialized(true);
      }
    };

    initializeWalletState();
  }, [connector, connectorId]);

  // Attempt auto-reconnect if needed
  useEffect(() => {
    const attemptReconnect = async () => {
      if (!connector || hasAttemptedReconnect.current || reconnect !== 'auto') {
        return;
      }

      hasAttemptedReconnect.current = true;

      try {
        // Only try to reconnect if we're not already connected and the connector has an active session
        if (status === ConnectorStatus.DISCONNECTED) {
          const isConnectedResult = await connector.isConnected();

          if (isConnectedResult) {
            setTransitionalStatus(ConnectorStatus.CONNECTING);

            // Call the connector's connect method
            const result = await connector.connect();

            if (result?.address) {
              setAddress(result.address);

              if (result.chainId) {
                setChainId(result.chainId);
              } else {
                // If chain ID is not available in the result, try to get it from the connector
                try {
                  const chainIdResult = await connector.getChainId();
                  if (chainIdResult) {
                    setChainId(chainIdResult);
                  }
                } catch (chainError) {
                  console.error(`Connected to ${connectorId} but failed to get chain ID:`, chainError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to auto-reconnect to ${connectorId}:`, error);
        setTransitionalStatus(ConnectorStatus.ERROR);
      }
    };

    attemptReconnect();
  }, [connector, connectorId, status, reconnect]);

  // Check if wallet is installed
  useEffect(() => {
    const checkWalletInstalled = async () => {
      if (connector) {
        try {
          const installed = await connector.isInstalled();
          setIsInstalled(installed);
        } catch (error) {
          console.error(`Failed to check if ${connector.name} is installed:`, error);
          setIsInstalled(false);
        }
      } else {
        setIsInstalled(null);
      }
    };

    checkWalletInstalled();
  }, [connector]);

  // Clear transitional status when context status changes
  useEffect(() => {
    if (connectorStatuses[connectorId]) {
      // Only clear if the status has changed to CONNECTED
      if (connectorStatuses[connectorId] === ConnectorStatus.CONNECTED) {
        setTransitionalStatus(null);
      }
    }
  }, [connectorStatuses, connectorId]);

  // Event listeners for status changes
  useWalletConnectorEvent({
    onConnect: (cId, addr, chain) => {
      if (cId === connectorId) {
        // Clear transitional status and set address and chainId
        setTransitionalStatus(null);
        setAddress(addr);
        if (chain) {
          setChainId(chain);
        }
      }
    },
    onDisconnect: (cId) => {
      if (cId === connectorId) {
        // Clear transitional status, address, and chainId
        setTransitionalStatus(null);
        setAddress(null);
        setChainId(null);
      }
    },
    onAccountChanged: (cId, addresses) => {
      if (cId === connectorId) {
        if (addresses.length > 0) {
          setAddress(addresses[0]);
        } else {
          setAddress(null);
        }
      }
    },
    onChainChanged: (cId, chain) => {
      if (cId === connectorId) {
        setChainId(chain);
      }
    },
  });

  // Connect function implementation
  const connect = useCallback(async () => {
    if (!connector) {
      throw new Error(`Connector with id "${connectorId}" not found`);
    }

    try {
      // Increment connection attempt to track this specific attempt
      const currentAttempt = ++connectionAttemptRef.current;

      // Set transitional status to connecting
      setTransitionalStatus(ConnectorStatus.CONNECTING);

      // Call the connector's connect method
      const result = await connector.connect();

      // Only process result if this is still the most recent connection attempt
      if (currentAttempt === connectionAttemptRef.current) {
        // If result has an address but the status hasn't been updated via event yet,
        // we'll manually trigger a status change after a short delay
        if (result?.address) {
          // Set a timeout to ensure the status gets updated even if event doesn't fire
          setTimeout(() => {
            if (transitionalStatus === ConnectorStatus.CONNECTING) {
              setTransitionalStatus(null);
              setAddress(result.address);

              // Also set chainId if available
              if (result.chainId) {
                setChainId(result.chainId);
              } else {
                // If chain ID is not available in the result, try to get it from the connector
                connector
                  .getChainId()
                  .then((chainIdResult) => {
                    if (chainIdResult) {
                      setChainId(chainIdResult);
                    }
                  })
                  .catch((error) => {
                    console.error('Error getting chain ID:', error);
                  });
              }
            }
          }, 500);
        }
      }

      return result;
    } catch (error) {
      // Set transitional status to error
      setTransitionalStatus(ConnectorStatus.ERROR);
      console.error(`Failed to connect to ${connectorId}:`, error);
      throw error;
    }
  }, [connector, connectorId, transitionalStatus]);

  // Disconnect function implementation
  const disconnect = useCallback(async () => {
    if (!connector || status !== ConnectorStatus.CONNECTED) {
      return;
    }

    try {
      // Call the connector's disconnect method
      await connector.disconnect();

      // Status should be updated via event callback, but let's ensure it
      setTimeout(() => {
        if (status === ConnectorStatus.CONNECTED) {
          setTransitionalStatus(ConnectorStatus.DISCONNECTED);
          setAddress(null);
        }
      }, 500);
    } catch (error) {
      console.error(`Failed to disconnect from ${connectorId}:`, error);
      throw error;
    }
  }, [connector, connectorId, status]);

  // SwitchChain function implementation
  const switchChain = useCallback(
    async (newChainId: string) => {
      if (!connector || status !== ConnectorStatus.CONNECTED) {
        throw new Error('Wallet not connected');
      }

      try {
        await connector.switchChainId(newChainId);
        while (walletRef.current?.chain?.id.toString() !== newChainId) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return walletRef.current;
      } catch (error) {
        console.error(`Failed to switch chain to ${newChainId}:`, error);
        throw error;
      }
    },
    [connector, status]
  );

  // Fetch address and chainId when connector or status changes
  useEffect(() => {
    const fetchConnectionData = async () => {
      if (connector && status === ConnectorStatus.CONNECTED) {
        try {
          // Get connected addresses
          const addresses = await connector.getConnectedAddresses();
          if (addresses && addresses.length > 0) {
            setAddress(addresses[0]);

            // Also get the chain ID
            try {
              const currentChainId = await connector.getChainId();
              if (currentChainId) {
                setChainId(currentChainId);
              }
            } catch (chainError) {
              console.error('Error getting chain ID:', chainError);
            }
          } else {
            setAddress(null);
          }
        } catch (error) {
          console.error('Error getting connected addresses:', error);
          setAddress(null);
        }
      } else if (status !== ConnectorStatus.CONNECTING) {
        // Don't clear address and chainId during connection to avoid flicker
        setAddress(null);
        setChainId(null);
      }
    };

    fetchConnectionData();
  }, [connector, status]);

  const wallet = useMemo(() => {
    if (status !== ConnectorStatus.CONNECTED || !connector || !address) {
      return null;
    }

    if (connector.chainType === ChainType.EVM) {
      const chain = chainConfigs.find((c) => c.id === chainId && c.chainType === ChainType.EVM);
      if (!chain) {
        return null;
      }
      const evmChain = new EvmChain(chain.name, chain as IChain<JsonRpcProvider>);
      return new EvmWallet(address, evmChain, connector as EvmConnector, connector.createWalletClient(evmChain));
    }

    if (connector.chainType === ChainType.SUI) {
      const chain = chainConfigs.find((c) => c.id === chainId && c.chainType === ChainType.SUI);
      if (!chain) {
        console.warn(`No chain config found for chainId: ${chainId}, Wallet will not be initialized`);
        // Attempt to get the chain ID again if it's not available
        if (!chainId) {
          connector
            .getChainId()
            .then((newChainId) => {
              if (newChainId) {
                setChainId(newChainId);
              }
            })
            .catch((error) => {
              console.error('Error getting chain ID:', error);
            });
        }
        return null;
      }
      const suiChain = new SuiChain(chain.name, chain as IChain<SuiClient>);
      return new SuiWallet(address, suiChain, connector as SuiConnector, connector.createWalletClient(suiChain));
    }

    if (connector.chainType === ChainType.SOLANA) {
      // Find a chain config matching the current chainId
      const chain = chainConfigs.find((c) => c.id === chainId && c.chainType === ChainType.SOLANA);

      if (!chain) {
        console.warn(`No chain config found for chainId: ${chainId}`);
        // Attempt to get the chain ID again if it's not available
        if (!chainId) {
          connector
            .getChainId()
            .then((newChainId) => {
              if (newChainId) {
                setChainId(newChainId);
              }
            })
            .catch((error) => {
              console.error('Error getting chain ID:', error);
            });
        }
        return null;
      }

      const solanaChain = new SolanaChain(chain.name, chain as IChain<Connection>);
      return new SolanaWallet(
        address,
        solanaChain,
        connector as SolanaConnector,
        connector.createWalletClient(solanaChain)
      );
    }
    return null;
  }, [status, address, chainId, connector, chainConfigs]);

  useEffect(() => {
    if (wallet) {
      walletRef.current = wallet;
    }
  }, [wallet]);

  // Event listeners for status changes
  useWalletConnectorEvent({
    onConnect: (cId, addr, chain) => {
      if (cId === connectorId) {
        console.log(`Connector ${cId} connected with address ${addr} on chain ${chain || 'unknown'}`);
        // Clear transitional status and set address and chainId
        setTransitionalStatus(null);
        setAddress(addr);
        if (chain) {
          setChainId(chain);
        }

        setTimeout(() => {
          const wallet = walletRef.current;
          const chainConfig = chainConfigs.find((c) => c.id === chain);
          if (wallet) {
            onConnect?.(cId, addr, wallet, chainConfig);
          }
        }, 100);
      }
    },
    onDisconnect: (cId) => {
      if (cId === connectorId) {
        console.log(`Connector ${cId} disconnected`);
        // Clear transitional status, address, and chainId
        setTransitionalStatus(null);
        setAddress(null);
        setChainId(null);
        onDisconnect?.(cId);
      }
    },
    onAccountChanged: (cId, addresses) => {
      if (cId === connectorId) {
        console.log(`Connector ${cId} accounts changed to ${addresses.join(', ')}`);
        if (addresses.length > 0) {
          setAddress(addresses[0]);
        } else {
          setAddress(null);
        }
        setTimeout(() => {
          const wallet = walletRef.current;
          if (wallet) {
            if (addresses.length > 0 && addresses[0] != wallet.address) {
              onAccountChanged?.(cId, addresses[0], wallet);
            }
          }
        }, 100);
      }
    },
    onChainChanged: (cId, chain) => {
      if (cId === connectorId) {
        console.log(`Connector ${cId} chain changed to ${chain}`);
        setChainId(chain);

        setTimeout(() => {
          const wallet = walletRef.current;
          const chainConfig = chainConfigs.find((c) => c.id === chain);
          if (wallet) {
            onChainChanged?.(cId, wallet, chainConfig);
          }
        }, 100);
      }
    },
  });

  // Derive status booleans
  const isConnected = status === ConnectorStatus.CONNECTED;
  const isConnecting = status === ConnectorStatus.CONNECTING;
  const isDisconnected = status === ConnectorStatus.DISCONNECTED;
  const hasError = status === ConnectorStatus.ERROR;

  // Determine if wallet is fully ready for use
  const isWalletReady = useMemo(() => {
    // Wallet is ready when:
    // 1. Initialization is complete
    // 2. Wallet is connected
    // 3. We have a valid address
    // 4. We have a valid chainId
    // 5. The wallet object is instantiated

    return isInitialized && isConnected && !!address && !!chainId && !!wallet && !isConnecting && !hasError;
  }, [isInitialized, isConnected, address, chainId, wallet, isConnecting, hasError]);

  return {
    connector,
    wallet,
    status,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    isInstalled,
    isWalletReady,
    address,
    chainId,
    connect,
    disconnect,
    switchChain,
    getWallet: () => walletRef.current,
  };
}
