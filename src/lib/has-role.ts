import type { Role } from '../index';
import type { AccessPrincipal, PermissionMatchMode } from '../types';

/**
 * Whether a principal holds the required roles.
 *
 * Defaults to `ANY`: holding one of the required roles passes. Pass `ALL` to require every one.
 * Roles are matched exactly — wildcards apply to permissions, not roles, because role names are not
 * hierarchical. An empty list of required roles means "no requirement" and passes.
 */
export function hasRole(
  principal: AccessPrincipal,
  role: Role | readonly Role[],
  matchMode: PermissionMatchMode = 'ANY',
): boolean {
  const required = typeof role === 'string' ? [role] : role;

  if (required.length === 0) {
    return true;
  }

  const granted = principal?.roles;

  if (!granted || granted.length === 0) {
    return false;
  }

  return matchMode === 'ALL'
    ? required.every((name) => granted.includes(name))
    : required.some((name) => granted.includes(name));
}
