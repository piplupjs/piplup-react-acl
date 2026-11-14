import * as React from 'react';

import { hasPermission } from './lib/has-permission';
import { hasRole as hasRoleCheck } from './lib/has-role';

import type { Permission, Role } from './index';
import type { AccessPrincipal, PermissionMatchMode } from './types';

export type AccessControlContextValue = {
  /**
   * Whether the principal holds the given permissions. Defaults to `ALL`.
   * Always `false` while loading.
   */
  can: (permission: Permission | readonly Permission[], matchMode?: PermissionMatchMode) => boolean;
  /**
   * Whether the principal holds the given roles. Defaults to `ANY`.
   * Always `false` while loading.
   */
  hasRole: (role: readonly Role[] | Role, matchMode?: PermissionMatchMode) => boolean;
  /** Whether the principal is still loading. */
  loading: boolean;
  /** The principal as given to the provider, for passing to the standalone check functions. */
  principal: AccessPrincipal;
};

export type AccessControlProviderProps = {
  /** The subtree that can read this principal. */
  children: React.ReactNode;
  /**
   * Whether the principal is still being fetched. Defaults to `principal === undefined`.
   *
   * While this is `true` every check returns `false` and `Can` renders its `loading` slot rather
   * than its `fallback`, so no "no access" state flashes before the data arrives. Pass it
   * explicitly when you already have a principal but are refreshing it, or when `undefined` is a
   * legitimate loaded value for you.
   */
  loading?: boolean;
  /** The subject whose access is evaluated. `undefined` means "not loaded yet". */
  principal: AccessPrincipal;
};

const AccessControlContext = React.createContext<AccessControlContextValue | null>(null);

/**
 * Reads the nearest {@link AccessControlProvider}. Throws if there is none.
 */
export function useAccessControl(): AccessControlContextValue {
  const context = React.useContext(AccessControlContext);

  if (!context) {
    throw new Error(
      'AccessControlProvider must be rendered as a parent before using useAccessControl',
    );
  }

  return context;
}

/**
 * Holds the current principal and exposes it, plus bound checks, to everything below it.
 *
 * It fetches nothing. Load the principal however you like and pass the result in.
 */
export function AccessControlProvider(props: AccessControlProviderProps) {
  const { children, loading: loadingProp, principal } = props;

  const loading = loadingProp ?? principal === undefined;

  const can = React.useCallback(
    (permission: Permission | readonly Permission[], matchMode?: PermissionMatchMode): boolean =>
      loading ? false : hasPermission(principal, permission, matchMode),
    [loading, principal],
  );

  const hasRole = React.useCallback(
    (role: readonly Role[] | Role, matchMode?: PermissionMatchMode): boolean =>
      loading ? false : hasRoleCheck(principal, role, matchMode),
    [loading, principal],
  );

  const contextValue = React.useMemo<AccessControlContextValue>(
    () => ({ can, hasRole, loading, principal }),
    [can, hasRole, loading, principal],
  );

  return (
    <AccessControlContext.Provider value={contextValue}>{children}</AccessControlContext.Provider>
  );
}
