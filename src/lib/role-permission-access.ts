import type { AssignablePermission } from '../index';
import type { RolePermissionAccess } from '../types';

/**
 * Builds a classifier that summarises how much of your assignable permission set a role covers.
 *
 * Intended for admin screens listing roles. Pass the full set of assignable permissions once, then
 * call the returned function with each role's permission slugs.
 */
export function createGetRolePermissionAccess(assignablePermissions: AssignablePermission[]) {
  return function getRolePermissionAccess(
    permissionSlugs: readonly string[],
  ): RolePermissionAccess {
    if (permissionSlugs.includes('*')) {
      return {
        description: 'This role is granted all permissions through wildcard access.',
        kind: 'wildcard',
        label: 'Wildcard access',
      };
    }

    const assignedPermissions = new Set(permissionSlugs);
    const assignedCount = assignablePermissions.filter((permission) =>
      assignedPermissions.has(permission),
    ).length;

    if (assignedCount === assignablePermissions.length) {
      return {
        description: 'This role is granted every assignable permission individually.',
        kind: 'all',
        label: 'All permissions',
      };
    }

    if (assignedCount === 0) {
      return {
        description: 'This role has no assigned permissions.',
        kind: 'none',
        label: 'No permissions',
      };
    }

    return {
      description: 'This role has a limited set of assigned permissions.',
      kind: 'partial',
      label: `${assignedCount} of ${assignablePermissions.length} permissions`,
    };
  };
}
