import { queryOne } from "./db"

export async function hasPermission(userId: string | undefined, permissionName: string): Promise<boolean> {
  if (!userId) return false

  const result = await queryOne<{ has_permission: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND p.name = $2 AND u.active = true
    ) as has_permission
  `,
    [userId, permissionName],
  )

  return result?.has_permission || false
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const permissions = await queryOne<{ permissions: string[] }>(
    `
    SELECT ARRAY_AGG(p.name) as permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = $1 AND u.active = true
    GROUP BY u.id
  `,
    [userId],
  )

  return permissions?.permissions || []
}
