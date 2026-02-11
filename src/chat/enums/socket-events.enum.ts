export enum SocketEvent {
  Connect = 'connect',
  ConnectError = 'connect_error',

  Disconnect = 'disconnect',
  Reconnect = 'reconnect',

  ReconnectAttemp = 'reconnect_attemp',
  ReconnectError = 'reconnect_error',
  ReconnectFailed = 'reconnect_failed',
}
