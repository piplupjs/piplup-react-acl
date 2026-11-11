# @piplup/react-acl

![npm bundle size](https://img.shields.io/bundlephobia/minzip/@piplup/react-acl)

Role and permission checks for React, with hierarchical wildcard grants and
permission names your editor can autocomplete.

## Installation

```bash
npm install @piplup/react-acl

# or

yarn add @piplup/react-acl

# or

pnpm add @piplup/react-acl
```

## Usage

Hold the current user — the _principal_ — in a provider, then gate on it. The
provider fetches nothing; load the principal however you like and pass it in.

```tsx
import { AccessControlProvider, Can } from '@piplup/react-acl';

function App({ user, loading }) {
  return (
    <AccessControlProvider loading={loading} principal={user}>
      <Can permission="invoice:write" fallback={<ReadOnlyNotice />}>
        <EditInvoice />
      </Can>
    </AccessControlProvider>
  );
}
```

When you need the answer as a value rather than as markup, read it from the
hook:

```tsx
import { useAccessControl } from '@piplup/react-acl';

function Toolbar() {
  const { can, hasRole, loading } = useAccessControl();

  if (loading) return <Skeleton />;

  return (
    <>{actions.filter((action) => can(action.permission)).map(renderAction)}</>
  );
}
```

The checks are also plain functions, so navigation filters, loaders and server
code can use them without React. That includes React Server Components, server
actions and route handlers: only the provider, hook and components are marked
`'use client'`.

```ts
import { hasPermission } from '@piplup/react-acl';

const visible = items.filter((item) =>
  hasPermission(user, item.requiredPermissions),
);
```

To gate a whole component rather than a piece of markup, wrap it. `withCan`
takes the same options as `Can`:

```tsx
import { withCan } from '@piplup/react-acl';

const BillingPanel = withCan(Panel, {
  permission: ['billing:read', 'billing:write'],
  mode: 'ANY',
  role: 'admin',
  loading: <Skeleton />,
  fallback: <NoAccess />,
});

// A single permission can be passed directly, with an optional fallback.
const AdminPanel = withCan(Panel, 'admin:manage');
```

## Wildcards

Permission names are split into segments on `:`. A principal is granted a
permission by the bare wildcard `*`, by an exact match, or by a wildcard on any
ancestor segment.

| Granted          | Required            | Result                                        |
| ---------------- | ------------------- | --------------------------------------------- |
| `*`              | anything            | ✅                                            |
| `invoice:read`   | `invoice:read`      | ✅                                            |
| `invoice:*`      | `invoice:read`      | ✅                                            |
| `invoice:*`      | `invoice:line:edit` | ✅                                            |
| `invoice:line:*` | `invoice:line:edit` | ✅                                            |
| `invoice:line:*` | `invoice:read`      | ❌                                            |
| `invoice:line:*` | `invoice:line`      | ❌ — it grants what is _under_ `invoice:line` |
| `invoice:*`      | `invoices:read`     | ❌ — segments, not text prefixes              |
| `users:*`        | `users.read`        | ❌ — a dot is not a separator                 |

## Typed permissions

`Permission` and `Role` are `string` by default. Augment the package to narrow
them to your own names and have TypeScript reject typos:

```ts
declare module '@piplup/react-acl' {
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
```

`AssignablePermission` is every `Permission` bar the wildcards, for admin
screens that let someone pick permissions to grant.

## Loading

A principal of `undefined` means "not loaded yet", so `loading` defaults to
`principal === undefined` and you can leave the prop out. While loading, every
check returns `false` and `Can` renders its `loading` slot rather than its
`fallback` — so a user never sees an access-denied state flash before the data
arrives. Pass `loading` explicitly when `undefined` is a legitimate loaded value
for you, or when you are refreshing a principal you already have.

`null` is a loaded principal with no access — an anonymous visitor — and is
denied, not loading.

## Match modes

`permission` defaults to `ALL` and `role` defaults to `ANY`. `mode` overrides
both.

```tsx
<Can mode="ANY" permission={['invoice:write', 'invoice:approve']}>
  <ApproveButton />
</Can>
```

An empty requirement passes: `<Can>` with no `permission` and no `role` renders
its children for every loaded principal.

<!-- prettier-ignore -->
> [!WARNING]
> This hides UI. It does not protect data. Anything a user must not reach needs a check on your
> server as well.

## Migrating from 3.x

4.0.0 replaces the whole API. The old exports are gone.

| 3.x                                                   | 4.0.0                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `<AclProvider roles={r} permissions={p} loading={l}>` | `<AccessControlProvider principal={{ roles: r, permissions: p }} loading={l}>`          |
| `<HasAccess roles permissions validationMode>`        | `<Can role permission mode>`                                                            |
| `useAcl().isAuthorized({ roles, permissions })`       | `useAccessControl().can(permission)` and `.hasRole(role)`                               |
| `useAcl().loading`                                    | `useAccessControl().loading`                                                            |
| —                                                     | `hasPermission`, `hasRole`, `hasAllPermissions`, `hasAnyPermissions` as plain functions |

Behaviour changes to check for, beyond the renames:

- **Permissions now default to `ALL`, not `any`.**
  `<HasAccess permissions={["a", "b"]}>` passed if the user had either;
  `<Can permission={["a", "b"]}>` requires both. Add `mode="ANY"` to keep the
  old behaviour. Roles still default to `ANY`.
- **`validationMode={{ permissions, roles }}` became a single `mode`** that
  applies to both.
- **Wildcards are new.** A user holding `invoice:*` now passes `invoice:read`,
  which 3.x denied. Nothing else grants by pattern, but check that no permission
  name of yours contains `:` or `*` by accident.
- **`number` is no longer accepted** for permissions or roles. Stringify numeric
  ids at the call site.
- **`roles` and `permissions` moved into one `principal` object**, which also
  means a single `useMemo` keeps the context stable instead of two.

## Documentation

For the full documentation, see the [website](https://www.piplupjs.com).
