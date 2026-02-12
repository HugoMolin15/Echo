'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signout() {
    const supabase = await createClient()
    if (!supabase) {
        redirect('/')
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error.message)
        return
    }

    redirect('/')
}
