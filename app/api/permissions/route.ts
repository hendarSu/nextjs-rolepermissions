import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserPermissions } from "@/lib/permissions"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const permissions = await getUserPermissions(session.user.id)

  return NextResponse.json({ permissions })
}
