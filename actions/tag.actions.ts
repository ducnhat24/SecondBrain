'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Lấy danh sách tất cả các tag mà user đã từng dùng
export async function getTags() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function deleteTag(tagId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tags').delete().eq('id', tagId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function deleteTagByName(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('user_id', user.id)
        .eq('name', name)

    if (error) return { success: false, error: error.message }
    return { success: true }
}