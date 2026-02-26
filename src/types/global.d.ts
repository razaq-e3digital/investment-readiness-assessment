import type { OrgPermission, OrgRole } from '@/types/Auth';

declare global {
  // Clerk authorization type augmentation for role/permission type safety
  // eslint-disable-next-line ts/consistent-type-definitions
  interface ClerkAuthorization {
    permission: OrgPermission;
    role: OrgRole;
  }

  // Google Analytics gtag function — interface Window augmentation required for global scope
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
    dataLayer: unknown[];
  }
}
