'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateNotePayload {
    title: string
    content: string
    categoryName: string
    coverImage?: string | null
    tags: string[]
}

export async function createNote(payload: CreateNotePayload) {
    const supabase = await createClient()

    // 1. Kiểm tra xác thực
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        // 2. TÌM HOẶC TẠO CATEGORY
        let categoryId = null
        if (payload.categoryName) {
            // Tìm thử xem category này có chưa
            let { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', payload.categoryName)
                .single()

            // Nếu chưa có thì tự động tạo mới
            if (!catData) {
                const { data: newCat } = await supabase
                    .from('categories')
                    .insert([{ user_id: user.id, name: payload.categoryName }])
                    .select('id')
                    .single()
                if (newCat) catData = newCat
            }
            if (catData) categoryId = catData.id
        }

        // 3. TẠO NOTE MỚI
        const { data: newNote, error: noteError } = await supabase
            .from('notes')
            .insert([{
                user_id: user.id,
                category_id: categoryId,
                title: payload.title,
                content: payload.content,
                cover_image: payload.coverImage || null
            }])
            .select()
            .single()

        if (noteError) throw noteError

        // 4. XỬ LÝ TAGS ĐỘNG (DYNAMIC TAGS)
        if (payload.tags && payload.tags.length > 0) {
            // Lọc bỏ các tag trùng lặp và chuyển thành chữ thường
            const uniqueTags = [...new Set(payload.tags.map(t => t.toLowerCase().trim()))]

            // Tìm các tags ĐÃ TỒN TẠI của user này
            const { data: existingTags } = await supabase
                .from('tags')
                .select('id, name')
                .eq('user_id', user.id)
                .in('name', uniqueTags)

            const existingTagNames = existingTags?.map(t => t.name) || []
            const newTagNames = uniqueTags.filter(t => !existingTagNames.includes(t))
            let allTagIds = existingTags?.map(t => t.id) || []

            // TẠO TAGS MỚI (nếu có)
            if (newTagNames.length > 0) {
                const tagsToInsert = newTagNames.map(name => ({ user_id: user.id, name }))
                const { data: newlyCreatedTags, error: tagError } = await supabase
                    .from('tags')
                    .insert(tagsToInsert)
                    .select('id')

                if (!tagError && newlyCreatedTags) {
                    allTagIds = [...allTagIds, ...newlyCreatedTags.map(t => t.id)]
                }
            }

            // 5. GẮN TAGS VÀO NOTE (BẢNG NOTE_TAGS)
            if (allTagIds.length > 0) {
                const noteTagsToInsert = allTagIds.map(tagId => ({
                    note_id: newNote.id,
                    tag_id: tagId
                }))
                await supabase.from('note_tags').insert(noteTagsToInsert)
            }
        }

        return { success: true, data: newNote }

    } catch (error: any) {
        console.error("Lỗi khi tạo Note:", error)
        return { success: false, error: error.message }
    }
}

export async function getNotes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        // Truy vấn Supabase: Lấy notes JOIN với categories và tags
        const { data, error } = await supabase
            .from('notes')
            .select(`
        id,
        title,
        content,
        cover_image,
        is_favorite,
        created_at,
        updated_at,
        categories ( name ),
        note_tags ( tags ( name ) )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }) // Note mới nhất lên đầu

        if (error) throw error

        // Format lại dữ liệu cho khớp với type Note của Frontend
        const formattedNotes = data.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            coverImage: note.cover_image,
            category: note.categories?.name || "Untagged",
            // Map mảng note_tags phức tạp thành mảng string đơn giản ["react", "ai"]
            tags: note.note_tags ? note.note_tags.map((nt: any) => nt.tags.name) : [],
            createdAt: note.created_at,
            updatedAt: note.updated_at,
        }))

        return { success: true, data: formattedNotes }
    } catch (error: any) {
        console.error("Lỗi khi fetch Notes:", error)
        return { success: false, error: error.message }
    }
}

export async function updateNote(noteId: string, payload: {
    title: string
    content: string
    categoryName: string
    tags: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        // 1. CẬP NHẬT THÔNG TIN CƠ BẢN CỦA NOTE
        let categoryId = null;

        // Nếu người dùng chọn một category cụ thể (không phải Untagged)
        if (payload.categoryName && payload.categoryName !== "Untagged") {
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('name', payload.categoryName)
                .eq('user_id', user.id)
                .maybeSingle()

            if (catData) {
                categoryId = catData.id
            }
        }

        // Tiến hành update Note với category_id vừa tìm được
        const { error: noteError } = await supabase
            .from('notes')
            .update({
                title: payload.title,
                content: payload.content,
                category_id: categoryId, // <-- Đây là chìa khóa để giữ category mới!
            })
            .eq('id', noteId)

        if (noteError) throw noteError

        // 2. LÀM SẠCH QUAN HỆ CŨ (Xóa hết nối trong bảng trung gian)
        // Bước này cực kỳ quan trọng để "reset" lại đống tags của note
        const { error: deleteRelError } = await supabase
            .from('note_tags')
            .delete()
            .eq('note_id', noteId)

        if (deleteRelError) throw deleteRelError

        // 3. XỬ LÝ TAGS MỚI (Giống hệt hàm createNote)
        if (payload.tags && payload.tags.length > 0) {
            const uniqueTags = [...new Set(payload.tags.map(t => t.toLowerCase().trim()))]

            // A. Tìm tags đã tồn tại trong bảng tags
            const { data: existingTags } = await supabase
                .from('tags')
                .select('id, name')
                .eq('user_id', user.id)
                .in('name', uniqueTags)

            const existingTagNames = existingTags?.map(t => t.name) || []
            const newTagNames = uniqueTags.filter(t => !existingTagNames.includes(t))
            let allTagIds = existingTags?.map(t => t.id) || []

            // B. Tạo tags chưa có trong DB
            if (newTagNames.length > 0) {
                const { data: newlyCreatedTags, error: tagError } = await supabase
                    .from('tags')
                    .insert(newTagNames.map(name => ({ user_id: user.id, name })))
                    .select('id')

                if (newlyCreatedTags) {
                    allTagIds = [...allTagIds, ...newlyCreatedTags.map(t => t.id)]
                }
            }

            // C. Gắn lại nối mới vào bảng note_tags
            if (allTagIds.length > 0) {
                const noteTagsToInsert = allTagIds.map(tagId => ({
                    note_id: noteId,
                    tag_id: tagId
                }))
                const { error: insertRelError } = await supabase
                    .from('note_tags')
                    .insert(noteTagsToInsert)

                if (insertRelError) throw insertRelError
            }
        }

        // 4. RESET CACHE (Fix lỗi F5 bị mất data)
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error("Lỗi update note:", error.message)
        return { success: false, error: error.message }
    }
}

export async function deleteNote(noteId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('notes').delete().eq('id', noteId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
}