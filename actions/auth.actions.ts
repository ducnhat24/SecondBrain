'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

export async function signInWithOAuth(provider: 'google' | 'github') {
    const supabase = await createClient()

    // Lấy URL hiện tại (localhost hoặc link Vercel)
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            // Chỉ định rõ nơi Google sẽ trả khách về
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    // Nếu lấy được link Google thành công thì chuyển hướng trình duyệt sang đó
    if (data.url) {
        redirect(data.url)
    }
}