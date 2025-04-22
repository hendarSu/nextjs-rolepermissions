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
  const canManageUsers = await hasPermission(session?.user.id, "manage_users")

  if (!canManageUsers) {
    redirect("/dashboard")
  }

  const isNewUser = params.id === "new"
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
