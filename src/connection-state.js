/**
 * Shared connection states used by both real and simulated SimConnect services.
 */

export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SIMULATOR_NOT_RUNNING: 'simulator_not_running',
  CONNECTION_LOST: 'connection_lost',
  ERROR: 'error'
};
