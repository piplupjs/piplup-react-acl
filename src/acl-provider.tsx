import * as React from 'react';
import { AclContext, type AclContextType } from './acl-context';

export type AclProviderProps = {
  /**
   * React child components to be rendered inside the AclProvider.
   */
  children: React.ReactNode;
  /**
   * Indicates the application permissions are being initialized.
   */
  loading: boolean;
  /**
   * Permissions array for ACL checks
   */
  permissions: (number | string)[];
  /**
   * Roles array for ACL checks
   */
  roles: (number | string)[];
};

function hasIntersection(value: unknown, array: unknown[]): boolean {
  if (Array.isArray(value)) {
    return value.length === 0 ? true : value.some((val) => array.some((item) => item === val));
  } else {
    return typeof value === 'undefined' ? true : array.some((item) => item === value);
  }
}

function hasUnion(value: unknown, array: unknown[]): boolean {
  if (Array.isArray(value)) {
    return value.length === 0 ? true : value.every((val) => array.some((item) => item === val));
  } else {
    return typeof value === 'undefined' ? true : array.some((item) => item === value);
  }
}

export function AclProvider(props: AclProviderProps) {
  const { children, loading, permissions: permissionsProp = [], roles: rolesProp = [] } = props;

  const isAuthorized = React.useCallback(
    ({
      permissions = [],
      roles = [],
      validationMode = {
        permissions: 'any',
        roles: 'any',
      },
    }: {
      permissions?: (number | string)[] | number | string;
      roles?: (number | string)[] | number | string;
      validationMode?: {
        permissions?: 'all' | 'any';
        roles?: 'all' | 'any';
      };
    }): boolean => {
      if (loading) {
        return false;
      }

      const hasRole: boolean =
        validationMode.roles === 'all'
          ? hasUnion(roles, rolesProp)
          : hasIntersection(roles, rolesProp);
      const hasPermission: boolean =
        validationMode.permissions === 'all'
          ? hasUnion(permissions, permissionsProp)
          : hasIntersection(permissions, permissionsProp);

      return hasRole && hasPermission;
    },
    [loading, permissionsProp, rolesProp],
  );

  const contextValue = React.useMemo<AclContextType>(
    () => ({
      isAuthorized,
      loading: loading ?? false,
    }),
    [loading, isAuthorized],
  );

  return <AclContext.Provider value={contextValue}>{children}</AclContext.Provider>;
}
