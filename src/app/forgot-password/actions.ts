'use server'

import { createClient } from '@/utils/supabase/server'

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    if (!supabase) {
        return { error: 'Supabase configuration is missing.' }
    }
    const email = formData.get('email') as string
    const origin = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
