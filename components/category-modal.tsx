"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CategoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (newName: string) => void
    initialName?: string
    mode: "create" | "edit"
}

export function CategoryModal({ open, onOpenChange, onSave, initialName = "", mode }: CategoryModalProps) {
    const [name, setName] = useState(initialName)

    // Đảm bảo mỗi khi mở Modal lên, ô input sẽ được reset hoặc điền sẵn tên cũ
    useEffect(() => {
        if (open) {
            setName(initialName)
        }
    }, [open, initialName])

    const handleSave = () => {
        const trimmed = name.trim()
        if (!trimmed) return
        onSave(trimmed)
    }

    // Bắt sự kiện nhấn Enter để lưu luôn cho lẹ
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleSave()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Tạo danh mục mới" : "Đổi tên danh mục"}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Nhập tên danh mục..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus // Tự động focus vào ô input khi mở Modal
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button
                        onClick={handleSave}
                        // Vô hiệu hóa nút Lưu nếu input rỗng hoặc (nếu đang edit) tên chưa thay đổi
                        disabled={!name.trim() || (mode === 'edit' && name.trim() === initialName)}
                    >
                        Lưu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}