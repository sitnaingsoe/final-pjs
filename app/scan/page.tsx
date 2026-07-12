import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ScanClient from './ScanClient'

export default async function ScanPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    
    // Check if the searchParams has tableNumber. Next.js 15 requires awaiting searchParams.
    const resolvedParams = await searchParams;
    const tableNumber = resolvedParams?.tableNumber as string | undefined

    // If a staff or branch admin scans the QR code, redirect them to the POS terminal
    // with the table automatically selected!
    if (session?.user && (session.user.role === 'STAFF' || session.user.role === 'BRANCH_ADMIN')) {
        if (tableNumber) {
            redirect(`/pos?tableNumber=${encodeURIComponent(tableNumber)}`)
        } else {
            redirect('/pos')
        }
    }

    // Otherwise, render the standard customer scan UI
    return <ScanClient />
}
