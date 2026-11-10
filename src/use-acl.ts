import * as React from 'react';
import { AclContext } from './acl-context';

export function useAcl() {
  const context = React.useContext(AclContext);
  if (!context) {
    throw new Error('AclProvider must be rendered as parent before using useAcl');
  }

  return context;
}
