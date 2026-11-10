// A compile-time guard, not a runtime test. It proves that augmenting the module where
// PermissionsDef and RolesDef are declared narrows Permission, Role and AssignablePermission.
//
// If the interfaces are ever moved out of src/index.ts and merely re-exported from it, the
// augmentation below stops merging, Permission silently stays `string`, and these assertions fail.
// That is the whole point of this file: `tsc` must break before a release can quietly ship a
// package whose typed permissions do nothing.
//
// Consumers write the same thing against the package name:
//
//   declare module '@piplup/react-acl' {
//     interface PermissionsDef { 'invoice:read': never }
//   }

import type { AssignablePermission, Permission, Role } from '../src/index';

declare module '../src/index' {
  interface PermissionsDef {
    '*': never;
    'invoice:read': never;
    'invoice:write': never;
  }

  interface RolesDef {
    admin: never;
    member: never;
  }
}

type Assert<T extends true> = T;

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** Permission is the union of the augmented keys, not `string`. */
export type PermissionIsNarrowed = Assert<
  Equals<Permission, '*' | 'invoice:read' | 'invoice:write'>
>;

/** Role is the union of the augmented keys, not `string`. */
export type RoleIsNarrowed = Assert<Equals<Role, 'admin' | 'member'>>;

/** The wildcard is a grantable permission but not an assignable one. */
export type WildcardIsNotAssignable = Assert<
  Equals<AssignablePermission, 'invoice:read' | 'invoice:write'>
>;
