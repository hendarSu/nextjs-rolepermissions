"use server"

import { revalidatePath } from "next/cache"
import { query, queryOne } from "../db"
import { hashPassword, verifyPassword } from "../auth"
import { getSession } from "../auth"
import { redirect } from "next/navigation"
import { hasPermission } from "../permissions"

export async function getUsers() {
  const users = await query<{
    id: string
    name: string
    email: string
    role_id: string
    role_name: string
    active: boolean
  }>(`
    SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.active
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.name
  `)

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: {
      id: user.role_id,
      name: user.role_name,
    },
    active: user.active,
  }))
}

export async function getUserById(id: string) {
  const user = await queryOne<{
    id: string
    name: string
    email: string
    role_id: string
    role_name: string
    active: boolean
  }>(
    `
    SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.active
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
  `,
    [id],
  )

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.role_id,
    role: {
      id: user.role_id,
      name: user.role_name,
    },
    active: user.active,
  }
}

export async function getRoles() {
  return query<{
    id: string
    name: string
  }>("SELECT id, name FROM roles ORDER BY name")
}

interface CreateUserData {
  name: string
  email: string
  password: string
  roleId: string
  active: boolean
}

export async function createUser(data: CreateUserData) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if user has create_users permission or manage_users permission
  const canCreateUsers = await hasPermission(session.user.id, "create_users")
  const canManageUsers = await hasPermission(session.user.id, "manage_users")

  if (!canCreateUsers && !canManageUsers) {
    throw new Error("You don't have permission to create users")
  }

  const hashedPassword = await hashPassword(data.password)

  await queryOne(
    `
    INSERT INTO users (name, email, password, role_id, active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `,
    [data.name, data.email, hashedPassword, data.roleId, data.active],
  )

  revalidatePath("/dashboard/users")
}

interface UpdateUserData {
  name: string
  email: string
  password?: string
  roleId: string
  active: boolean
}

export async function updateUser(id: string, data: UpdateUserData) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if user has edit_users permission or manage_users permission
  const canEditUsers = await hasPermission(session.user.id, "edit_users")
  const canManageUsers = await hasPermission(session.user.id, "manage_users")

  if (!canEditUsers && !canManageUsers) {
    throw new Error("You don't have permission to edit users")
  }

  // If password is provided, hash it
  if (data.password) {
    const hashedPassword = await hashPassword(data.password)

    await queryOne(
      `
      UPDATE users
      SET name = $1, email = $2, password = $3, role_id = $4, active = $5
      WHERE id = $6
    `,
      [data.name, data.email, hashedPassword, data.roleId, data.active, id],
    )
  } else {
    await queryOne(
      `
      UPDATE users
      SET name = $1, email = $2, role_id = $3, active = $4
      WHERE id = $5
    `,
      [data.name, data.email, data.roleId, data.active, id],
    )
  }

  revalidatePath("/dashboard/users")
}

export async function deleteUser(id: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if user has delete_users permission or manage_users permission
  const canDeleteUsers = await hasPermission(session.user.id, "delete_users")
  const canManageUsers = await hasPermission(session.user.id, "manage_users")

  if (!canDeleteUsers && !canManageUsers) {
    throw new Error("You don't have permission to delete users")
  }

  // Prevent deleting yourself
  if (session.user.id === id) {
    throw new Error("Cannot delete your own account")
  }

  await queryOne("DELETE FROM users WHERE id = $1", [id])
  revalidatePath("/dashboard/users")
}

interface UpdateProfileData {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}

export async function updateProfile(data: UpdateProfileData) {
  const session = await getSession()
  if (!session) redirect("/login")

  // If changing password, verify current password
  if (data.newPassword && data.currentPassword) {
    const user = await queryOne<{ password: string }>("SELECT password FROM users WHERE id = $1", [session.user.id])

    if (!user) {
      throw new Error("User not found")
    }

    const isPasswordValid = await verifyPassword(data.currentPassword, user.password)

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    const hashedPassword = await hashPassword(data.newPassword)

    await queryOne(
      `
      UPDATE users
      SET name = $1, email = $2, password = $3
      WHERE id = $4
    `,
      [data.name, data.email, hashedPassword, session.user.id],
    )
  } else {
    await queryOne(
      `
      UPDATE users
      SET name = $1, email = $2
      WHERE id = $3
    `,
      [data.name, data.email, session.user.id],
    )
  }

  revalidatePath("/dashboard/profile")
}
