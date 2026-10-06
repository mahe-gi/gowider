declare module "ws" {
  export default class WebSocket {
    constructor(address: string | URL, protocols?: string | string[], options?: unknown);
    send(data: unknown): void;
    close(code?: number, data?: string): void;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
}
