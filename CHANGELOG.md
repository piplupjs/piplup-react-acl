## 4.0.0

This package is now the single, versioned implementation of an access-control API that previously
lived as copied source inside a private application. The 3.x API is removed — see
[Migrating from 3.x](./README.md#migrating-from-3x) for the mapping.

### 💥 Breaking changes

- `AclProvider`, `HasAccess` and `useAcl` are replaced by `AccessControlProvider`, `Can` and
  `useAccessControl`.
- Roles and permissions are passed as one `principal` object rather than two props.
- Permission checks default to `ALL`. In 3.x a list of permissions passed if the user held any one
  of them; now every one is required unless you pass `mode="ANY"`. Roles still default to `ANY`.
- `validationMode={{ permissions, roles }}` is replaced by a single `mode` that applies to both.
- `number` is no longer accepted as a permission or role; names are strings.

### 🚀 Features

- **Hierarchical wildcard grants.** `*` grants everything, and a wildcard on any ancestor segment
  grants its descendants, so `invoice:*` covers `invoice:line:edit`. Matching is by `:` segment, so
  `invoice:*` does not grant `invoices:read`.
- **Typed permissions and roles.** Augment `PermissionsDef` and `RolesDef` on the package to narrow
  `Permission` and `Role` from `string` to your own names. `AssignablePermission` excludes the
  wildcards, for screens that grant permissions.
- **Standalone check functions** — `hasPermission`, `hasRole`, `hasAllPermissions`,
  `hasAnyPermissions` — usable outside React in navigation filters, loaders and server code.
- **`withCan`** wraps a component so it renders only when a permission is held.
- **`createGetRolePermissionAccess`** summarises how much of an assignable permission set a role
  covers, for admin screens.
- **`loading` now defaults to `principal === undefined`**, so the common "not fetched yet" case
  needs no extra prop. `null` is a loaded principal with no access, and is denied rather than
  treated as loading.
- `useAccessControl` returns principal-bound `can` and `hasRole` alongside the raw `principal`.

### 🩹 Fixes

Both of these were live in the implementation this package replaces:

- Wildcard matching split the required permission on its first `:` only, so `a:b:*` never granted
  `a:b:c`. Ancestor segments are now walked properly.
- An empty list of required permissions denied in `ANY` mode while passing in `ALL` mode. "Require
  nothing" now passes in both.

### 🏡 Chore

- The package has a test suite for the first time: 54 tests over the matcher, the check functions,
  the render slots and the hook, plus a compile-time guard that the declaration-merging contract
  still works. `npm test` runs in PR checks and before a release.

---

## 3.2.5 (2026-10-16)

This was a version bump only; there were no changes to `@piplup/react-acl`.

---

`@piplup/react-acl` was published from the
[piplupjs/piplup](https://github.com/piplupjs/piplup) monorepo up to and including 3.2.5, on a
version shared with the other packages in it. Releases before 3.2.5 are listed in
[that repository's CHANGELOG](https://github.com/piplupjs/piplup/blob/main/CHANGELOG.md).
