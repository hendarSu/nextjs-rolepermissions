"use server"

import { revalidatePath } from "next/cache"
import { query, queryOne } from "../db"
import { getSession } from "../auth"
import { redirect } from "next/navigation"

export async function getRoles() {
  const roles = await query<{
    id: string
    name: string
    description: string
    is_system: boolean
  }>("SELECT id, name, description, is_system FROM roles ORDER BY name")

  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => {
      const permissions = await query<{
        id: string
        name: string
        description: string
      }>(
        `
        SELECT p.id, p.name, p.description
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        ORDER BY p.name
      `,
        [role.id],
      )

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions,
        isSystem: role.is_system,
      }
    }),
  )

  return rolesWithPermissions
}

export async function getRoleById(id: string) {
  const role = await queryOne<{
    id: string
    name: string
    description: string
    is_system: boolean
  }>("SELECT id, name, description, is_system FROM roles WHERE id = $1", [id])

  if (!role) return null

  const permissions = await query<{
    id: string
    name: string
    description: string
  }>(
    `
    SELECT p.id, p.name, p.description
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = $1
    ORDER BY p.name
  `,
    [id],
  )

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions,
    isSystem: role.is_system,
  }
}

export async function getAllPermissions() {
  return query<{
    id: string
    name: string
    description: string
  }>("SELECT id, name, description FROM permissions ORDER BY name")
}

interface CreateRoleData {
  name: string
  description: string
  permissionIds: string[]
}

export async function createRole(data: CreateRoleData) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Create role
  const role = await queryOne<{ id: string }>(
    `
    INSERT INTO roles (name, description, is_system)
    VALUES ($1, $2, false)
    RETURNING id
  `,
    [data.name, data.description],
  )

  if (!role) {
    throw new Error("Failed to create role")
  }

  // Add permissions
  if (data.permissionIds.length > 0) {
    const values = data.permissionIds.map((_, i) => `($1, $${i + 2})`).join(", ")

    await query(
      `
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ${values}
    `,
      [role.id, ...data.permissionIds],
    )
  }

  revalidatePath("/dashboard/roles")
}

interface UpdateRoleData {
  name: string
  description: string
  permissionIds: string[]
}

export async function updateRole(id: string, data: UpdateRoleData) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Update role
  await queryOne(
    `
    UPDATE roles
    SET name = $1, description = $2
    WHERE id = $3 AND is_system = false
  `,
    [data.name, data.description, id],
  )

  // Delete existing permissions
  await query("DELETE FROM role_permissions WHERE role_id = $1", [id])

  // Add new permissions
  if (data.permissionIds.length > 0) {
    const values = data.permissionIds.map((_, i) => `($1, $${i + 2})`).join(", ")

    await query(
      `
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ${values}
    `,
      [id, ...data.permissionIds],
    )
  }

  revalidatePath("/dashboard/roles")
}

export async function deleteRole(id: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if role is a system role
  const role = await queryOne<{ is_system: boolean }>("SELECT is_system FROM roles WHERE id = $1", [id])

  if (!role || role.is_system) {
    throw new Error("Cannot delete system role")
  }

  // Delete role permissions first (foreign key constraint)
  await query("DELETE FROM role_permissions WHERE role_id = $1", [id])

  // Delete role
  await queryOne("DELETE FROM roles WHERE id = $1", [id])

  revalidatePath("/dashboard/roles")
}
