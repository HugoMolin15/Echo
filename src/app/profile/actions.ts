'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    if (!supabase) {
        return { error: 'Supabase configuration is missing.' }
    }

    const fullName = formData.get('full_name') as string
    const avatarUrl = formData.get('avatar_url') as string

    const { error } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            avatar_url: avatarUrl
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()
    if (!supabase) {
        return { error: 'Supabase configuration is missing.' }
    }
    const file = formData.get('file') as File

    if (!file) {
        return { error: 'No file provided' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to 'avatars' bucket
    const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

    if (uploadError) {
        return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    return { publicUrl }
}
