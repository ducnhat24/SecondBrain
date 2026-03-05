'use server'

import { createClient } from '@/lib/supabase/server'

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
    const supabase = await createClient()

    // 1. Tạo tài khoản auth.users
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    // 2. Tự động chèn thông tin vào bảng profiles của mình
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: name,
        })
    }

    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
}