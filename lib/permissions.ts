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

// Client-side function to get current user's permissions
export async function getUserPermissionsClient(): Promise<string[]> {
  try {
    const response = await fetch("/api/permissions")
    if (!response.ok) {
      throw new Error("Failed to fetch permissions")
    }
    const data = await response.json()
    return data.permissions
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return []
  }
}
