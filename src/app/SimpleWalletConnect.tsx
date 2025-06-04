import React from 'react';
import { useWalletConnectors } from '@/phoenix-wallet';
import { ConnectorItem } from './ConnectorItem';

export const SimpleWalletConnect: React.FC = () => {
  const { connectors } = useWalletConnectors();

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Connect Wallet</h2>
      
      <div className="space-y-4">
        {connectors.map((connector) => (
          <ConnectorItem 
            key={connector.id}
            connectorId={connector.id}
          />
        ))}
      </div>
    </div>
  );
}; 