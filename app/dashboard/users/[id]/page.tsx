import { getUserById, getRoles } from "@/lib/actions/user-actions"
import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import UserForm from "@/components/user-form"

interface UserEditPageProps {
  params: {
    id: string
  }
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const session = await getSession()
  const isNewUser = params.id === "new"

  // Check appropriate permissions based on whether creating or editing
  const canCreateUsers = await hasPermission(session?.user.id, "create_users")
  const canEditUsers = await hasPermission(session?.user.id, "edit_users")

  // For new users, check create permission; for existing users, check edit permission
  const userHasPermission = isNewUser ? canCreateUsers : canEditUsers

  // Also allow if user has the general manage_users permission
  const canManageUsers = await hasPermission(session?.user.id, "manage_users")

  if (!userHasPermission && !canManageUsers) {
    redirect("/dashboard")
  }

  const user = isNewUser ? null : await getUserById(params.id)
  const roles = await getRoles()

  if (!isNewUser && !user) {
    redirect("/dashboard/users")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isNewUser ? "Create User" : "Edit User"}</h1>
        <p className="text-muted-foreground">
          {isNewUser ? "Add a new user to the system" : `Update user information for ${user?.name}`}
        </p>
      </div>

      <UserForm user={user} roles={roles} isNewUser={isNewUser} />
    </div>
  )
}
