import * as React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Can, withCan } from './can';
import { AccessControlProvider, useAccessControl } from './context';

import type { AccessPrincipal } from './types';

function renderWithin(
  ui: React.ReactNode,
  principal: AccessPrincipal,
  loading?: boolean,
): ReturnType<typeof render> {
  return render(
    <AccessControlProvider loading={loading} principal={principal}>
      {ui}
    </AccessControlProvider>,
  );
}

const member: AccessPrincipal = {
  permissions: ['invoice:read', 'report:*'],
  roles: ['member'],
};

describe('Can', () => {
  it('renders children when the permission is held', () => {
    renderWithin(<Can permission="invoice:read">allowed</Can>, member);

    expect(screen.getByText('allowed')).toBeInTheDocument();
  });

  it('renders the fallback when it is not', () => {
    renderWithin(
      <Can fallback="denied" permission="invoice:write">
        allowed
      </Can>,
      member,
    );

    expect(screen.getByText('denied')).toBeInTheDocument();
  });

  it('renders nothing by default when the check fails', () => {
    const { container } = renderWithin(<Can permission="invoice:write">allowed</Can>, member);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders children when neither permission nor role is required', () => {
    renderWithin(<Can>allowed</Can>, member);

    expect(screen.getByText('allowed')).toBeInTheDocument();
  });

  it('resolves wildcards held by the principal', () => {
    renderWithin(<Can permission="report:summary:monthly">allowed</Can>, member);

    expect(screen.getByText('allowed')).toBeInTheDocument();
  });

  describe('loading', () => {
    it('renders the loading slot, not the fallback', () => {
      renderWithin(
        <Can fallback="denied" loading="pending" permission="invoice:read">
          allowed
        </Can>,
        undefined,
      );

      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.queryByText('denied')).not.toBeInTheDocument();
    });

    it('defaults to loading when the principal is undefined', () => {
      renderWithin(<Can loading="pending">allowed</Can>, undefined);

      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('does not treat a null principal as loading', () => {
      renderWithin(
        <Can fallback="denied" loading="pending" permission="invoice:read">
          allowed
        </Can>,
        null,
      );

      expect(screen.getByText('denied')).toBeInTheDocument();
    });

    it('honours an explicit loading prop over the principal', () => {
      renderWithin(
        <Can loading="pending" permission="invoice:read">
          allowed
        </Can>,
        member,
        true,
      );

      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  describe('permission and role together', () => {
    it('requires both', () => {
      renderWithin(
        <Can fallback="denied" permission="invoice:read" role="member">
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('allowed')).toBeInTheDocument();
    });

    it('fails when only the permission matches', () => {
      renderWithin(
        <Can fallback="denied" permission="invoice:read" role="admin">
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('denied')).toBeInTheDocument();
    });

    it('fails when only the role matches', () => {
      renderWithin(
        <Can fallback="denied" permission="invoice:write" role="member">
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('denied')).toBeInTheDocument();
    });
  });

  describe('mode', () => {
    it('requires every permission by default', () => {
      renderWithin(
        <Can fallback="denied" permission={['invoice:read', 'invoice:write']}>
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('denied')).toBeInTheDocument();
    });

    it('requires one permission in ANY mode', () => {
      renderWithin(
        <Can fallback="denied" mode="ANY" permission={['invoice:read', 'invoice:write']}>
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('allowed')).toBeInTheDocument();
    });

    it('applies to roles as well', () => {
      renderWithin(
        <Can fallback="denied" mode="ALL" role={['member', 'admin']}>
          allowed
        </Can>,
        member,
      );
      expect(screen.getByText('denied')).toBeInTheDocument();
    });
  });
});

describe('withCan', () => {
  function Panel({ label }: { label: string }) {
    return <span>{label}</span>;
  }

  it('renders the component when the permission is held', () => {
    const Guarded = withCan(Panel, 'invoice:read');
    renderWithin(<Guarded label="panel" />, member);

    expect(screen.getByText('panel')).toBeInTheDocument();
  });

  it('renders the fallback when it is not', () => {
    const Guarded = withCan(Panel, 'invoice:write', 'denied');
    renderWithin(<Guarded label="panel" />, member);

    expect(screen.getByText('denied')).toBeInTheDocument();
  });

  it('names the wrapper after the component', () => {
    expect(withCan(Panel, 'invoice:read').displayName).toBe('withCan(Panel)');
  });

  it('accepts an array of permissions in the shorthand form', () => {
    const Guarded = withCan(Panel, ['invoice:read', 'invoice:write'], 'denied');
    renderWithin(<Guarded label="panel" />, member);

    // The shorthand still defaults to ALL, like `Can`.
    expect(screen.getByText('denied')).toBeInTheDocument();
  });

  describe('options form', () => {
    it('passes the whole Can surface through', () => {
      const Guarded = withCan(Panel, {
        fallback: 'denied',
        mode: 'ANY',
        permission: ['invoice:read', 'invoice:write'],
        role: 'member',
      });
      renderWithin(<Guarded label="panel" />, member);

      expect(screen.getByText('panel')).toBeInTheDocument();
    });

    it('honours role on its own', () => {
      const Guarded = withCan(Panel, { fallback: 'denied', role: 'admin' });
      renderWithin(<Guarded label="panel" />, member);

      expect(screen.getByText('denied')).toBeInTheDocument();
    });

    it('honours the loading slot', () => {
      const Guarded = withCan(Panel, { loading: 'pending', permission: 'invoice:read' });
      renderWithin(<Guarded label="panel" />, undefined);

      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('renders the component when nothing is required', () => {
      const Guarded = withCan(Panel, {});
      renderWithin(<Guarded label="panel" />, member);

      expect(screen.getByText('panel')).toBeInTheDocument();
    });

    it('names the wrapper after the component', () => {
      expect(withCan(Panel, { permission: 'invoice:read' }).displayName).toBe('withCan(Panel)');
    });
  });
});

describe('useAccessControl', () => {
  it('throws outside a provider', () => {
    function Consumer() {
      useAccessControl();
      return null;
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(
      'AccessControlProvider must be rendered as a parent before using useAccessControl',
    );

    consoleError.mockRestore();
  });

  it('exposes the principal and bound checks', () => {
    const seen: string[] = [];

    function Consumer() {
      const access = useAccessControl();
      seen.push(
        `loading:${access.loading}`,
        `can:${access.can('invoice:read')}`,
        `role:${access.hasRole('member')}`,
        `principal:${access.principal?.roles?.join(',')}`,
      );
      return null;
    }

    renderWithin(<Consumer />, member);

    expect(seen).toEqual(['loading:false', 'can:true', 'role:true', 'principal:member']);
  });

  it('denies every check while loading', () => {
    const seen: string[] = [];

    function Consumer() {
      const access = useAccessControl();
      seen.push(`can:${access.can('invoice:read')}`, `role:${access.hasRole('member')}`);
      return null;
    }

    renderWithin(<Consumer />, member, true);

    expect(seen).toEqual(['can:false', 'role:false']);
  });
});
