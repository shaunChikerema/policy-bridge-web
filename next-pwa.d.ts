declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: string[];
    [key: string]: unknown; // safer alternative to `any`
  }

  const withPWA: (options: PWAOptions) => (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
