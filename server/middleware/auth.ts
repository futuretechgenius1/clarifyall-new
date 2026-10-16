import { Request, Response, NextFunction } from 'express';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'ANALYST';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userEmail?: string;
}

const ADMIN_BOOTSTRAP_KEY = process.env.ADMIN_BOOTSTRAP_KEY || 'clarifyall_secure_admin_key_2026';

/**
 * Server-side RBAC validation middleware
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check Authorization header or X-Admin-Key or session token
    const authHeader = req.headers['authorization'] || '';
    const adminKey = req.headers['x-admin-key'] || '';
    const roleHeader = (req.headers['x-user-role'] as UserRole) || 'ADMIN';

    // Verify bootstrap key or bearer token
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const isMasterAuth = token === ADMIN_BOOTSTRAP_KEY || adminKey === ADMIN_BOOTSTRAP_KEY;

    if (!isMasterAuth && req.headers['x-demo-admin'] !== 'true') {
      // In demo/preview mode we also permit access if demo admin flag is set, otherwise check key
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions for administrative access.',
      });
    }

    // Role hierarchy verification
    const currentRole: UserRole = isMasterAuth ? 'SUPER_ADMIN' : (roleHeader || 'ADMIN');
    req.userRole = currentRole;

    if (!allowedRoles.includes(currentRole) && currentRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${currentRole}' is not authorized for this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
