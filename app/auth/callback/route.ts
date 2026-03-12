import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Trả về trang chủ sau khi đăng nhập thành công
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        // Đổi cái mã code lấy Session đăng nhập thực sự
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Nếu có lỗi thì đá về trang auth kèm thông báo
    return NextResponse.redirect(`${origin}/auth?error=Could not authenticate with provider`)
}