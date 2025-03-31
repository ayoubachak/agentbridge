declare module 'isomorphic-ws' {
  // Importing the WebSocket type from ws for compatibility
  import * as WS from 'ws';
  
  // Define WebSocket interface that matches both browser and node implementations
  interface WebSocket extends WS {
    // Additional browser-specific methods/properties
    addEventListener(type: string, listener: Function, options?: any): void;
    removeEventListener(type: string, listener: Function, options?: any): void;
    
    // Common properties
    readyState: number;
    onopen: ((this: WebSocket, ev: any) => any) | null;
    onclose: ((this: WebSocket, ev: any) => any) | null;
    onmessage: ((this: WebSocket, ev: any) => any) | null;
    onerror: ((this: WebSocket, ev: any) => any) | null;
    
    // Methods
    close(code?: number, reason?: string): void;
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  }
  
  // Define statics
  namespace WebSocket {
    const CONNECTING: number;
    const OPEN: number;
    const CLOSING: number;
    const CLOSED: number;
    
    // Node-specific events
    interface MessageEvent {
      data: any;
      type: string;
      target: WebSocket;
    }
  }
  
  // Define constructor
  interface WebSocketConstructor {
    new(url: string, protocols?: string | string[]): WebSocket;
    readonly prototype: WebSocket;
    readonly CONNECTING: number;
    readonly OPEN: number;
    readonly CLOSING: number;
    readonly CLOSED: number;
  }
  
  // Export the constructor as default
  const WebSocket: WebSocketConstructor;
  export default WebSocket;
} 