import * as React from 'react';

export type AclContextType = {
  isAuthorized: ({
    permissions,
    roles,
  }: {
    permissions?: (number | string)[] | number | string;
    roles?: (number | string)[] | number | string;
    validationMode?: {
      permissions?: 'all' | 'any';
      roles?: 'all' | 'any';
    };
  }) => boolean;
  loading: boolean;
};

export const AclContext = React.createContext<AclContextType | null>(null);
