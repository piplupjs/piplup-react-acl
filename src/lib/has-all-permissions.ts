import type { Permission } from '../index';
import { permissionGrants } from './internal/permission-grants';

/**
 * Whether a granted permission list covers every required permission.
 *
 * An empty list of required permissions means "no requirement" and passes.
 */
export function hasAllPermissions(
  grantedPermissions: readonly string[] | undefined,
  requiredPermissions: Permission | readonly Permission[],
): boolean {
  const required =
    typeof requiredPermissions === 'string' ? [requiredPermissions] : requiredPermissions;

  if (required.length === 0) {
    return true;
  }

  return required.every((permission) => permissionGrants(grantedPermissions, permission));
}
