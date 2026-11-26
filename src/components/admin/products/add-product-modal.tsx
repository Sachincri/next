'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Switch } from "../../ui/switch"
import { Checkbox } from "../../ui/checkbox"
import { Plus, X, Trash2, Palette, Edit3, Image as ImageIcon, Upload, Sparkles, Loader2, Eye, Code, Video, Play } from "lucide-react"
import { toast } from "react-hot-toast"

// --- Schemas ---
const colorSchema = z.object({
  name: z.string().min(1, "Color name required"),
  image: z.any().optional(), // File or string URL
})

const specItemSchema = z.object({
  key: z.string().min(1, "Key required"),
  value: z.string().min(1, "Value required"),
})

const specificationSchema = z.object({
  title: z.string().min(1, "Section title required"),
  items: z.array(specItemSchema),
})

const productSchema = z.object({
  name: z.string().min(1).max(100),
  brandId: z.string().optional(),
  sellingPrice: z.number().min(0.01),
  actualPrice: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  discount: z.number().min(0).max(100).optional(),
  warranty: z.string().max(100).optional(),
  hsnCode: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
  offers: z.array(z.string().min(1)).max(10).optional(),
  highlights: z.array(z.string().min(1)).max(10).optional(),
  sizes: z.array(z.string().min(1)).max(20).optional(),
  specifications: z.array(specificationSchema).max(20).optional(),
  colors: z.array(colorSchema).max(20).optional(),
  isActive: z.boolean(),
  syncToRag: z.boolean().optional(),
  homeDisplaySection: z.string().optional(),
  seo: z.object({
    title: z.string().max(60, "SEO Title should be max 60 characters").optional(),
    description: z.string().max(160, "SEO Description should be max 160 characters").optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  thumbnail: z.any().optional(), // File or string URL
})


export type ProductFormData = z.infer<typeof productSchema>

export const DEFAULT_PRODUCT_VALUES: ProductFormData = {
  name: "",
  brandId: "",
  sellingPrice: 0,
  actualPrice: 0,
  mrp: undefined,
  stock: 0,
  categoryId: "",
  discount: 0,
  warranty: "",
  hsnCode: "",
  description: "",
  offers: [],
  highlights: [],
  sizes: [],
  specifications: [],
  colors: [],
  isActive: true,
  syncToRag: true,
  homeDisplaySection: "",
  seo: {
    title: "",
    description: "",
    keywords: [],
  },
  thumbnail: undefined,
}

interface AddEditProductModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<ProductFormData> & { images?: string[]; videos?: string[] }
  onSave: (payload: FormData) => Promise<void>
}

import { useGetBrandsQuery, useGetCategoriesQuery, useGenerateProductDetailsMutation } from "@/redux/api/adminApi"

export default function AddEditProductModal({ isOpen, onOpenChange, initialData, onSave }: AddEditProductModalProps) {
  const isEdit = !!initialData

  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [existingVideos, setExistingVideos] = useState<string[]>((initialData as any)?.videos ?? [])
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([])
  const [newVideoPreviews, setNewVideoPreviews] = useState<string[]>([])

  const [mediaError, setMediaError] = useState<string>("")
  const [isPreview, setIsPreview] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const blobUrlsRef = useRef<Set<string>>(new Set())

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>((initialData as any)?.thumbnail?.url ?? null)
  const [aiContext, setAiContext] = useState<string>("")

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024
  const MAX_MEDIA = 12
  const MAX_VIDEOS = 1
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]
  const ALL_ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

  const { data: brands, isLoading: brandsLoading } = useGetBrandsQuery()
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const [generateDetails, { isLoading: aiLoading }] = useGenerateProductDetailsMutation()

  const handleAiGenerate = async () => {
    // 1. Check for image
    let imageFile: File | undefined;
    if (newFiles.length > 0) imageFile = newFiles[0];

    // If no new file, we can't really do it completely unless we fetch the URL (complex), 
    // so we prompt user to upload one if missing.
    if (!imageFile) {
      toast.error("Please upload a product image first for AI analysis");
      return;
    }

    const toastId = toast.loading("Generating product details with Gemini AI...");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const currentName = getValues("name");
      if (currentName) formData.append("name", currentName);
      if (aiContext) formData.append("context", aiContext);

      const res = await generateDetails(formData).unwrap();

      // Auto-fill fields
      if (res) {
        if (res.description) setValue("description", res.description, { shouldDirty: true });

        if (res.name) {
          setValue("name", res.name, { shouldValidate: true, shouldDirty: true });
        } else if (res.seoTitle && !getValues("name")) {
          setValue("name", res.seoTitle, { shouldValidate: true, shouldDirty: true });
        }

        if (res.highlights && Array.isArray(res.highlights)) {
          setValue("highlights", res.highlights);
        }

        if (res.specifications) {
          if (Array.isArray(res.specifications)) {
            // Already an array of {title, items}
            setValue("specifications", res.specifications, { shouldDirty: true });
          } else if (typeof res.specifications === 'object') {
            // Convert object to our array format if it's a flat object
            const items = Object.entries(res.specifications).map(([k, v]) => ({
              key: k,
              value: typeof v === 'object' ? JSON.stringify(v) : String(v)
            }));
            if (items.length > 0) {
              setValue("specifications", [{ title: "Product Specifications", items }], { shouldDirty: true });
            }
          }
        }

        if (res.suggestedOffers && Array.isArray(res.suggestedOffers)) {
          setValue("offers", res.suggestedOffers, { shouldDirty: true });
        }

        // Price estimation (optional)
        if (res.suggestedPrice && (getValues("sellingPrice") === 0 || !getValues("sellingPrice"))) {
          setValue("sellingPrice", res.suggestedPrice);
        }

        // SEO Data
        if (res.seo) {
          setValue("seo", {
            title: res.seo.title || "",
            description: res.seo.description || "",
            keywords: res.seo.keywords || [],
          }, { shouldDirty: true });
        }

        // Handle Generated Image
        if (res.generated_image_url) {
          setNewPreviews(prev => [...prev, res.generated_image_url]);
          // ... (existing blob fetch logic if needed, or better yet, just leave it as preview if submitting URL is supported) ...
          // The current form logic uses newFiles for submission. 
          // We must convert to File.
          try {
            const imgRes = await fetch(res.generated_image_url);
            const blob = await imgRes.blob();
            const file = new File([blob], "ai-generated-image.jpg", { type: "image/jpeg" });
            setNewFiles(prev => [...prev, file]);
            toast.success("AI Image generated & added!");
          } catch (e) {
            console.error("Failed to load generated image", e);
            toast.error("Could not load AI generated image automatically.");
          }
        } else if (res.image_gen_error) {
          toast.error(res.image_gen_error);
          console.error("AI Image Gen Error:", res.image_gen_error);
        }

        toast.success("Product details generated!", { id: toastId });

        toast.success("Product details generated!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate details: " + (err.data?.message || err.message), { id: toastId });
    }
  };

  const { control, register, handleSubmit, reset, setValue, getValues, watch, formState: { errors, isSubmitting, isValid } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: DEFAULT_PRODUCT_VALUES,
  })

  // Field Arrays
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: "specifications" })
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({ control, name: "colors" })

  // Watches
  const offers = watch("offers")
  const highlights = watch("highlights")
  const sizes = watch("sizes")
  const watchedColors = watch("colors")
  const watchedSpecs = watch("specifications")

  const resetLocal = useCallback(() => {
    blobUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url)
      } catch {}
    })
    blobUrlsRef.current.clear()

    reset(DEFAULT_PRODUCT_VALUES)
    setExistingImages([])
    setNewFiles([])
    setNewPreviews([])
    setExistingVideos([])
    setNewVideoFiles([])
    setNewVideoPreviews([])
    setMediaError("")
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setAiContext("")
    setIsPreview(false)

    if (typeof document !== 'undefined') {
      const ids = ['offerInput', 'highlightInput', 'sizeInput', 'keywordInput']
      ids.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.value = ''
      })
    }
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
    if (mediaInputRef.current) mediaInputRef.current.value = ''
  }, [reset])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const clone: any = { ...initialData }
        delete clone.images
        delete clone.videos
        // ensure arrays exist
        clone.offers = clone.offers ?? []
        clone.highlights = clone.highlights ?? []
        clone.sizes = clone.sizes ?? []
        clone.specifications = clone.specifications ?? []
        clone.colors = clone.colors ?? []
        clone.isActive = clone.isActive ?? true
        clone.syncToRag = clone.syncToRag ?? true
        clone.seo = clone.seo ?? { title: "", description: "", keywords: [] }

        // Map brand and category to IDs if they are objects
        if (typeof clone.brand === 'object' && clone.brand?._id) clone.brandId = clone.brand._id
        else if (clone.brand && typeof clone.brand === 'string') clone.brandId = clone.brand

        if (typeof clone.category === 'object' && clone.category?._id) clone.categoryId = clone.category._id
        else if (clone.category && typeof clone.category === 'string') clone.categoryId = clone.category

        reset(clone)
        setExistingImages(initialData.images ?? [])
        setExistingVideos((initialData as any)?.videos ?? [])
        setNewFiles([])
        setNewPreviews([])
        setNewVideoFiles([])
        setNewVideoPreviews([])
        setThumbnailFile(null)
        setThumbnailPreview((initialData as any)?.thumbnail?.url ?? null)
        setMediaError("")
        setAiContext("")
        setIsPreview(false)
      } else {
        resetLocal()
      }
    }
  }, [isOpen, initialData, resetLocal, reset])

  // Derived states
  const totalImageCount = useMemo(() => existingImages.length + newFiles.length, [existingImages.length, newFiles.length])
  const totalVideoCount = useMemo(() => existingVideos.length + newVideoFiles.length, [existingVideos.length, newVideoFiles.length])
  const totalMediaCount = useMemo(() => totalImageCount + totalVideoCount, [totalImageCount, totalVideoCount])
  const watchedSellingPrice = watch("sellingPrice")
  const watchedMRP = watch("mrp")
  const watchedPrice = watch("sellingPrice") // For backward compatibility within this file if needed

  useEffect(() => {
    if (watchedSellingPrice && watchedMRP && watchedMRP > watchedSellingPrice) {
      const calculatedDiscount = Math.round(((watchedMRP - watchedSellingPrice) / watchedMRP) * 100)
      setValue("discount", calculatedDiscount, { shouldValidate: true })
    } else {
      setValue("discount", 0, { shouldValidate: true })
    }
  }, [watchedSellingPrice, watchedMRP, setValue])

  // Unified Media Handlers (Images & Video)
  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("")
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return

    const currentTotal = existingImages.length + newFiles.length + existingVideos.length + newVideoFiles.length
    if (currentTotal + files.length > MAX_MEDIA) {
      setMediaError(`Max ${MAX_MEDIA} media items allowed`)
      return
    }

    const imageFilesToAdd: File[] = []
    const videoFilesToAdd: File[] = []

    for (const f of files) {
      if (ALLOWED_VIDEO_TYPES.includes(f.type) || f.type.startsWith("video/")) {
        const totalVids = existingVideos.length + newVideoFiles.length + videoFilesToAdd.length
        if (totalVids >= MAX_VIDEOS) {
          toast.error("Only 1 product video is allowed. Additional video ignored.")
          continue
        }
        if (f.size > MAX_VIDEO_SIZE) {
          toast.error(`Video "${f.name}" exceeds 50MB`)
          continue
        }
        videoFilesToAdd.push(f)
      } else if (ALLOWED_IMAGE_TYPES.includes(f.type) || f.type.startsWith("image/")) {
        if (f.size > MAX_IMAGE_SIZE) {
          toast.error(`Image "${f.name}" exceeds 5MB`)
          continue
        }
        imageFilesToAdd.push(f)
      } else {
        toast.error(`Unsupported format: ${f.name}. Use JPEG, PNG, WEBP, MP4 or WEBM.`)
      }
    }

    // Read image previews
    imageFilesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.readyState === 2 && typeof reader.result === 'string') {
          setNewPreviews(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    // Create video previews
    videoFilesToAdd.forEach((file) => {
      const blobUrl = URL.createObjectURL(file)
      blobUrlsRef.current.add(blobUrl)
      setNewVideoPreviews(prev => [...prev, blobUrl])
    })

    if (imageFilesToAdd.length > 0) setNewFiles(prev => [...prev, ...imageFilesToAdd])
    if (videoFilesToAdd.length > 0) setNewVideoFiles(prev => [...prev, ...videoFilesToAdd])

    e.target.value = ""
  }, [existingImages.length, newFiles.length, existingVideos.length, newVideoFiles.length])

  // Dedicated single video file change handler
  const handleVideoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("")
    const file = e.target.files?.[0]
    if (!file) return

    if (existingVideos.length + newVideoFiles.length >= MAX_VIDEOS) {
      toast.error("Only 1 product video is allowed. Please remove the existing video first.")
      e.target.value = ""
      return
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !file.type.startsWith("video/")) {
      toast.error("Invalid video format. Supported: MP4, WEBM, MOV, MKV")
      e.target.value = ""
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`Video "${file.name}" exceeds 50MB`)
      e.target.value = ""
      return
    }

    const blobUrl = URL.createObjectURL(file)
    blobUrlsRef.current.add(blobUrl)
    setNewVideoFiles([file])
    setNewVideoPreviews([blobUrl])
    toast.success("Product video added successfully")
    e.target.value = ""
  }, [existingVideos.length, newVideoFiles.length])

  const removeExistingImage = useCallback((index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeNewImage = useCallback((index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeExistingVideo = useCallback((index: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeNewVideo = useCallback((index: number) => {
    setNewVideoFiles(prev => prev.filter((_, i) => i !== index))
    setNewVideoPreviews(prev => {
      const url = prev[index]
      if (url && url.startsWith("blob:")) {
        blobUrlsRef.current.delete(url)
        URL.revokeObjectURL(url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // generic list helpers
  const addStringToField = useCallback((value: string, fieldName: 'offers' | 'highlights' | 'sizes') => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = getValues(fieldName) || []
    setValue(fieldName, [...current, trimmed], { shouldValidate: true, shouldDirty: true })
  }, [getValues, setValue])

  const removeStringFromField = useCallback((index: number, fieldName: 'offers' | 'highlights' | 'sizes') => {
    const current = getValues(fieldName)
    // Ensure current is an array before filtering
    if (!Array.isArray(current)) return

    const newItems = current.filter((_, i) => i !== index)
    setValue(fieldName, newItems, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }, [getValues, setValue])

  // Spec helpers
  const addSpecSection = useCallback(() => {
    appendSpec({ title: "New Section", items: [] })
  }, [appendSpec])

  const addSpecItem = useCallback((sectionIndex: number, key: string, value: string) => {
    // Validation removed to allow adding empty/placeholder rows
    const currentSpecs = getValues("specifications")
    const items = currentSpecs?.[sectionIndex].items || []
    const newItems = [...items, { key, value }]
    setValue(`specifications.${sectionIndex}.items`, newItems, { shouldValidate: true })
  }, [getValues, setValue])

  const removeSpecItem = useCallback((sectionIndex: number, itemIndex: number) => {
    const currentSpecs = getValues("specifications")
    const items = currentSpecs?.[sectionIndex].items || []
    const newItems = items.filter((_, i) => i !== itemIndex)
    setValue(`specifications.${sectionIndex}.items`, newItems, { shouldValidate: true })
  }, [getValues, setValue])

  // Color helpers
  const handleColorImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) return toast.error("File size > 5MB")
      setValue(`colors.${index}.image`, file, { shouldDirty: true })
    }
  }

  // Submit
  const onSubmit = useCallback(async (data: ProductFormData) => {
    try {
      if (totalImageCount === 0) {
        toast.error('Add at least one product image')
        return
      }
      if (existingVideos.length + newVideoFiles.length > MAX_VIDEOS) {
        toast.error('Only 1 product video is allowed')
        return
      }
      const form = new FormData()
      form.append('name', data.name)
      if (data.brandId && data.brandId !== 'none') {
        form.append('brandId', data.brandId)
      } else {
        form.append('brandId', '')
      }
      form.append('sellingPrice', String(data.sellingPrice))
      if (data.actualPrice !== undefined) form.append('actualPrice', String(data.actualPrice))
      if (data.mrp !== undefined) form.append('maximumRetailPrice', String(data.mrp))
      form.append('stock', String(data.stock ?? 0))
      if (data.categoryId && data.categoryId !== 'none') {
        form.append('categoryId', data.categoryId)
      } else {
        form.append('categoryId', '')
      }
      if (data.discount !== undefined) form.append('discount', String(data.discount))
      if (data.warranty) form.append('warranty', data.warranty)
      if (data.hsnCode) form.append('hsnCode', data.hsnCode)
      if (data.description) form.append('description', data.description)
      if (data.homeDisplaySection) form.append('homeDisplaySection', data.homeDisplaySection)
      form.append('isActive', String(data.isActive))
      form.append('syncToRag', String(data.syncToRag ?? true))

      if (thumbnailFile) form.append('thumbnail', thumbnailFile)


      // Append Arrays
      newFiles.forEach((f) => form.append('images', f))
      newVideoFiles.forEach((f) => form.append('videos', f))

      if (data.offers && data.offers.length > 0) {
        data.offers.forEach(o => form.append('offers', o))
      } else {
        form.append('offers', '')
      }

      if (data.highlights && data.highlights.length > 0) {
        data.highlights.forEach(h => form.append('highlights', h))
      } else {
        form.append('highlights', '')
      }

      if (data.sizes && data.sizes.length > 0) {
        data.sizes.forEach(s => form.append('sizes', s))
      } else {
        form.append('sizes', '')
      }

      if (data.specifications && data.specifications.length > 0) {
        data.specifications.forEach(s => form.append('specifications', JSON.stringify(s)))
      } else {
        form.append('specifications', '')
      }

      if (data.seo) form.append('seo', JSON.stringify(data.seo))

      // Color Logic
      if (data.colors && data.colors.length > 0) {
        data.colors.forEach((c, i) => {
          let colorObj: any = { name: c.name }
          if (c.image instanceof File) {
            const fieldName = `color_img_${i}_${Date.now()}`
            form.append(fieldName, c.image) // Append file
            colorObj.imageField = fieldName // Link to file
          } else if (typeof c.image === 'string') {
            colorObj.image = c.image // Existing URL
          }
          form.append('colors', JSON.stringify(colorObj))
        })
      } else {
        form.append('colors', '')
      }

      // Removed Images & Videos
      const removedUrls = (initialData?.images ?? []).filter(url => !existingImages.includes(url))
      removedUrls.forEach(u => form.append('removedImageUrls', u))

      const removedVids: string[] = ((initialData as any)?.videos ?? []).filter((v: string) => !existingVideos.includes(v))
      removedVids.forEach((v: string) => form.append('removedVideoUrls', v))

      await onSave(form)
      if (!isEdit) {
        resetLocal()
      }
    } catch (err) {
      console.error(err)
    }
  }, [existingImages, existingVideos, initialData, isEdit, newFiles, newVideoFiles, onSave, thumbnailFile, totalImageCount, resetLocal])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && !isEdit) {
      resetLocal()
    }
    onOpenChange(open)
  }, [isEdit, resetLocal, onOpenChange])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] xl:max-w-7xl max-h-[92vh] overflow-y-auto max-sm:w-screen max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:p-4 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEdit ? 'Edit Product' : 'Add New Product'}
            {isEdit && <Badge className="ml-2">Edit</Badge>}
            |
            <div className="ml-auto flex items-center gap-2 mr-6">
              <Label htmlFor="isActive-top" className="text-sm font-medium">Active Status</Label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    id="isActive-top"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Basic Information</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 hover:opacity-90 transition-opacity"
                      onClick={handleAiGenerate}
                      disabled={aiLoading}
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Auto-Fill with AI
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Context */}
                  <div className="bg-violet-50 dark:bg-violet-950/20 p-3 rounded-md border border-violet-100 dark:border-violet-900/50 mb-2">
                    <Label className="text-violet-700 dark:text-violet-400 font-medium mb-1.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> AI Context (Optional)
                    </Label>
                    <Textarea
                      placeholder="Add specific details, offers, or instructions for the AI generation..."
                      className="bg-white/80 dark:bg-secondary/50 min-h-[60px] text-sm resize-y"
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" {...register('name')} placeholder="Product name" />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brandId">Brand (Optional)</Label>
                      <Controller control={control} name="brandId" render={({ field }) => (
                        <Select
                          value={field.value || "none"}
                          onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                          disabled={brandsLoading}
                        >
                          <SelectTrigger><SelectValue placeholder="Select brand (Optional)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None / Optional --</SelectItem>
                            {brands?.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                      {errors.brandId && <p className="text-sm text-red-500">{errors.brandId.message}</p>}
                    </div>
                    <div>
                      <Label>Category (Optional)</Label>
                      <Controller control={control} name="categoryId" render={({ field }) => (
                        <Select
                          value={field.value || "none"}
                          onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                          disabled={categoriesLoading}
                        >
                          <SelectTrigger><SelectValue placeholder="Select category (Optional)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None / Optional --</SelectItem>
                            {categories?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                      {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="homeDisplaySection">Home Display Section (e.g. Best Sellers)</Label>
                    <Input id="homeDisplaySection" {...register('homeDisplaySection')} placeholder="Tag for home page section" />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      If this matches a product section heading on the home page, it will be added there automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Warranty</Label>
                      <Input {...register('warranty')} placeholder="e.g., 1 Year" />
                    </div>
                    <div>
                      <Label>HSN / SAC Code (GST)</Label>
                      <Input {...register('hsnCode')} placeholder="e.g., 9506" />
                      <p className="text-[10px] text-muted-foreground mt-0.5">Used for GST invoice classification</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Description</Label>
                      <div className="flex border rounded-md overflow-hidden h-7">
                        <button
                          type="button"
                          onClick={() => setIsPreview(false)}
                          className={`px-2 flex items-center gap-1 text-[10px] ${!isPreview ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                          <Code className="w-3 h-3" /> Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPreview(true)}
                          className={`px-2 flex items-center gap-1 text-[10px] ${isPreview ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>
                      </div>
                    </div>
                    {isPreview ? (
                      <div
                        className="min-h-[100px] p-3 border rounded-md bg-muted/30 prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: watch('description') || '<p className="text-muted-foreground italic">No description provided...</p>' }}
                      />
                    ) : (
                      <Textarea {...register('description')} rows={4} placeholder="HTML content is supported" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Selling Price *</Label>
                    <Input type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} />
                    {errors.sellingPrice && <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>}
                  </div>
                  <div>
                    <Label>Buying Price (Cost) *</Label>
                    <Input type="number" step="0.01" {...register('actualPrice', { valueAsNumber: true })} placeholder="Price you paid for the item" />
                    {errors.actualPrice && <p className="text-sm text-red-500">{errors.actualPrice.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">Used to calculate profit.</p>
                  </div>
                  <div>
                    <Label>MRP (Maximum Retail Price)</Label>
                    <Input type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Discount (%)</Label>
                    <Input {...register('discount', { valueAsNumber: true })} readOnly className="bg-gray-50 text-green-600 font-bold" />
                  </div>
                  <div>
                    <Label>Stock *</Label>
                    <Input type="number" {...register('stock', { valueAsNumber: true })} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Offers & Highlights & Sizes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Offers */}
                  <div>
                    <Label>Offers</Label>
                    <div className="flex gap-2">
                      <Input id="offerInput" placeholder="Press Enter to add" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.currentTarget as HTMLInputElement).value; addStringToField(val, 'offers'); (e.currentTarget as HTMLInputElement).value = '' } }} />
                      <Button type="button" onClick={() => { const el = document.getElementById('offerInput') as HTMLInputElement; addStringToField(el.value, 'offers'); el.value = '' }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {offers?.map((f, i) => (
                        <Badge key={i} variant="outline" className="gap-2 pr-1 h-7">
                          {f}
                          <button
                            type="button"
                            onClick={() => removeStringFromField(i, 'offers')}
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <Label>Highlights</Label>
                    <div className="flex gap-2">
                      <Input id="highlightInput" placeholder="Press Enter to add" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.currentTarget as HTMLInputElement).value; addStringToField(val, 'highlights'); (e.currentTarget as HTMLInputElement).value = '' } }} />
                      <Button type="button" onClick={() => { const el = document.getElementById('highlightInput') as HTMLInputElement; addStringToField(el.value, 'highlights'); el.value = '' }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {highlights?.map((f, i) => (
                        <Badge key={i} variant="outline" className="gap-2 pr-1 h-7">
                          {f}
                          <button
                            type="button"
                            onClick={() => removeStringFromField(i, 'highlights')}
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <Label>Sizes</Label>
                    <div className="flex gap-2">
                      <Input id="sizeInput" placeholder="Press Enter to add (e.g. S, M, XL)" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.currentTarget as HTMLInputElement).value; addStringToField(val, 'sizes'); (e.currentTarget as HTMLInputElement).value = '' } }} />
                      <Button type="button" onClick={() => { const el = document.getElementById('sizeInput') as HTMLInputElement; addStringToField(el.value, 'sizes'); el.value = '' }}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes?.map((f, i) => (
                        <Badge key={i} variant="secondary" className="gap-2 pr-1 h-7">
                          {f}
                          <button
                            type="button"
                            onClick={() => removeStringFromField(i, 'sizes')}
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product Images & Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Product Media (Images & Video)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Thumbnail Section */}
                  <div className="mb-6 pb-6 border-b">
                    <Label className="mb-2 block font-medium">Thumbnail Image (Listing & Mobile Optimized)</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 dark:bg-muted/50 flex items-center justify-center shrink-0">
                        {thumbnailPreview ? (
                          <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                        {thumbnailPreview && (
                          <button
                            type="button"
                            onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow-sm hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          ref={thumbnailInputRef}
                          type="file"
                          accept={ALLOWED_IMAGE_TYPES.join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > MAX_IMAGE_SIZE) {
                                toast.error("Thumbnail must be < 5MB");
                                return;
                              }
                              setThumbnailFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) setThumbnailPreview(ev.target.result as string)
                              }
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Upload a specific thumbnail for listing pages and mobile apps. Boosts performance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Media Dropzone */}
                  <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-xl p-6 sm:p-8 text-center cursor-pointer relative bg-muted/5 group">
                    <input
                      ref={mediaInputRef}
                      type="file"
                      multiple
                      accept={ALL_ALLOWED_MEDIA_TYPES.join(',')}
                      onChange={handleFilesChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-background rounded-full shadow-sm ring-1 ring-border group-hover:ring-primary/20 transition-all flex items-center gap-2">
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Video className="w-6 h-6 text-purple-600 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">Click to select or drag & drop Images and Video</p>
                        <p className="text-xs text-muted-foreground">
                          Images: JPEG, PNG, WEBP (up to 5MB) &bull; Video: MP4, WEBM, MOV (Max 1, up to 50MB) &bull; Max {MAX_MEDIA} files
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button for Video */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (existingVideos.length + newVideoFiles.length >= MAX_VIDEOS) {
                          toast.error("Only 1 product video is allowed. Remove the existing video first.");
                          return;
                        }
                        videoInputRef.current?.click();
                      }}
                      disabled={existingVideos.length + newVideoFiles.length >= MAX_VIDEOS}
                      className="flex items-center gap-1.5 text-xs font-semibold border-purple-500/40 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 disabled:opacity-50"
                    >
                      <Video className="w-4 h-4 text-purple-600" />
                      {existingVideos.length + newVideoFiles.length >= MAX_VIDEOS ? "Video Added (1/1)" : "Add Product Video"}
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept={ALLOWED_VIDEO_TYPES.join(',')}
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {existingImages.length + newFiles.length} Image(s) &bull; {existingVideos.length + newVideoFiles.length}/1 Video
                    </span>
                  </div>

                  {mediaError && (
                    <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {mediaError}
                    </p>
                  )}

                  {/* Media Grid (Images & Videos) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                    {/* Existing Images */}
                    {existingImages.map((url, i) => (
                      <div key={`ex-img-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-background shadow-sm">
                        <img src={url} alt={`ex-${i}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeExistingImage(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="absolute top-1 left-1 h-5 px-1.5 text-[10px] opacity-100">Existing Image</Badge>
                      </div>
                    ))}

                    {/* New Images */}
                    {newPreviews.map((p, i) => (
                      <div key={`new-img-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-background shadow-sm">
                        <img src={p} alt={`new-${i}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewImage(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge className="absolute top-1 left-1 h-5 px-1.5 text-[10px] bg-green-500 hover:bg-green-600">New Image</Badge>
                      </div>
                    ))}

                    {/* Existing Video */}
                    {existingVideos.map((url, i) => (
                      <div key={`ex-vid-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-950 shadow-sm flex items-center justify-center">
                        <video src={url} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeExistingVideo(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge className="absolute top-1 left-1 h-5 px-1.5 text-[10px] bg-red-600 hover:bg-red-700 text-white flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" /> Video
                        </Badge>
                      </div>
                    ))}

                    {/* New Video */}
                    {newVideoPreviews.map((p, i) => (
                      <div key={`new-vid-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-950 shadow-sm flex items-center justify-center">
                        <video src={p} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewVideo(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge className="absolute top-1 left-1 h-5 px-1.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" /> New Video
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Color Options</CardTitle>
                    <Button type="button" size="sm" onClick={() => appendColor({ name: "New Color" })}>Add Color</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchedColors?.map((color, index) => (
                    <div key={index} className="flex gap-3 items-start border p-3 rounded-md">
                      <div className="flex-1 space-y-2">
                        <Label>Color Name</Label>
                        <Input {...register(`colors.${index}.name`)} placeholder="e.g. Red" />
                        <div className="flex items-center gap-2 mt-2">
                          <div className="relative">
                            <Input type="file" accept="image/*" className="w-full text-xs" onChange={(e) => handleColorImageChange(index, e)} />
                          </div>
                          {/* Preview logic */}
                          {(color.image instanceof File) && <img src={URL.createObjectURL(color.image)} alt="preview" className="w-10 h-10 object-contain rounded" />}
                          {(typeof color.image === 'string' && color.image.length > 0) && <img src={color.image} alt="existing" className="w-10 h-10 object-contain rounded" />}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  ))}
                  {watchedColors?.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No colors added.</p>}
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Specifications</CardTitle>
                    <Button type="button" size="sm" onClick={addSpecSection}>Add Section</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchedSpecs?.map((spec, sIdx) => (
                    <div key={sIdx} className="border rounded p-3 space-y-3 bg-gray-50/50 dark:bg-muted/30">
                      <div className="flex justify-between items-center gap-2">
                        <Input {...register(`specifications.${sIdx}.title`)} placeholder="Section Title (e.g. In The Box)" className="font-semibold" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(sIdx)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>

                      <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                        {spec.items?.map((item, iIdx) => (
                          <div key={iIdx} className="flex gap-2 items-center">
                            <Input {...register(`specifications.${sIdx}.items.${iIdx}.key`)} placeholder="Key (e.g. Sales Package)" className="flex-1 h-8 text-sm" />
                            <Input {...register(`specifications.${sIdx}.items.${iIdx}.value`)} placeholder="Value (e.g. 1 Bat)" className="flex-1 h-8 text-sm" />
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSpecItem(sIdx, iIdx)}><X className="w-3 h-3" /></Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2 text-xs" onClick={() => addSpecItem(sIdx, "New Feature", "")}><Plus className="w-3 h-3 mr-1" /> Add Suggestion</Button>
                      </div>
                    </div>
                  ))}
                  {watchedSpecs?.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No specifications added.</p>}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" /> SEO Settings (AI Generated)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input {...register('seo.title')} placeholder="Focus keyword based title" />
                    <p className="text-[10px] text-muted-foreground mt-1">Recommended: 50-60 characters</p>
                  </div>
                  <div>
                    <Label>SEO Description</Label>
                    <Textarea {...register('seo.description')} rows={3} placeholder="Meta description for search results" />
                    <p className="text-[10px] text-muted-foreground mt-1">Recommended: 150-160 characters</p>
                  </div>
                  <div>
                    <Label>SEO Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        id="keywordInput"
                        placeholder="Add keyword and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.currentTarget as HTMLInputElement).value.trim();
                            if (val) {
                              const current = getValues('seo.keywords') || [];
                              setValue('seo.keywords', [...current, val], { shouldDirty: true });
                              (e.currentTarget as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(watch('seo.keywords') || []).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="gap-1 bg-violet-50 dark:bg-violet-950/30 pr-1 h-7 text-xs">
                          {keyword}
                          <button
                            type="button"
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 text-muted-foreground hover:text-red-500 transition-colors"
                            onClick={() => {
                              const current = getValues('seo.keywords') || [];
                              const newKeywords = current.filter((_, idx) => idx !== i);
                              setValue('seo.keywords', newKeywords, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RAG Knowledge Base Sync Option */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800/60 rounded-xl">
            <div className="flex items-center space-x-3">
              <Controller
                control={control}
                name="syncToRag"
                render={({ field }) => (
                  <Checkbox
                    id="syncToRag"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 size-5"
                  />
                )}
              />
              <div className="grid gap-1 leading-none cursor-pointer" onClick={() => setValue("syncToRag", !getValues("syncToRag"), { shouldDirty: true })}>
                <Label htmlFor="syncToRag" className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer text-violet-950 dark:text-violet-100">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Auto-sync with AI / RAG Knowledge Base
                </Label>
                <p className="text-xs text-muted-foreground">
                  Product details (title, specs, price & stock) will be automatically vectorized & added to RAG database.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] bg-violet-100/50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 whitespace-nowrap">
              Instant AI Knowledge
            </Badge>
          </div>

          <div className="flex justify-end items-center gap-3 pt-6 border-t mt-4 sticky bottom-0 bg-background pb-6 sm:pb-0">
            <Button type="button" variant="outline" onClick={() => { handleOpenChange(false); resetLocal(); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
