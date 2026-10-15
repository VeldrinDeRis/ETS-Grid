/// <reference types="astro/client" />

// Власна клієнтська директива (SPEC-002 §3.10.1, D-069): острів оживає при першому намірі.
declare module 'astro' {
  interface AstroClientDirectives {
    'client:intent'?: boolean;
  }
}

export {};
