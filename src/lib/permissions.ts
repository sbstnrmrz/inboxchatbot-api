import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

// Merge default statements (user, session) with custom ones if needed
const statement = {
  ...defaultStatements,
  // Add custom resources here if needed in the future
  // project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// User role: no admin permissions
export const user = ac.newRole({
  // No permissions for admin operations
});

// Admin role: full permissions on users and sessions
export const admin = ac.newRole({
  ...adminAc.statements, // All default admin permissions
});

// SuperAdmin role: same as admin for now, can be extended later
export const superAdmin = ac.newRole({
  ...adminAc.statements, // All default admin permissions
});
