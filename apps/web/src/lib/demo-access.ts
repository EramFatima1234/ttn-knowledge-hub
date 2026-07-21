/**
 * TODO(demo): Set to `false` before production to restore strict RBAC.
 *
 * When `true`, any signed-in user can open admin routes and sees the Admin menu.
 */
export const DEMO_OPEN_ADMIN_ACCESS = true;

export function demoAllowsAdminAccess(isAuthenticated: boolean): boolean {
  return DEMO_OPEN_ADMIN_ACCESS && isAuthenticated;
}
