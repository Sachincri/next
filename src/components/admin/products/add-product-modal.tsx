'use client'

import React, { useCallback, useEffect, useMemo, useState } from "react"
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
import { Plus, X, Trash2, Palette, Edit3, Image as ImageIcon, Upload, Sparkles, Loader2, Eye, Code } from "lucide-react"
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
  brandId: z.string().min(1,).optional(),
  sellingPrice: z.number().min(0.01),
  actualPrice: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  stock: z.number().int().min(1).optional(),
  categoryId: z.string().min(1, "Category is required"),
  discount: z.number().min(0).max(100).optional(),
  warranty: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  offers: z.array(z.string().min(1)).max(10).optional(),
  highlights: z.array(z.string().min(1)).max(10).optional(),
  sizes: z.array(z.string().min(1)).max(20).optional(),
  specifications: z.array(specificationSchema).max(20).optional(),
  colors: z.array(colorSchema).max(20).optional(),
  isActive: z.boolean(),
  seo: z.object({
    title: z.string().max(60, "SEO Title should be max 60 characters").optional(),
    description: z.string().max(160, "SEO Description should be max 160 characters").optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  thumbnail: z.any().optional(), // File or string URL
})


export type ProductFormData = z.infer<typeof productSchema>

interface AddEditProductModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<ProductFormData> & { images?: string[] }
  onSave: (payload: FormData) => Promise<void>
}

import { useGetBrandsQuery, useGetCategoriesQuery, useGenerateProductDetailsMutation } from "@/redux/api/adminApi"

export default function AddEditProductModal({ isOpen, onOpenChange, initialData, onSave }: AddEditProductModalProps) {
  const isEdit = !!initialData

  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState<string>("")
  const [isPreview, setIsPreview] = useState(false)

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>((initialData as any)?.thumbnail?.url ?? null)
  const [aiContext, setAiContext] = useState<string>("")

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const MAX_IMAGES = 10
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

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
    defaultValues: {
      name: "",
      brandId: "",
      sellingPrice: 0,
      actualPrice: 0,
      mrp: undefined,
      stock: 0,
      categoryId: "",
      discount: 0,
      warranty: "",
      description: "",
      offers: [],
      highlights: [],
      sizes: [],
      specifications: [],
      colors: [],
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: [],
      },
    }
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

  useEffect(() => {
    if (initialData) {
      const clone: any = { ...initialData }
      delete clone.images
      // ensure arrays exist
      clone.offers = clone.offers ?? []
      clone.highlights = clone.highlights ?? []
      clone.sizes = clone.sizes ?? []
      clone.specifications = clone.specifications ?? []
      clone.colors = clone.colors ?? []
      clone.isActive = clone.isActive ?? true
      clone.seo = clone.seo ?? { title: "", description: "", keywords: [] }

      // Map brand and category to IDs if they are objects
      if (typeof clone.brand === 'object' && clone.brand?._id) clone.brandId = clone.brand._id
      else if (clone.brand && typeof clone.brand === 'string') clone.brandId = clone.brand

      if (typeof clone.category === 'object' && clone.category?._id) clone.categoryId = clone.category._id
      else if (clone.category && typeof clone.category === 'string') clone.categoryId = clone.category

      reset(clone)
      setExistingImages(initialData.images ?? [])
    } else {
      reset({
        name: "",
        brandId: "",
        sellingPrice: 0,
        actualPrice: 0,
        mrp: undefined,
        stock: 0,
        categoryId: "",
        discount: 0,
        warranty: "",
        description: "",
        offers: [],
        highlights: [],
        sizes: [],
        specifications: [],
        colors: [],
        isActive: true,
        seo: {
          title: "",
          description: "",
          keywords: [],
        },
      })
      setExistingImages([])
    }
  }, [initialData, reset])

  // Derived states
  const totalImageCount = useMemo(() => existingImages.length + newFiles.length, [existingImages.length, newFiles.length])
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

  // Image handlers for Main Product
  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("")
    const files = e.target.files ? Array.from(e.target.files) : []
    if (existingImages.length + files.length + newFiles.length > MAX_IMAGES) {
      setImageError(`Max ${MAX_IMAGES} images allowed`)
      return
    }
    const oversized = files.filter(f => f.size > MAX_IMAGE_SIZE)
    if (oversized.length) return setImageError("Some files exceed 5MB")
    const invalid = files.filter(f => !ALLOWED_IMAGE_TYPES.includes(f.type))
    if (invalid.length) return setImageError("Invalid file type")

    // read previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.readyState === 2 && typeof reader.result === 'string') setNewPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setNewFiles(prev => [...prev, ...files])
  }, [existingImages.length, newFiles.length])

  const removeExistingImage = useCallback((index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const removeNewImage = useCallback((index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }, [])

  const resetLocal = useCallback(() => {
    reset()
    setExistingImages([])
    setNewFiles([])
    setNewPreviews([])
    setNewPreviews([])
    setImageError("")
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setAiContext("")
  }, [reset])

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
      const form = new FormData()
      form.append('name', data.name)
      if (data.brandId) form.append('brandId', data.brandId)
      form.append('sellingPrice', String(data.sellingPrice))
      if (data.actualPrice !== undefined) form.append('actualPrice', String(data.actualPrice))
      if (data.mrp !== undefined) form.append('maximumRetailPrice', String(data.mrp))
      form.append('stock', String(data.stock))
      form.append('categoryId', data.categoryId)
      if (data.discount !== undefined) form.append('discount', String(data.discount))
      if (data.warranty) form.append('warranty', data.warranty)
      if (data.description) form.append('description', data.description)
      form.append('isActive', String(data.isActive))

      if (thumbnailFile) form.append('thumbnail', thumbnailFile)


      // Append Arrays
      // Append Arrays
      newFiles.forEach((f) => form.append('images', f))

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

      // Removed Images
      const removedUrls = (initialData?.images ?? []).filter(url => !existingImages.includes(url))
      removedUrls.forEach(u => form.append('removedImageUrls', u))

      await onSave(form)
    } catch (err) {
      console.error(err)
    }
  }, [existingImages, initialData, isEdit, newFiles, onSave, totalImageCount])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] xl:max-w-7xl max-h-[92vh] overflow-y-auto">
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
                      <Label htmlFor="brandId">Brand *</Label>
                      <Controller control={control} name="brandId" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={brandsLoading}>
                          <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                          <SelectContent>
                            {brands?.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                      {errors.brandId && <p className="text-sm text-red-500">{errors.brandId.message}</p>}
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Controller control={control} name="categoryId" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={categoriesLoading}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                      {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Warranty</Label>
                    <Input {...register('warranty')} placeholder="e.g., 1 Year" />
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
              {/* Product Images */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Product Images</CardTitle></CardHeader>
                <CardContent>
                  {/* Thumbnail Section */}
                  <div className="mb-6 pb-6 border-b">
                    <Label className="mb-2 block">Thumbnail Image (Mobile Optimized)</Label>
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

                  <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-xl p-8 text-center cursor-pointer relative bg-muted/5 group">
                    <input type="file" multiple accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleFilesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-background rounded-full shadow-sm ring-1 ring-border group-hover:ring-primary/20 transition-all">
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Click to select or drag and drop images</p>
                        <p className="text-xs text-muted-foreground">
                          JPEG, PNG, WEBP up to 5MB (Max {MAX_IMAGES} images)
                        </p>
                      </div>
                    </div>
                  </div>
                  {imageError && <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {imageError}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                    {existingImages.map((url, i) => (
                      <div key={`ex-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-background shadow-sm">
                        <img src={url} alt={`ex-${i}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeExistingImage(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="absolute top-1 left-1 h-5 px-1.5 text-[10px] opacity-100">Existing</Badge>
                      </div>
                    ))}
                    {newPreviews.map((p, i) => (
                      <div key={`new-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-background shadow-sm">
                        <img src={p} alt={`new-${i}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewImage(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge className="absolute top-1 left-1 h-5 px-1.5 text-[10px] bg-green-500 hover:bg-green-600">New</Badge>
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

          <div className="flex justify-end items-center gap-3 pt-6 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetLocal() }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
