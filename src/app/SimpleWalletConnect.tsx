import { ChainType, useWalletConnectors } from '@/phoenix-wallet';
import { useWallet } from '@/phoenix-wallet/hooks/useWallet';
import { EvmTransaction } from '@/phoenix-wallet/wallets/EvmWallet';
import { SolanaTransaction } from '@/phoenix-wallet/wallets/SolanaWallet';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  MessageV0,
} from '@solana/web3.js';
import React, { useState } from 'react';
import { ConnectorItem } from './ConnectorItem';

export const SimpleWalletConnect: React.FC = () => {
  const { connectors } = useWalletConnectors();
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
  const [message, setMessage] = useState<string>('Hello Web3!');
  const [transactionData, setTransactionData] = useState<{
    to: string;
    value: string;
    data: string;
  }>({
    to: '',
    value: '0',
    data: '0x',
  });
  const [rawTransaction, setRawTransaction] = useState<string>('');
  const [operationResult, setOperationResult] = useState<{
    type: string;
    data: string;
    error?: string;
  } | null>(null);
  const [solanaMultipleTransactions, setSolanaMultipleTransactions] = useState<boolean>(false);
  const [useVersionedTransaction, setUseVersionedTransaction] = useState<boolean>(false);

  const { wallet, isConnected, address, chainId } = useWallet(selectedConnectorId);

  const handleConnectorSelect = (connectorId: string) => {
    setSelectedConnectorId(connectorId);
    setOperationResult(null);
  };

  const handleSignMessage = async () => {
    if (!wallet || !message) return;

    try {
      setOperationResult({ type: 'loading', data: 'Signing message...' });
      const signature = await wallet.signMessage(message);
      setOperationResult({
        type: 'success',
        data: `Message signed successfully! Signature: ${signature}`,
      });
    } catch (error: any) {
      setOperationResult({
        type: 'error',
        data: 'Failed to sign message',
        error: error.message,
      });
    }
  };

  const createSolanaTransaction = async (): Promise<SolanaTransaction> => {
    if (!address) {
      throw new Error('Wallet address is not available');
    }

    const fromPublicKey = new PublicKey(address);
    const toPublicKey = new PublicKey(transactionData.to);
    const valueInLamports = Math.floor(parseFloat(transactionData.value) * 1000000000); // Convert SOL to lamports
    const connection = wallet?.chain.provider as Connection;
    const recentBlockhash = await connection.getLatestBlockhash();

    if (useVersionedTransaction) {
      // Create a versioned transaction
      const instruction = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: valueInLamports,
      });

      // The actual transaction message construction would require a real connection
      // This is a simplified example
      const messageV0 = new TransactionMessage({
        payerKey: fromPublicKey,
        recentBlockhash: recentBlockhash.blockhash, // This would be fetched from a real connection
        instructions: [instruction],
      }).compileToV0Message();

      return new VersionedTransaction(messageV0);
    } else {
      // Create a legacy transaction
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: valueInLamports,
        })
      );
      transaction.feePayer = fromPublicKey;
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.lastValidBlockHeight = recentBlockhash.lastValidBlockHeight;

      return transaction;
    }
  };

  const handleSignTransaction = async () => {
    if (!wallet || !transactionData.to) return;

    try {
      setOperationResult({ type: 'loading', data: 'Signing transaction...' });

      // Handle different wallet types
      if (selectedConnectorId.includes('solana')) {
        const transaction = await createSolanaTransaction();
        const signedTx = await wallet.signTransaction(transaction);
        setOperationResult({
          type: 'success',
          data: `Transaction signed successfully! Signed TX: ${signedTx.slice(0, 30)}...`,
        });
        setRawTransaction(signedTx);
      } else {
        // EVM transaction
        const transaction: EvmTransaction = {
          to: transactionData.to,
          value: transactionData.value,
          data: transactionData.data,
        };
        const signedTx = await wallet.signTransaction(transaction);
        setOperationResult({
          type: 'success',
          data: `Transaction signed successfully! Signed TX: ${signedTx.slice(0, 30)}...`,
        });
        setRawTransaction(signedTx);
      }
    } catch (error: any) {
      setOperationResult({
        type: 'error',
        data: 'Failed to sign transaction',
        error: error.message,
      });
    }
  };

  const handleSignAllTransactions = async () => {
    if (!wallet || !transactionData.to || !selectedConnectorId.includes('solana')) return;

    try {
      setOperationResult({ type: 'loading', data: 'Signing multiple transactions...' });

      // Create multiple Solana transactions
      const transaction1 = await createSolanaTransaction();
      const transaction2 = await createSolanaTransaction();

      const signedTxs = await wallet.signAllTransactions([transaction1, transaction2]);
      setOperationResult({
        type: 'success',
        data: `Multiple transactions signed successfully! First TX: ${signedTxs[0].slice(0, 30)}...`,
      });
    } catch (error: any) {
      setOperationResult({
        type: 'error',
        data: 'Failed to sign multiple transactions',
        error: error.message,
      });
    }
  };

  const handleSendTransaction = async () => {
    if (!wallet || !transactionData.to) return;

    try {
      setOperationResult({ type: 'loading', data: 'Sending transaction...' });

      if (selectedConnectorId.includes('solana')) {
        const transaction = await createSolanaTransaction();
        const txHash = await wallet.sendTransaction(transaction);
        setOperationResult({
          type: 'success',
          data: `Transaction sent successfully! TX Hash: ${txHash}`,
        });
      } else {
        // EVM transaction
        const transaction: EvmTransaction = {
          to: transactionData.to,
          value: transactionData.value,
          data: transactionData.data,
        };
        const txHash = await wallet.sendTransaction(transaction);
        setOperationResult({
          type: 'success',
          data: `Transaction sent successfully! TX Hash: ${txHash}`,
        });
      }
    } catch (error: any) {
      setOperationResult({
        type: 'error',
        data: 'Failed to send transaction',
        error: error.message,
      });
    }
  };

  const handleSendRawTransaction = async () => {
    if (!wallet || !rawTransaction) return;

    try {
      setOperationResult({ type: 'loading', data: 'Sending raw transaction...' });
      const txHash = await wallet.sendRawTransaction(rawTransaction);
      setOperationResult({
        type: 'success',
        data: `Raw transaction sent successfully! TX Hash: ${txHash}`,
      });
    } catch (error: any) {
      setOperationResult({
        type: 'error',
        data: 'Failed to send raw transaction',
        error: error.message,
      });
    }
  };

  // Determine if the selected connector is Solana
  const isSolana = wallet?.chain.chainType === ChainType.SOLANA;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white">
      <h2 className="text-2xl font-bold mb-6 text-black">Connect Wallet</h2>

      {/* Wallet Connector Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-black">Select Wallet Connector</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              className={`px-4 py-2 rounded-lg border ${
                selectedConnectorId === connector.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleConnectorSelect(connector.id)}
            >
              {connector.name} ({connector.chainType})
            </button>
          ))}
        </div>

        {selectedConnectorId && <ConnectorItem connectorId={selectedConnectorId} />}
      </div>

      {/* Wallet Operations */}
      {isConnected && wallet && (
        <div className="mt-8 space-y-8">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Wallet Info</h3>
            <p className="text-gray-800">
              <strong className="text-black">Address:</strong> <span className="font-mono text-black">{address}</span>
            </p>
            <p className="text-gray-800">
              <strong className="text-black">Chain ID:</strong> <span className="font-mono text-black">{chainId}</span>
            </p>
          </div>

          {/* Sign Message */}
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Sign Message</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-black mb-1">Message</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition placeholder-gray-400 text-black"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Enter your message here..."
              />
            </div>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              onClick={handleSignMessage}
            >
              Sign Message
            </button>
          </div>

          {/* Sign Transaction */}
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Sign Transaction</h3>
            <div className="space-y-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {isSolana ? 'To Address (Solana Public Key)' : 'To Address'}
                </label>
                <input
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition placeholder-gray-400 text-black"
                  value={transactionData.to}
                  onChange={(e) => setTransactionData((prev) => ({ ...prev, to: e.target.value }))}
                  placeholder={isSolana ? '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnwgX5r' : '0xabc...def'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {isSolana ? 'Value (in SOL)' : 'Value (in wei)'}
                </label>
                <input
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition placeholder-gray-400 text-black"
                  value={transactionData.value}
                  onChange={(e) => setTransactionData((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder={isSolana ? '0.01' : '1000000000000000'}
                />
              </div>
              {!isSolana && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Data</label>
                  <input
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition placeholder-gray-400 text-black"
                    value={transactionData.data}
                    onChange={(e) => setTransactionData((prev) => ({ ...prev, data: e.target.value }))}
                    placeholder="0x0123456789abcdef"
                  />
                </div>
              )}
              {isSolana && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="useVersionedTransaction"
                    checked={useVersionedTransaction}
                    onChange={() => setUseVersionedTransaction(!useVersionedTransaction)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="useVersionedTransaction" className="text-sm font-medium text-black">
                    Use Versioned Transaction
                  </label>
                </div>
              )}
            </div>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              onClick={handleSignTransaction}
            >
              Sign Transaction
            </button>
          </div>

          {/* Sign All Transactions (Solana only) */}
          {isSolana && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-black">Sign All Transactions (Solana)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Sign multiple transactions at once using the same transaction data
              </p>
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                onClick={handleSignAllTransactions}
              >
                Sign Multiple Transactions
              </button>
            </div>
          )}

          {/* Send Transaction */}
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Send Transaction</h3>
            <p className="text-sm text-gray-600 mb-3">Uses the same transaction data as the Sign Transaction section</p>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              onClick={handleSendTransaction}
            >
              Send Transaction
            </button>
          </div>

          {/* Send Raw Transaction */}
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-black">Send Raw Transaction</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-black mb-1">Raw Transaction (base64)</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition font-mono placeholder-gray-400 text-black"
                value={rawTransaction}
                onChange={(e) => setRawTransaction(e.target.value)}
                rows={2}
                placeholder={
                  isSolana
                    ? 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDyf2cSYf0apvP4BeGu/HH2cIrF+7QFtYEEvH4Q9t+mQAAAAAAAAAAqcdptXNWyMB3SgeuXbXgQvdJMr2EGqCbTjLrLfP8JEUBAgIAAQwCAAAAKgAAAAAAAAA='
                    : '0x89205a3a3b2a136b355f67371d9153afa4050e13c8458cd50a1e40783d37d39b...'
                }
              />
            </div>
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              onClick={handleSendRawTransaction}
            >
              Send Raw Transaction
            </button>
          </div>
        </div>
      )}

      {/* Operation Result */}
      {operationResult && (
        <div
          className={`mt-6 p-4 rounded-lg shadow-sm border ${
            operationResult.type === 'success'
              ? 'bg-gray-50 border-green-300'
              : operationResult.type === 'error'
                ? 'bg-gray-50 border-red-300'
                : 'bg-gray-50 border-yellow-300'
          }`}
        >
          <h3 className="font-medium mb-2 text-black">
            {operationResult.type === 'success'
              ? '✅ Success'
              : operationResult.type === 'error'
                ? '❌ Error'
                : '⏳ Processing'}
          </h3>
          <p
            className={
              operationResult.type === 'success'
                ? 'text-black'
                : operationResult.type === 'error'
                  ? 'text-black'
                  : 'text-black'
            }
          >
            {operationResult.data}
          </p>
          {operationResult.error && <p className="text-red-600 text-sm mt-1 font-medium">{operationResult.error}</p>}
        </div>
      )}
    </div>
  );
};
