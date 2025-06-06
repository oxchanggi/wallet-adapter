import { CallbackManager } from './CallbackManager';
export class Connector {
  constructor(id, name, logo, dappMetadata) {
    this.id = id;
    this.name = name;
    this.logo = logo;
    this.dappMetadata = dappMetadata;
    this.callbackManager = new CallbackManager(id);
  }
  async handleEventConnect(address, chainId) {
    this.callbackManager.notifyConnect(address, chainId);
  }
  async handleEventDisconnect(address) {
    this.callbackManager.notifyDisconnect(address);
  }
  async handleEventChainChanged(chainId) {
    const formattedChainId = chainId.startsWith('0x') ? parseInt(chainId, 16).toString() : chainId;
    this.callbackManager.notifyChainChanged(formattedChainId);
  }
  async handleEventAccountChanged(addresses) {
    this.callbackManager.notifyAccountChanged(addresses);
  }
  registerConnectorCallback(callback) {
    this.callbackManager.registerConnectorCallback(callback);
  }
  unregisterConnectorCallback(callback) {
    this.callbackManager.unregisterConnectorCallback(callback);
  }
}
//# sourceMappingURL=IConnector.js.map
