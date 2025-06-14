import { getUsers } from "@/lib/actions/user-actions"
import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import UserTable from "@/components/user-table"
import { Plus } from "lucide-react"

export default async function UsersPage() {
  const session = await getSession()

  // Check if user can view users (using the original manage_users permission or the new view_users permission)
  const canViewUsers = await hasPermission(session?.user.id, "manage_users")

  // Check if user can create users
  const canCreateUsers = await hasPermission(session?.user.id, "create_users")

  // Redirect if user doesn't have permission to view users
  if (!canViewUsers) {
    redirect("/dashboard")
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        {canCreateUsers && (
          <Button asChild>
            <Link href="/dashboard/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        )}
      </div>

      <UserTable users={users} />
    </div>
  )
}
