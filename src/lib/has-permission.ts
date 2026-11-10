import type { Permission } from '../index';
import type { AccessPrincipal, PermissionMatchMode } from '../types';
import { hasAllPermissions } from './has-all-permissions';
import { hasAnyPermissions } from './has-any-permission';

/**
 * Whether a principal holds the required permissions.
 *
 * Defaults to `ALL`: every required permission must be granted. Pass `ANY` to pass on one match.
 * A `null` or `undefined` principal is denied.
 */
export function hasPermission(
  principal: AccessPrincipal,
  requiredPermissions: Permission | readonly Permission[],
  matchMode: PermissionMatchMode = 'ALL',
): boolean {
  return matchMode === 'ANY'
    ? hasAnyPermissions(principal?.permissions, requiredPermissions)
    : hasAllPermissions(principal?.permissions, requiredPermissions);
}
