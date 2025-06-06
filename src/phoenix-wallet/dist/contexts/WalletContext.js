import { jsx as _jsx } from 'react/jsx-runtime';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConnectorStatus } from '../connectors/types';
// Default empty arrays for context
const DEFAULT_CONNECTORS = [];
const DEFAULT_CHAIN_CONFIGS = [];
// Create context with default values
const WalletContext = createContext({
  connectors: DEFAULT_CONNECTORS,
  chainConfigs: DEFAULT_CHAIN_CONFIGS,
  connectorStatuses: {},
  activeConnectors: {},
  reconnect: 'none',
});
export const useWalletConnectors = () => useContext(WalletContext);
export const WalletProvider = ({ children, connectors = [], chainConfigs = [], reconnect = 'none' }) => {
  const [activeConnectors, setActiveConnectors] = useState({});
  const [connectorStatuses, setConnectorStatuses] = useState({});
  // Initialize connector statuses
  useEffect(() => {
    const initialStatuses = {};
    connectors.forEach((connector) => {
      initialStatuses[connector.id] = ConnectorStatus.DISCONNECTED;
    });
    setConnectorStatuses(initialStatuses);
  }, [connectors]);
  // Auto reconnect wallets from last session if enabled
  useEffect(() => {
    const autoReconnect = async () => {
      if (reconnect === 'auto') {
        // Attempt to reconnect all connectors that might have active sessions
        for (const connector of connectors) {
          try {
            const isConnected = await connector.isConnected();
            if (isConnected) {
              console.log(`Auto-reconnecting to ${connector.id}...`);
              const result = await connector.connect();
              if (result) {
                console.log(`Successfully reconnected to ${connector.id} and chain ${result.chainId}`);
              }
            }
          } catch (error) {
            console.error(`Failed to auto-reconnect to ${connector.id}:`, error);
          }
        }
      }
    };
    autoReconnect();
  }, [connectors, reconnect]);
  // Register global event listeners for all connectors
  useEffect(() => {
    const connectorCallback = {
      async onConnect(connectorId, address, chainId) {
        // When a connector connects, update its status and add it to active connectors
        const connector = connectors.find((c) => c.id === connectorId);
        if (connector) {
          setConnectorStatuses((prev) => ({
            ...prev,
            [connectorId]: ConnectorStatus.CONNECTED,
          }));
          setActiveConnectors((prev) => ({
            ...prev,
            [connectorId]: connector,
          }));
        }
      },
      async onDisconnect(connectorId, address) {
        // When a connector disconnects, update its status and remove from active connectors
        setConnectorStatuses((prev) => ({
          ...prev,
          [connectorId]: ConnectorStatus.DISCONNECTED,
        }));
        setActiveConnectors((prev) => {
          const newState = { ...prev };
          delete newState[connectorId];
          return newState;
        });
      },
      async onChainChanged(connectorId, chainId) {
        // Chain changes don't affect connection status
        console.log(`Chain changed for ${connectorId} to ${chainId}`);
      },
      async onAccountChanged(connectorId, addresses) {
        // Account changes don't affect connection status
        console.log(`Accounts changed for ${connectorId} to ${addresses.join(', ')}`);
      },
    };
    // Register the callback with all connectors
    connectors.forEach((connector) => {
      connector.registerConnectorCallback(connectorCallback);
    });
    // Cleanup when the component unmounts
    return () => {
      connectors.forEach((connector) => {
        connector.unregisterConnectorCallback(connectorCallback);
      });
    };
  }, [connectors]);
  const contextValue = useMemo(
    () => ({
      chainConfigs,
      connectors,
      activeConnectors,
      connectorStatuses,
      reconnect,
    }),
    [chainConfigs, connectors, activeConnectors, connectorStatuses, reconnect]
  );
  return _jsx(WalletContext.Provider, { value: contextValue, children: children });
};
//# sourceMappingURL=WalletContext.js.map
