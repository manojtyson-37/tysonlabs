/** True when the request is for the dashboard host (or local development). The sign-in routes answer only there. */
export function onDashboardHost(request: Request): boolean {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  const allowed = (process.env.DASHBOARD_HOST ?? 'reviews.tysonlabs.in').toLowerCase();
  return host === allowed || (process.env.NODE_ENV !== 'production' && /^localhost(:\d+)?$/.test(host));
}
