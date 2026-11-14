import { permissionGrants } from './internal/permission-grants';

import type { Permission } from '../index';

/**
 * Whether a granted permission list covers at least one of the required permissions.
 *
 * An empty list of required permissions means "no requirement" and passes, the same as
 * {@link hasAllPermissions}.
 */
export function hasAnyPermissions(
  grantedPermissions: readonly string[] | undefined,
  requiredPermissions: Permission | readonly Permission[],
): boolean {
  const required =
    typeof requiredPermissions === 'string' ? [requiredPermissions] : requiredPermissions;

  if (required.length === 0) {
    return true;
  }

  return required.some((permission) => permissionGrants(grantedPermissions, permission));
}
