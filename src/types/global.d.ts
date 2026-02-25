import type { OrgPermission, OrgRole } from '@/types/Auth';

declare global {
  // Clerk authorization type augmentation for role/permission type safety
  // eslint-disable-next-line ts/consistent-type-definitions
  interface ClerkAuthorization {
    permission: OrgPermission;
    role: OrgRole;
  }
}
