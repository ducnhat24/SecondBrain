'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Lấy danh sách danh mục của user đang đăng nhập
export async function getCategories() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

// Tạo danh mục mới
export async function createCategory(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('categories')
        .insert([{ user_id: user.id, name }])
        .select()
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

// Xóa danh mục
export async function deleteCategory(categoryId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function deleteCategoryByName(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id)
        .eq('name', name)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function updateCategoryByName(oldName: string, newName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Chỉ cần cập nhật tên mới vào bảng categories là đủ!
    const { error: categoryError } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('user_id', user.id)
        .eq('name', oldName)

    if (categoryError) return { success: false, error: categoryError.message }

    // Xóa cache để Frontend load lại danh sách mới
    revalidatePath('/')

    return { success: true }
}