import { describe, expect, it } from 'vitest';
import type { AccessPrincipal } from '../types';
import { createGetRolePermissionAccess } from './role-permission-access';
import { hasAllPermissions } from './has-all-permissions';
import { hasAnyPermissions } from './has-any-permission';
import { hasPermission } from './has-permission';
import { hasRole } from './has-role';

const principal: AccessPrincipal = {
  permissions: ['invoice:read', 'report:*'],
  roles: ['member', 'editor'],
};

describe('hasAllPermissions', () => {
  it('requires every permission', () => {
    expect(hasAllPermissions(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(hasAllPermissions(['a'], ['a', 'b'])).toBe(false);
  });

  it('accepts a single permission without an array', () => {
    expect(hasAllPermissions(['a'], 'a')).toBe(true);
    expect(hasAllPermissions(['a'], 'b')).toBe(false);
  });

  it('passes an empty requirement', () => {
    expect(hasAllPermissions(['a'], [])).toBe(true);
    expect(hasAllPermissions(undefined, [])).toBe(true);
  });
});

describe('hasAnyPermissions', () => {
  it('requires one permission', () => {
    expect(hasAnyPermissions(['a'], ['a', 'b'])).toBe(true);
    expect(hasAnyPermissions(['c'], ['a', 'b'])).toBe(false);
  });

  it('passes an empty requirement, like hasAllPermissions', () => {
    // The implementation this replaces returned false here, so `require nothing` denied.
    expect(hasAnyPermissions(['a'], [])).toBe(true);
    expect(hasAnyPermissions(undefined, [])).toBe(true);
  });
});

describe('hasPermission', () => {
  it('defaults to ALL', () => {
    expect(hasPermission(principal, ['invoice:read', 'report:summary'])).toBe(true);
    expect(hasPermission(principal, ['invoice:read', 'invoice:write'])).toBe(false);
  });

  it('passes on one match in ANY mode', () => {
    expect(hasPermission(principal, ['invoice:write', 'invoice:read'], 'ANY')).toBe(true);
    expect(hasPermission(principal, ['invoice:write', 'user:read'], 'ANY')).toBe(false);
  });

  it('resolves wildcards held by the principal', () => {
    expect(hasPermission(principal, 'report:summary:monthly')).toBe(true);
  });

  it('denies a null or undefined principal', () => {
    expect(hasPermission(null, 'invoice:read')).toBe(false);
    expect(hasPermission(undefined, 'invoice:read')).toBe(false);
  });

  it('passes an empty requirement even for a null principal', () => {
    expect(hasPermission(null, [])).toBe(true);
  });
});

describe('hasRole', () => {
  it('defaults to ANY', () => {
    expect(hasRole(principal, ['admin', 'member'])).toBe(true);
    expect(hasRole(principal, ['admin', 'owner'])).toBe(false);
  });

  it('requires every role in ALL mode', () => {
    expect(hasRole(principal, ['member', 'editor'], 'ALL')).toBe(true);
    expect(hasRole(principal, ['member', 'admin'], 'ALL')).toBe(false);
  });

  it('accepts a single role without an array', () => {
    expect(hasRole(principal, 'member')).toBe(true);
    expect(hasRole(principal, 'admin')).toBe(false);
  });

  it('matches roles exactly and ignores wildcards', () => {
    expect(hasRole({ roles: ['*'] }, 'admin')).toBe(false);
    expect(hasRole({ roles: ['admin:*'] }, 'admin:billing')).toBe(false);
  });

  it('denies a principal with no roles', () => {
    expect(hasRole(null, 'member')).toBe(false);
    expect(hasRole({ permissions: ['*'] }, 'member')).toBe(false);
    expect(hasRole({ roles: [] }, 'member')).toBe(false);
  });

  it('passes an empty requirement', () => {
    expect(hasRole(null, [])).toBe(true);
  });
});

describe('createGetRolePermissionAccess', () => {
  const getAccess = createGetRolePermissionAccess(['invoice:read', 'invoice:write', 'user:read']);

  it('reports wildcard access', () => {
    expect(getAccess(['*'])).toMatchObject({ kind: 'wildcard' });
  });

  it('reports every assignable permission', () => {
    expect(getAccess(['invoice:read', 'invoice:write', 'user:read'])).toMatchObject({
      kind: 'all',
    });
  });

  it('reports a partial set and counts it', () => {
    expect(getAccess(['invoice:read'])).toMatchObject({
      kind: 'partial',
      label: '1 of 3 permissions',
    });
  });

  it('reports no permissions, ignoring unknown slugs', () => {
    expect(getAccess([])).toMatchObject({ kind: 'none' });
    expect(getAccess(['something:else'])).toMatchObject({ kind: 'none' });
  });
});
