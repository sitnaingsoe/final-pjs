// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRouterPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const { role } = session.user

  if (role === 'COMPANY_HEAD') {
    redirect('/dashboard/hq')
  } else {
    redirect('/dashboard/store')
  }
}