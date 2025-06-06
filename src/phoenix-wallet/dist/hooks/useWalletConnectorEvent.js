import { useCallback, useEffect, useRef } from 'react';
import { useWalletConnectors } from '../contexts/WalletContext';
/**
 * Hook to handle wallet connector events
 *
 * @param props Event handlers for wallet connector events
 */
export function useWalletConnectorEvent({ onConnect, onDisconnect, onChainChanged, onAccountChanged }) {
  const { connectors } = useWalletConnectors();
  const handlersRef = useRef({ onConnect, onDisconnect, onChainChanged, onAccountChanged });
  // Update handlers reference when they change
  useEffect(() => {
    handlersRef.current = { onConnect, onDisconnect, onChainChanged, onAccountChanged };
  }, [onConnect, onDisconnect, onChainChanged, onAccountChanged]);
  // Create connector callback
  const connectorCallback = useCallback(() => {
    const callback = {
      async onConnect(connectorId, address, chainId) {
        if (handlersRef.current.onConnect) {
          await handlersRef.current.onConnect(connectorId, address, chainId);
        }
      },
      async onDisconnect(connectorId, address) {
        if (handlersRef.current.onDisconnect) {
          await handlersRef.current.onDisconnect(connectorId, address);
        }
      },
      async onChainChanged(connectorId, chainId) {
        if (handlersRef.current.onChainChanged) {
          await handlersRef.current.onChainChanged(connectorId, chainId);
        }
      },
      async onAccountChanged(connectorId, addresses) {
        if (handlersRef.current.onAccountChanged) {
          await handlersRef.current.onAccountChanged(connectorId, addresses);
        }
      },
    };
    return callback;
  }, []);
  // Register and unregister callback for each active connector
  useEffect(() => {
    const callback = connectorCallback();
    // Register callback with all active connectors
    Object.values(connectors).forEach((connector) => {
      connector.registerConnectorCallback(callback);
    });
    // Cleanup: unregister callbacks when component unmounts
    return () => {
      Object.values(connectors).forEach((connector) => {
        connector.unregisterConnectorCallback(callback);
      });
    };
  }, [connectors, connectorCallback]);
}
//# sourceMappingURL=useWalletConnectorEvent.js.map
