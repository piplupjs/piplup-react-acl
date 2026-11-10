/**
 * The subject whose access is evaluated, usually the signed-in user.
 *
 * `undefined` means the principal has not loaded yet and, by default, denies every check.
 * `null` means there is no principal — an anonymous visitor — which also denies every check.
 */
export type AccessPrincipal =
  | {
      permissions?: readonly string[];
      roles?: readonly string[];
    }
  | null
  | undefined;

/** Whether every required entry must match (`ALL`) or just one of them (`ANY`). */
export type PermissionMatchMode = 'ALL' | 'ANY';

/**
 * How much of an assignable permission set a role covers. Intended for admin screens that list
 * roles and summarise what each one can do.
 */
export type RolePermissionAccess =
  | { kind: 'all'; label: 'All permissions'; description: string }
  | { kind: 'none'; label: 'No permissions'; description: string }
  | { kind: 'partial'; label: string; description: string }
  | { kind: 'wildcard'; label: 'Wildcard access'; description: string };
