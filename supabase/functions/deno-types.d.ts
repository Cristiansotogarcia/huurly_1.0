// Type definitions for Deno

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;

  export function serve(options: ServeOptions): void;
}

declare module "http/server" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

declare module "stripe" {
  namespace Stripe {
    namespace Checkout {
      interface Session {
        metadata?: {
          user_id?: string;
        };
        subscription?: string;
      }
    }

    interface Subscription {
      items: any;
      id: string;
      status: string;
      current_period_start: number;
      current_period_end: number;
    }
  }

  const Stripe: {
    new(apiKey: string, options?: { apiVersion: string }): {
      webhooks: {
        constructEvent(body: string, signature: string, secret: string): any;
      };
      subscriptions: {
        retrieve(id: string): Promise<Stripe.Subscription>;
      };
      checkout: {
        sessions: {
          create(params: any): Promise<any>;
        };
      };
      customers: {
        list(params: any): Promise<{ data: any[] }>;
        create(params: any): Promise<any>;
      };
    };
  };
  
  export default Stripe;
}

declare module "@supabase/supabase-js" {
  export function createClient(url: string, key: string, options?: any): any;
}