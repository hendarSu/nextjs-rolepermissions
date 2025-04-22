import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { getAllPermissions } from "@/lib/actions/role-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

// Define the page access structure
const pageAccessMap = [
  {
    page: "Dashboard",
    path: "/dashboard",
    requiredPermission: "view_dashboard",
    description: "Main dashboard page with overview information",
  },
  {
    page: "User Management",
    path: "/dashboard/users",
    requiredPermission: "manage_users",
    description: "View user list",
  },
  {
    page: "Create User",
    path: "/dashboard/users/new",
    requiredPermission: "create_users",
    description: "Create new users",
  },
  {
    page: "Edit User",
    path: "/dashboard/users/[id]",
    requiredPermission: "edit_users",
    description: "Edit existing users",
  },
  {
    page: "Delete User",
    path: "/dashboard/users (action)",
    requiredPermission: "delete_users",
    description: "Delete users from the system",
  },
  {
    page: "Role Management",
    path: "/dashboard/roles",
    requiredPermission: "manage_roles",
    description: "Create, edit, and delete roles and their permissions",
  },
  {
    page: "Permission Management",
    path: "/dashboard/permissions",
    requiredPermission: "manage_roles",
    description: "View page access permissions",
  },
  {
    page: "Profile",
    path: "/dashboard/profile",
    requiredPermission: "manage_profile",
    description: "Edit your own profile information",
  },
]

export default async function PermissionsPage() {
  const session = await getSession()
  const canManageRoles = await hasPermission(session?.user.id, "manage_roles")

  if (!canManageRoles) {
    redirect("/dashboard")
  }

  const allPermissions = await getAllPermissions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Permissions</h1>
        <p className="text-muted-foreground">View which permissions are required to access different pages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Page Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="hidden md:table-cell">Path</TableHead>
                    <TableHead>Required Permission</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageAccessMap.map((item) => (
                    <TableRow key={item.path}>
                      <TableCell className="font-medium">
                        {item.page}
                        <div className="md:hidden text-xs text-muted-foreground mt-1">{item.path}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.path}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10">
                          {item.requiredPermission}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {allPermissions.map((permission) => (
              <div key={permission.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{permission.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
