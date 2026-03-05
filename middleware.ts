import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Khởi tạo một response mặc định để cho phép request đi tiếp
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Khởi tạo Supabase Client ĐẶC BIỆT dành riêng cho Middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                // Chỗ này chính là nơi giải quyết cái comment hồi nãy bạn hỏi nè!
                // Nó có quyền setAll để ghi đè cookie (refresh token) lên trình duyệt.
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Kích hoạt hàm kiểm tra User
    // Hàm này vừa lấy thông tin user, vừa âm thầm refresh lại token nếu nó sắp hết hạn
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // --- 4. LOGIC ĐIỀU HƯỚNG (ROUTING RULES) ---

    // Luật 1: Nếu CHƯA đăng nhập mà dám mò vào trang chủ (Dashboard) -> Đá văng ra trang /auth
    if (!user && url.pathname === '/') {
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    // Luật 2: Nếu ĐÃ đăng nhập rồi mà lại cố tình mò vào trang /auth -> Đẩy ngược về trang chủ
    if (user && url.pathname.startsWith('/auth')) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Nếu hợp lệ thì cho phép đi tiếp
    return supabaseResponse
}

// 5. Cấu hình những đường dẫn (routes) nào mà anh Bảo vệ cần phải kiểm tra
export const config = {
    matcher: [
        /*
         * Khớp với tất cả các request TRỪ:
         * - Các file tĩnh (như css, js trong _next/static)
         * - Các hình ảnh tối ưu (_next/image)
         * - Các file hình ảnh (.svg, .png, .jpg...)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}