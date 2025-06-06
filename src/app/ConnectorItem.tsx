import { ConnectorStatus, useWallet, EvmChain, ChainType, useWalletConnectors } from '@phoenix-wallet/wallet-adapter';
import { JsonRpcProvider } from 'ethers';
import { useState } from 'react';

interface ConnectorItemProps {
  connectorId: string;
}

export const ConnectorItem: React.FC<ConnectorItemProps> = ({ connectorId }) => {
  const {
    connector,
    status,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    isInstalled,
    address,
    chainId,
    connect,
    disconnect,
    switchChain,
    wallet,
  } = useWallet(connectorId);

  const { chainConfigs } = useWalletConnectors();

  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAddingChain, setIsAddingChain] = useState<boolean>(false);
  const [addChainError, setAddChainError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string>('');

  if (!connector) {
    return null;
  }

  // Format address for display
  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get the status color for UI
  const getStatusColor = () => {
    switch (status) {
      case ConnectorStatus.CONNECTED:
        return 'bg-green-500';
      case ConnectorStatus.CONNECTING:
        return 'bg-yellow-500';
      case ConnectorStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Get the status text for UI
  const getStatusText = () => {
    switch (status) {
      case ConnectorStatus.CONNECTED:
        return 'Connected';
      case ConnectorStatus.CONNECTING:
        return 'Connecting...';
      case ConnectorStatus.ERROR:
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionError(null);
      console.log(`Attempting to connect to ${connector.name}...`);
      const result = await connect();
      console.log(`Connection result:`, result);
    } catch (error: any) {
      console.error(`Failed to connect to ${connector.name}:`, error);
      setConnectionError(error.message || 'Unknown error occurred');
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log(`Disconnecting from ${connector.name}...`);
      await disconnect();
    } catch (error: any) {
      console.error(`Failed to disconnect from ${connector.name}:`, error);
    }
  };

  const handleInstall = () => {
    window.open(connector.installLink, '_blank');
  };

  const handleAddChain = async () => {
    if (!connector || connector.chainType !== ChainType.EVM || !selectedChainId) {
      return;
    }

    setIsAddingChain(true);
    setAddChainError(null);

    try {
      // Find the selected chain from chainConfigs
      const chainToAdd = chainConfigs.find((chain) => chain.id === selectedChainId);

      if (!chainToAdd) {
        throw new Error('Selected chain not found');
      }

      // Create the EvmChain instance
      const provider = new JsonRpcProvider(chainToAdd.publicRpcUrl);
      const chainWithProvider = {
        ...chainToAdd,
        chainName: chainToAdd.name,
        provider: provider,
      };

      const evmChain = new EvmChain(chainToAdd.name, chainWithProvider as any);
      await connector.addChain(evmChain);
      console.log(`Successfully added chain: ${chainToAdd.name}`);

      // Reset the selection after successful addition
      setSelectedChainId('');
    } catch (error: any) {
      console.error(`Failed to add chain:`, error);
      setAddChainError(error.message || 'Failed to add chain');
    } finally {
      setIsAddingChain(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {connector.logo && (
            <img
              src={connector.logo}
              alt={`${connector.name} logo`}
              className="w-8 h-8 mr-3"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <h3 className="font-medium text-lg text-black">{connector.name}</h3>
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></span>
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>
      </div>

      {isConnected && address && (
        <div className="text-sm text-gray-600 mb-3">
          <div className="font-mono">Address: {formatAddress(address)}</div>
          {chainId && <div className="mt-1">Chain ID: {chainId}</div>}
        </div>
      )}

      <div className="mt-3">
        {isInstalled === false && (
          <button
            className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
            onClick={handleInstall}
          >
            Install {connector.name}
          </button>
        )}

        {isInstalled && isDisconnected && (
          <button
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            onClick={handleConnect}
          >
            Connect
          </button>
        )}

        {isConnecting && (
          <div>
            <button className="w-full py-2 px-4 bg-gray-400 text-white rounded cursor-wait mb-2" disabled>
              <span className="inline-block mr-2">
                <svg
                  className="animate-spin h-4 w-4 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              Connecting...
            </button>
            <p className="text-xs text-gray-500 text-center">Check your wallet for connection prompt</p>
          </div>
        )}

        {isConnected && (
          <div className="space-y-2">
            <button
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>

            {connector.chainType === ChainType.EVM && (
              <>
                <div className="mt-3">
                  <label
                    htmlFor={`chain-select-${connectorId}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select chain to add
                  </label>
                  <select
                    id={`chain-select-${connectorId}`}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedChainId}
                    onChange={(e) => setSelectedChainId(e.target.value)}
                    disabled={isAddingChain}
                  >
                    <option value="">Select a chain</option>
                    {chainConfigs
                      .filter((chain) => chain.chainType === ChainType.EVM && chain.id !== chainId)
                      .map((chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name} ({chain.id})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  onClick={handleAddChain}
                  disabled={isAddingChain || !selectedChainId}
                >
                  {isAddingChain ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 text-white inline-block mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Chain...
                    </span>
                  ) : (
                    'Add Selected Chain'
                  )}
                </button>
              </>
            )}

            {addChainError && <p className="text-red-500 text-sm mt-1">{addChainError}</p>}
          </div>
        )}

        {hasError && (
          <div>
            <p className="text-red-500 text-sm mb-2">{connectionError || 'Failed to connect. Please try again.'}</p>
            <button
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              onClick={handleConnect}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">ID: {connectorId}</div>
    </div>
  );
};
