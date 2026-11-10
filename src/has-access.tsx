import * as React from 'react';
import { useAcl } from './use-acl';

export type HasAccessProps = {
  /**
   * React node(s) to be rendered if the user has access.
   */
  children: React.ReactNode;
  /**
   * React node(s) to be rendered if the user does not have access.
   */
  fallback?: React.ReactNode;
  /**
   *  React node to be rendered while ACL data is loading.
   */
  loading?: React.ReactNode;
  /**
   * An array representing permissions to perform acl checks
   */
  permissions?: (number | string)[];
  /**
   * An array representing roles to perform acl checks
   */
  roles?: (number | string)[];
  /**
   * An object to customize how roles and permissions are validated
   */
  validationMode?: {
    permissions?: 'all' | 'any';
    roles?: 'all' | 'any';
  };
};

export function HasAccess(props: HasAccessProps): React.ReactElement {
  const { children, fallback = null, loading = null, permissions, roles, validationMode } = props;

  const acl = useAcl();

  if (acl.loading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{loading}</>;
  }

  if (!acl.isAuthorized({ permissions, roles, validationMode })) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{fallback}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
