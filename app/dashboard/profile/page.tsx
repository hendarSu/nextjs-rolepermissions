import { getSession } from "@/lib/auth"
import { getUserById } from "@/lib/actions/user-actions"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/profile-form"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Update your personal information</p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}
