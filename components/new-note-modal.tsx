"use client"

import { useState, useCallback, type DragEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImagePlus, X, FileText, Check, Crop, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/sample-data"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"
import { createNote } from "@/actions/note.actions"

// --- Hàm phụ trợ để cắt ảnh (Canvas) ---
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = new Image()
  image.src = imageSrc
  await new Promise((resolve) => {
    image.onload = resolve
  })
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )
  return canvas.toDataURL("image/jpeg")
}
// ----------------------------------------

interface NewNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: Note) => void
  categories?: string[]
}

export function NewNoteModal({ open, onOpenChange, onSave, categories = [] }: NewNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const [dragOver, setDragOver] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation();
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setRawImage(reader.result as string)
          setIsCropping(true)
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setRawImage(reader.result as string)
          setIsCropping(true)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [])

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropConfirm = async () => {
    try {
      if (rawImage && croppedAreaPixels) {
        const croppedImageBase64 = await getCroppedImg(rawImage, croppedAreaPixels)
        setImagePreview(croppedImageBase64)
        setIsCropping(false)
        setRawImage(null)
      }
    } catch (e) {
      console.error("Lỗi khi crop ảnh", e)
    }
  }

  const handleCropCancel = () => {
    setIsCropping(false)
    setRawImage(null)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setIsSaving(true)

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        categoryName: category,
        coverImage: imagePreview ?? null,
        tags: tags.length > 0 ? tags : ["untagged"],
      }

      const res = await createNote(payload)

      if (res.success && res.data) {
        toast.success("Tạo Note thành công!")
        const newNote: Note = {
          id: res.data.id,
          title: res.data.title,
          content: res.data.content,
          coverImage: res.data.cover_image,
          tags: tags.length > 0 ? tags : ["untagged"],
          category: category,
          createdAt: res.data.created_at,
          updatedAt: res.data.updated_at,
        }
        onSave(newNote)
        resetModal()
      } else {
        toast.error(res.error || "Lưu Note thất bại, vui lòng thử lại.")
      }
    } catch (error) {
      toast.error("Có lỗi hệ thống xảy ra!")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    resetModal()
  }

  const resetModal = () => {
    setTitle("")
    setContent("")
    setCategory("Personal")
    setTags([])
    setTagInput("")
    setImagePreview(null)
    setRawImage(null)
    setIsCropping(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-none sm:rounded-xl bg-card/98 backdrop-blur-sm overflow-hidden gap-0">

        <DialogHeader className="flex-shrink-0 mb-4">
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            {isCropping ? <Crop className="size-5" /> : <FileText className="size-5" />}
            {isCropping ? "Crop Cover Image" : "New Note"}
          </DialogTitle>
          <DialogDescription>
            {isCropping ? "Drag and zoom to adjust your cover image." : "Create a new note with Markdown support."}
          </DialogDescription>
        </DialogHeader>

        {/* Nội dung chính có cuộn */}
        <div className="flex flex-1 flex-col gap-4 min-h-0 overflow-y-auto px-1">
          {isCropping && rawImage ? (
            <div className="relative w-full h-[300px] sm:h-[400px] bg-black/10 rounded-lg overflow-hidden flex-shrink-0">
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{ containerClassName: "bg-background rounded-lg" }}
              />
            </div>
          ) : (
            <>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border group flex-shrink-0">
                  <img src={imagePreview} alt="Cover preview" className="w-full h-40 sm:h-48 object-cover transition-opacity group-hover:opacity-80" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full shadow-md size-8 sm:size-10" onClick={() => setImagePreview(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleFileSelect} className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 sm:gap-3 rounded-lg border-2 border-dashed py-6 transition-colors flex-shrink-0", dragOver ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30 hover:bg-accent/50")}>
                  <div className="rounded-full bg-muted p-3">
                    <ImagePlus className="size-6 text-muted-foreground" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-foreground">Add a cover image</p>
                    <p className="text-xs text-muted-foreground mt-1">Drag & drop, or tap to browse</p>
                  </div>
                </div>
              )}

              <Input
                placeholder="Note title..."
                className="text-lg sm:text-xl font-bold h-12 sm:h-14 border-transparent bg-transparent hover:bg-muted/30 focus-visible:bg-transparent focus-visible:ring-0 px-2 sm:px-4 rounded-md shadow-none flex-shrink-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* --- KHU VỰC THÔNG TIN: CATEGORY VÀ TAGS --- */}
              <div className="flex flex-col sm:flex-row gap-3 px-1 sm:px-3 flex-shrink-0 items-start sm:items-center">
                {/* Chọn Category (Full width on mobile) */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Nhập Tags */}
                <div className="flex-1 flex flex-wrap items-center gap-2 w-full border rounded-md px-3 min-h-9 bg-background focus-within:ring-1 focus-within:ring-ring">
                  <Tag className="size-3.5 text-muted-foreground hidden sm:block" />
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-1.5 py-0 text-xs font-normal my-1">
                      {tag}
                      <X className="size-3 cursor-pointer hover:text-destructive" onClick={(e) => handleRemoveTag(e, tag)} />
                    </Badge>
                  ))}
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags (Enter)..." : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground min-w-[100px] py-1.5"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>
              {/* ------------------------------------------ */}

              <Tabs defaultValue="write" className="flex-1 flex flex-col min-h-0 mt-2 px-1 sm:px-3">
                <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="flex-1 min-h-0 flex flex-col mt-3">
                  <Textarea
                    placeholder="Write your note in Markdown... Use # for headings, **bold**, etc."
                    className="flex-1 resize-none text-base leading-relaxed font-mono border-muted bg-transparent focus-visible:ring-1 p-3 sm:p-4 shadow-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto mt-3 bg-muted/20 border border-muted rounded-md p-4 sm:p-6">
                  {content.trim() ? (
                    <div className="text-foreground prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl sm:text-3xl font-bold mt-4 sm:mt-6 mb-3 sm:mb-4 border-b pb-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2 sm:mb-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg sm:text-xl font-medium mt-3 mb-2" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="text-base sm:text-lg font-medium mt-2 mb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 sm:mb-4 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-2 sm:ml-4" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-muted-foreground pl-3 sm:pl-4 italic my-3 sm:my-4 text-muted-foreground" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm break-words" {...props} />
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-sm text-center mt-10">Nothing to preview yet...</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 mt-2 sm:mt-4 border-t border-border flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-0">
          {isCropping ? (
            <>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleCropCancel}>Cancel Crop</Button>
              <Button onClick={handleCropConfirm} className="w-full sm:w-auto gap-2"><Check className="size-4" /> Apply Cover</Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleCancel}>Cancel</Button>
              <Button className="w-full sm:w-auto" onClick={handleSave} disabled={!title.trim() || isSaving}>
                {isSaving ? "Saving..." : "Save Note"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}