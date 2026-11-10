// The augmentable interfaces are declared in this module on purpose. TypeScript merges a
// `declare module '@piplup/react-acl'` augmentation into the interface only if this module is where
// the interface is declared — augmenting a module that merely re-exports it does nothing. Moving
// these into another file and re-exporting them here silently breaks typed permissions for every
// consumer, so `test/augmentation.ts` guards it.

// ─── Permissions ─────────────────────────────────────────────────────────────

/**
 * Augment this interface to narrow {@link Permission} from `string` to your own permission names.
 *
 * ```ts
 * declare module '@piplup/react-acl' {
 *   interface PermissionsDef {
 *     'invoice:read': never;
 *     'invoice:write': never;
 *   }
 * }
 * ```
 */
export interface PermissionsDef {}

/**
 * The permissions that grant access to others rather than naming a capability of their own. These
 * are valid in a principal's permission list but are not assignable targets, so they are excluded
 * from {@link AssignablePermission}.
 */
export interface WildcardPermissionsDef {
  '*': never;
}

/**
 * A permission name. `string` until {@link PermissionsDef} is augmented, then the union of its keys.
 */
export type Permission = keyof PermissionsDef extends never
  ? string
  : Extract<keyof PermissionsDef, string>;

/** A permission that grants others. `string` until {@link WildcardPermissionsDef} is augmented. */
export type WildcardPermission = keyof WildcardPermissionsDef extends never
  ? string
  : Extract<keyof WildcardPermissionsDef, string>;

/** A permission that can be granted to a role: every {@link Permission} bar the wildcards. */
export type AssignablePermission = Exclude<Permission, WildcardPermission>;

// ─── Roles ───────────────────────────────────────────────────────────────────

/**
 * Augment this interface to narrow {@link Role} from `string` to your own role names.
 *
 * ```ts
 * declare module '@piplup/react-acl' {
 *   interface RolesDef {
 *     admin: never;
 *     member: never;
 *   }
 * }
 * ```
 */
export interface RolesDef {}

/** A role name. `string` until {@link RolesDef} is augmented, then the union of its keys. */
export type Role = keyof RolesDef extends never ? string : Extract<keyof RolesDef, string>;

// ─── Public API ──────────────────────────────────────────────────────────────

export { Can, withCan, type CanProps } from './can';
export {
  AccessControlProvider,
  useAccessControl,
  type AccessControlContextValue,
  type AccessControlProviderProps,
} from './context';
export {
  createGetRolePermissionAccess,
  hasAllPermissions,
  hasAnyPermissions,
  hasPermission,
  hasRole,
} from './lib';
export type { AccessPrincipal, PermissionMatchMode, RolePermissionAccess } from './types';
