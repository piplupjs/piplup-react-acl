import * as React from 'react';
import { useAccessControl } from './context';
import type { Permission, Role } from './index';
import type { PermissionMatchMode } from './types';

export type CanProps = {
  /** Rendered when the check passes. */
  children: React.ReactNode;
  /** Rendered when the check fails. Defaults to nothing. */
  fallback?: React.ReactNode;
  /** Rendered while the principal is loading. Defaults to nothing. */
  loading?: React.ReactNode;
  /**
   * Overrides the match mode for both `permission` and `role`. Left out, each keeps its own
   * default: `ALL` for permissions, `ANY` for roles.
   */
  mode?: PermissionMatchMode;
  /** The permissions to require. Left out, no permission is required. */
  permission?: Permission | readonly Permission[];
  /** The roles to require. Left out, no role is required. */
  role?: Role | readonly Role[];
};

/**
 * Renders its children only when the principal passes the check, reading the nearest
 * {@link AccessControlProvider}.
 *
 * `permission` and `role` are checked separately and both must pass. One of the three slots is
 * rendered, in this order: `loading` while the principal loads, `fallback` when the check fails,
 * `children` when it passes. No wrapper element is added around any of them.
 *
 * This hides UI. It does not protect data — anything the principal must not reach needs a check on
 * your server as well.
 */
export function Can(props: CanProps): React.ReactElement {
  const { children, fallback = null, loading = null, mode, permission, role } = props;

  const access = useAccessControl();

  if (access.loading) {
    return <React.Fragment>{loading}</React.Fragment>;
  }

  const allowed =
    (permission === undefined || access.can(permission, mode)) &&
    (role === undefined || access.hasRole(role, mode));

  if (!allowed) {
    return <React.Fragment>{fallback}</React.Fragment>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}

/** Everything {@link Can} accepts except the children it wraps. */
export type WithCanOptions = Omit<CanProps, 'children'>;

/**
 * Wraps a component in {@link Can} so it renders only when the principal passes the check.
 *
 * Takes the same options as `Can`, so a wrapped component can require a role, pick a match mode and
 * show a placeholder while the principal loads:
 *
 * ```tsx
 * const AdminPanel = withCan(Panel, {
 *   permission: ['billing:read', 'billing:write'],
 *   mode: 'ANY',
 *   role: 'admin',
 *   loading: <Skeleton />,
 *   fallback: <NoAccess />,
 * });
 * ```
 *
 * A single permission can be passed directly, with an optional fallback:
 *
 * ```tsx
 * const AdminPanel = withCan(Panel, 'admin:manage');
 * ```
 */
export function withCan<P extends object>(
  Component: React.ComponentType<P>,
  options: WithCanOptions,
): React.FunctionComponent<P>;
export function withCan<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | readonly Permission[],
  fallback?: React.ReactNode,
): React.FunctionComponent<P>;
export function withCan<P extends object>(
  Component: React.ComponentType<P>,
  optionsOrPermission: WithCanOptions | Permission | readonly Permission[],
  fallback?: React.ReactNode,
): React.FunctionComponent<P> {
  const options: WithCanOptions =
    typeof optionsOrPermission === 'string' || Array.isArray(optionsOrPermission)
      ? { fallback, permission: optionsOrPermission as Permission | readonly Permission[] }
      : (optionsOrPermission as WithCanOptions);

  function CanWrappedComponent(props: P) {
    return (
      <Can {...options}>
        <Component {...props} />
      </Can>
    );
  }

  const componentName = Component.displayName || Component.name || 'Component';
  CanWrappedComponent.displayName = `withCan(${componentName})`;

  return CanWrappedComponent;
}
