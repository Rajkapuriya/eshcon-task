import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

type Role = 'viewer' | 'editor' | 'publisher';

/**
 * Returns the mocked role based on a query parameter or cookie for the demo.
 * Usage: ?role=publisher
 */
function getRole(request: NextRequest): Role {
  const urlParams = request.nextUrl.searchParams;
  const spoofedRolePath = urlParams.get('role');
  
  if (spoofedRolePath) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    // Setting cookie happens on the response, so we just acknowledge it here.
    return spoofedRolePath as Role;
  }

  const cookieRole = request.cookies.get('user_role')?.value;
  return (cookieRole as Role) || 'viewer'; // Default to least privilege
}

export function middleware(request: NextRequest) {
  const role = getRole(request);
  const path = request.nextUrl.pathname;

  // Protect the studio editor
  if (path.startsWith('/studio')) {
    if (role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden: Studio requires editor or publisher roles.' }, { status: 403 });
    }
  }

  // Protect the publish endpoint
  if (path.startsWith('/api/publish')) {
    if (role !== 'publisher') {
      return NextResponse.json({ error: 'Forbidden: Only publishers can publish drafts.' }, { status: 403 });
    }
  }

  // Allow through and set the role cookie if it was passed via query param
  const response = NextResponse.next();
  const requestedRole = request.nextUrl.searchParams.get('role');
  if (requestedRole) {
    response.cookies.set('user_role', requestedRole, { path: '/' });
  }

  // Inject header for server components later (optional)
  response.headers.set('x-user-role', role);

  return response;
}
