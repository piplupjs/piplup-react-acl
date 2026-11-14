import { describe, expect, it } from 'vitest';

import { permissionGrants } from './permission-grants';

describe('permissionGrants', () => {
  it('grants everything through the bare wildcard', () => {
    expect(permissionGrants(['*'], 'invoice:read')).toBe(true);
    expect(permissionGrants(['*'], 'anything at all')).toBe(true);
    expect(permissionGrants(['*'], '')).toBe(true);
  });

  it('grants an exact match', () => {
    expect(permissionGrants(['invoice:read'], 'invoice:read')).toBe(true);
  });

  it('denies an unrelated permission', () => {
    expect(permissionGrants(['invoice:read'], 'invoice:write')).toBe(false);
    expect(permissionGrants(['invoice:read'], 'user:read')).toBe(false);
  });

  it('denies when nothing is granted', () => {
    expect(permissionGrants(undefined, 'invoice:read')).toBe(false);
    expect(permissionGrants([], 'invoice:read')).toBe(false);
  });

  describe('hierarchical wildcards', () => {
    it('grants a child through a one-segment wildcard', () => {
      expect(permissionGrants(['a:*'], 'a:b')).toBe(true);
    });

    it('grants a grandchild through a one-segment wildcard', () => {
      // The bug this rewrite fixes: splitting on the first colon only made this false.
      expect(permissionGrants(['a:*'], 'a:b:c')).toBe(true);
    });

    it('grants a grandchild through a two-segment wildcard', () => {
      expect(permissionGrants(['a:b:*'], 'a:b:c')).toBe(true);
    });

    it('does not let a deeper wildcard grant a shallower sibling', () => {
      expect(permissionGrants(['a:b:*'], 'a:c')).toBe(false);
      expect(permissionGrants(['a:b:*'], 'a:c:d')).toBe(false);
    });

    it('does not grant the wildcard holder its own parent', () => {
      // `a:b:*` covers what is under `a:b`, not `a:b` itself.
      expect(permissionGrants(['a:b:*'], 'a:b')).toBe(false);
    });

    it('matches by segment, not by text prefix', () => {
      expect(permissionGrants(['a:*'], 'ab:c')).toBe(false);
      expect(permissionGrants(['invoice:*'], 'invoices:read')).toBe(false);
    });

    it('treats a dot as an ordinary character, not a separator', () => {
      // The previous implementation's docs claimed `users:*` grants `users.read`. It does not,
      // and should not.
      expect(permissionGrants(['users:*'], 'users.read')).toBe(false);
      expect(permissionGrants(['users.read'], 'users.read')).toBe(true);
      expect(permissionGrants(['*'], 'users.read')).toBe(true);
    });

    it('needs no wildcard for a name with no segments', () => {
      expect(permissionGrants(['admin'], 'admin')).toBe(true);
      expect(permissionGrants(['admin:*'], 'admin')).toBe(false);
    });

    it('finds the grant among several', () => {
      expect(permissionGrants(['user:read', 'invoice:*', 'report:read'], 'invoice:write')).toBe(
        true,
      );
    });
  });
});
