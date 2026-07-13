declare module "next" {
  export interface Metadata {
    [key: string]: unknown;
  }

  export interface NextConfig {
    [key: string]: unknown;
  }
}

declare module "next/link" {
  import * as React from "react";

  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: React.ReactNode;
  };

  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;

  export default Link;
}

declare module "next/navigation" {
  export function redirect(url: string): never;
  export function notFound(): never;
  export function usePathname(): string;
}

declare module "next/cache" {
  export function revalidatePath(path: string, type?: "page" | "layout"): void;
}

declare module "next/server" {
  export class NextRequest extends Request {
    cookies: {
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string): void;
    };
  }

  export class NextResponse extends Response {
    static next(init?: unknown): NextResponse;
    static json(data: unknown, init?: ResponseInit): NextResponse;
    cookies: {
      set(
        name: string,
        value: string,
        options?: Record<string, unknown>,
      ): void;
      set(options: {
        name: string;
        value: string;
        options?: Record<string, unknown>;
      }): void;
    };
  }
}

declare module "next/headers" {
  export function cookies(): Promise<{
    getAll(): Array<{ name: string; value: string }>;
    set(
      name: string,
      value: string,
      options?: Record<string, unknown>,
    ): void;
  }>;
}

declare module "next/font/google" {
  export function Sora(config: Record<string, unknown>): {
    variable: string;
    className: string;
  };

  export function IBM_Plex_Mono(config: Record<string, unknown>): {
    variable: string;
    className: string;
  };
}

declare module "next/image-types/global" {}

declare module "next/types.js" {
  export type ResolvingMetadata = Promise<unknown>;
  export type ResolvingViewport = Promise<unknown>;
}

declare module "next/server.js" {
  export * from "next/server";
}
