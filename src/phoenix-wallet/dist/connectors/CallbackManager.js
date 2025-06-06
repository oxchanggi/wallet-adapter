export class CallbackManager {
  constructor(connectorId) {
    this.connectorCallbacks = [];
    this.connectorId = connectorId;
  }
  registerConnectorCallback(callback) {
    this.connectorCallbacks.push(callback);
  }
  unregisterConnectorCallback(callback) {
    this.connectorCallbacks = this.connectorCallbacks.filter((cb) => cb !== callback);
  }
  notifyConnect(address, chainId) {
    this.connectorCallbacks.forEach((callback) => callback.onConnect(this.connectorId, address, chainId));
  }
  notifyDisconnect(address) {
    this.connectorCallbacks.forEach((callback) => callback.onDisconnect(this.connectorId, address));
  }
  notifyChainChanged(chainId) {
    this.connectorCallbacks.forEach((callback) => callback.onChainChanged(this.connectorId, chainId));
  }
  notifyAccountChanged(address) {
    this.connectorCallbacks.forEach((callback) => callback.onAccountChanged(this.connectorId, address));
  }
}
//# sourceMappingURL=CallbackManager.js.map
