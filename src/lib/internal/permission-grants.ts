const WILDCARD = '*';
const SEPARATOR = ':';

/**
 * Whether a granted permission list covers one required permission.
 *
 * Three things grant: the bare wildcard `*`, an exact match, and a wildcard on any ancestor segment
 * of the required name. Segments are split on `:`, so `a:b:c` is granted by `a:*` and by `a:b:*`.
 *
 * Matching is by segment, not by text, so `a:*` does not grant `ab:c`. A name with no `:` in it has
 * no ancestors, so `users.read` is granted only by `*` or by itself — a dot is not a separator.
 */
export function permissionGrants(
  grantedPermissions: readonly string[] | undefined,
  requiredPermission: string,
): boolean {
  if (!grantedPermissions || grantedPermissions.length === 0) {
    return false;
  }

  if (grantedPermissions.includes(WILDCARD) || grantedPermissions.includes(requiredPermission)) {
    return true;
  }

  const segments = requiredPermission.split(SEPARATOR);

  // Every ancestor prefix, shortest first: for `a:b:c` that is `a:*` then `a:b:*`. The loop stops
  // before the full name, so `a:b:c:*` does not grant `a:b:c`.
  for (let depth = 1; depth < segments.length; depth += 1) {
    const prefix = segments.slice(0, depth).join(SEPARATOR);

    if (grantedPermissions.includes(`${prefix}${SEPARATOR}${WILDCARD}`)) {
      return true;
    }
  }

  return false;
}
