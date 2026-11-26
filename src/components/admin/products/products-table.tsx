"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Switch } from "@/ui/switch"
import {
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
  AlertTriangle,
  Home,
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Download
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetProductAnalyticsQuery,
  useGetHomeSectionsQuery,
  useAddProductToHomeSectionMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useBulkProductActionMutation,
} from "@/redux/api/adminApi"

import AddEditProductModal from "./add-product-modal"
import BulkOperationsModal from "./BulkOperationsModal"
import { exportProductsToCSV } from "@/utils/csvHelper"
import { Product } from "@/types"
import { useAppDispatch } from "@/redux/hooks"
import toast from "react-hot-toast"
import ManageReviewsModal from "./manage-reviews-modal"

export default function ProductsTable() {
  const dispatch = useAppDispatch()

  // RTK Query Hooks
  const { data: productsData, isLoading: loading } = useGetAdminProductsQuery();
  const [deleteProductMutation] = useDeleteProductMutation();
  const [updateProductMutation] = useUpdateProductMutation();
  const [bulkProductAction] = useBulkProductActionMutation();
  const { data: analyticsData } = useGetProductAnalyticsQuery();
  const { data: dbCategories = [] } = useGetCategoriesQuery();
  const { data: dbBrands = [] } = useGetBrandsQuery();

  const products = productsData?.products || [];

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [discountFilter, setDiscountFilter] = useState("all")
  const [mediaFilter, setMediaFilter] = useState("all")
  const [homeFilter, setHomeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Review Modal State
  const [reviewProductId, setReviewProductId] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  // Move to Home Modal State
  const [movingProduct, setMovingProduct] = useState<Product | null>(null)
  const [isMoveToHomeOpen, setIsMoveToHomeOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedQuadIndex, setSelectedQuadIndex] = useState<string>("0")

  const { data: homeSections, isLoading: sectionsLoading } = useGetHomeSectionsQuery(undefined, {
    skip: !isMoveToHomeOpen
  });
  const [addProductToHome] = useAddProductToHomeSectionMutation();

  // Alert Dialog State
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertData, setAlertData] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ title: "", description: "", onConfirm: () => { } })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const executeDelete = async (id: string) => {
    try {
      const res = await deleteProductMutation(id).unwrap();
      toast.success(res?.message || "Product deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete product");
    }
  }

  const handleDeleteClick = (id: string) => {
    setAlertData({
      title: "Delete Product",
      description: "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: () => executeDelete(id)
    })
    setAlertOpen(true)
  }

  const executeBulkDelete = async () => {
    try {
      const res = await bulkProductAction({
        productIds: selectedProducts,
        action: "delete",
      }).unwrap();
      setSelectedProducts([]);
      toast.success(res?.message || `${selectedProducts.length} products deleted successfully`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete selected products");
    }
  }

  const handleBulkDeleteClick = () => {
    setAlertData({
      title: "Delete Selected Products",
      description: `Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`,
      onConfirm: () => executeBulkDelete()
    })
    setAlertOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleManageReviews = (productId: string) => {
    setReviewProductId(productId)
    setIsReviewModalOpen(true)
  }

  const handleUpdateSave = async (payload: FormData) => {
    if (editingProduct?._id) {
      try {
        const res = await updateProductMutation({ productId: editingProduct._id, productData: payload }).unwrap();
        toast.success(res?.message || "Product updated successfully");
        setIsEditModalOpen(false);
        setEditingProduct(null);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update product");
        throw error;
      }
    }
  }

  const handleMoveToHome = (product: Product) => {
    setMovingProduct(product)
    setIsMoveToHomeOpen(true)
  }

  const executeMoveToHome = async () => {
    if (!movingProduct?._id || !selectedSection) return;

    try {
      const section = homeSections?.find(s => s.id === selectedSection);
      await addProductToHome({
        productId: movingProduct._id,
        sectionId: selectedSection,
        quadIndex: section?.type === 'quad_grid' ? Number(selectedQuadIndex) : undefined
      }).unwrap();
      
      toast.success(`Product moved to home section`);
      setIsMoveToHomeOpen(false);
      setMovingProduct(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to move product");
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (stock < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const getStatusBadge = (product: Product) => {
    return product.isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
    )
  }

  const handleSelectProduct = (productId: string | any) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(selectedProducts?.length === products?.length && products?.length > 0 ? [] : products.map((product) => product._id as string))
  }

  // Extract unique categories from DB query and loaded products
  const allCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()

    if (Array.isArray(dbCategories)) {
      dbCategories.forEach((c: any) => {
        if (c && c.name) {
          map.set(c._id || c.name.toLowerCase(), { id: c._id || c.name, name: c.name })
        }
      })
    }

    if (Array.isArray(products)) {
      products.forEach((p: any) => {
        if (p.category) {
          if (typeof p.category === 'object' && p.category.name) {
            map.set(p.category._id || p.category.name.toLowerCase(), {
              id: p.category._id || p.category.name,
              name: p.category.name
            })
          } else if (typeof p.category === 'string' && p.category.trim()) {
            map.set(p.category.toLowerCase(), { id: p.category, name: p.category })
          }
        }
      })
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [dbCategories, products])

  // Extract unique brands from DB query and loaded products
  const allBrands = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()

    if (Array.isArray(dbBrands)) {
      dbBrands.forEach((b: any) => {
        if (b && b.name) {
          map.set((b as any)._id || b.name.toLowerCase(), { id: (b as any)._id || b.name, name: b.name })
        }
      })
    }

    if (Array.isArray(products)) {
      products.forEach((p: any) => {
        if (p.brand) {
          if (typeof p.brand === 'object' && p.brand.name) {
            map.set(p.brand._id || p.brand.name.toLowerCase(), {
              id: p.brand._id || p.brand.name,
              name: p.brand.name
            })
          } else if (typeof p.brand === 'string' && p.brand.trim()) {
            map.set(p.brand.toLowerCase(), { id: p.brand, name: p.brand })
          }
        }
      })
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [dbBrands, products])

  // Comprehensive Filter & Sort logic
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []

    return products.filter((product) => {
      // 1. Search term (matches name, SKU/_id, brand, category, HSN)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const nameMatch = product.name?.toLowerCase().includes(query)
        const idMatch = product._id?.toString().toLowerCase().includes(query)
        const catName = typeof product.category === 'object' && product.category ? (product.category as any).name : (typeof product.category === 'string' ? product.category : '')
        const catMatch = catName?.toLowerCase().includes(query)
        const brandName = typeof product.brand === 'object' && product.brand ? (product.brand as any).name : (typeof product.brand === 'string' ? product.brand : '')
        const brandMatch = brandName?.toLowerCase().includes(query)
        const hsnMatch = product.hsnCode?.toLowerCase().includes(query)
        if (!nameMatch && !idMatch && !catMatch && !brandMatch && !hsnMatch) {
          return false
        }
      }

      // 2. Category Filter
      if (categoryFilter !== "all") {
        if (categoryFilter === "uncategorized") {
          if (product.category) return false
        } else {
          const catId = typeof product.category === 'object' && product.category ? (product.category as any)._id?.toString() : (typeof product.category === 'string' ? product.category : '')
          const catName = typeof product.category === 'object' && product.category ? (product.category as any).name : (typeof product.category === 'string' ? product.category : '')
          const matches = categoryFilter === catId ||
                          categoryFilter.toLowerCase() === catName?.toLowerCase() ||
                          (catId && categoryFilter === catId)
          if (!matches) return false
        }
      }

      // 3. Brand Filter
      if (brandFilter !== "all") {
        if (brandFilter === "unbranded") {
          if (product.brand) return false
        } else {
          const bId = typeof product.brand === 'object' && product.brand ? (product.brand as any)._id?.toString() : (typeof product.brand === 'string' ? product.brand : '')
          const bName = typeof product.brand === 'object' && product.brand ? (product.brand as any).name : (typeof product.brand === 'string' ? product.brand : '')
          const matches = brandFilter === bId ||
                          brandFilter.toLowerCase() === bName?.toLowerCase() ||
                          (bId && brandFilter === bId)
          if (!matches) return false
        }
      }

      // 4. Status Filter (Active / Inactive)
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !product.isActive) return false
        if (statusFilter === "inactive" && product.isActive) return false
      }

      // 5. Stock Filter
      if (stockFilter !== "all") {
        const stock = typeof product.stock === 'number' ? product.stock : Number(product.stock) || 0
        if (stockFilter === "out" && stock !== 0) return false
        if (stockFilter === "low" && (stock <= 0 || stock >= 10)) return false
        if (stockFilter === "in" && stock < 10) return false
      }

      // 6. Price Range Filter
      const price = typeof product.sellingPrice === 'number' ? product.sellingPrice : Number(product.sellingPrice) || 0
      if (minPrice && !isNaN(Number(minPrice))) {
        if (price < Number(minPrice)) return false
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        if (price > Number(maxPrice)) return false
      }

      // 7. Discount Filter
      if (discountFilter !== "all") {
        const discount = typeof product.discount === 'number' ? product.discount : Number(product.discount) || 0
        if (discountFilter === "none" && discount > 0) return false
        if (discountFilter === "any" && discount <= 0) return false
        if (discountFilter === "10" && discount < 10) return false
        if (discountFilter === "25" && discount < 25) return false
        if (discountFilter === "50" && discount < 50) return false
      }

      // 8. Media Filter
      if (mediaFilter !== "all") {
        const hasVideos = Array.isArray((product as any).videos) && (product as any).videos.length > 0
        const hasImages = Array.isArray(product.images) && product.images.length > 0
        if (mediaFilter === "has_video" && !hasVideos) return false
        if (mediaFilter === "no_video" && hasVideos) return false
        if (mediaFilter === "no_images" && hasImages) return false
        if (mediaFilter === "has_images" && !hasImages) return false
      }

      // 9. Home Section Filter
      if (homeFilter !== "all") {
        const hasHome = !!(product as any).homeDisplaySection && (product as any).homeDisplaySection.trim() !== ""
        if (homeFilter === "on_home" && !hasHome) return false
        if (homeFilter === "not_on_home" && hasHome) return false
      }

      return true
    }).sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.sellingPrice || 0) - (b.sellingPrice || 0)
        case "price_desc":
          return (b.sellingPrice || 0) - (a.sellingPrice || 0)
        case "stock_asc":
          return (a.stock || 0) - (b.stock || 0)
        case "stock_desc":
          return (b.stock || 0) - (a.stock || 0)
        case "discount_desc":
          return (b.discount || 0) - (a.discount || 0)
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "")
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "")
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })
  }, [products, searchTerm, categoryFilter, brandFilter, statusFilter, stockFilter, minPrice, maxPrice, discountFilter, mediaFilter, homeFilter, sortBy])

  // Count active filters (excluding default values)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (categoryFilter !== "all") count++
    if (brandFilter !== "all") count++
    if (statusFilter !== "all") count++
    if (stockFilter !== "all") count++
    if (minPrice.trim() !== "") count++
    if (maxPrice.trim() !== "") count++
    if (discountFilter !== "all") count++
    if (mediaFilter !== "all") count++
    if (homeFilter !== "all") count++
    if (sortBy !== "newest") count++
    return count
  }, [categoryFilter, brandFilter, statusFilter, stockFilter, minPrice, maxPrice, discountFilter, mediaFilter, homeFilter, sortBy])

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSearchTerm("")
    setCategoryFilter("all")
    setBrandFilter("all")
    setStatusFilter("all")
    setStockFilter("all")
    setMinPrice("")
    setMaxPrice("")
    setDiscountFilter("all")
    setMediaFilter("all")
    setHomeFilter("all")
    setSortBy("newest")
    setCurrentPage(1)
  }, [])

  // Auto reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, brandFilter, statusFilter, stockFilter, minPrice, maxPrice, discountFilter, mediaFilter, homeFilter, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const modalInitialData = editingProduct ? {
    ...editingProduct,
    sellingPrice: editingProduct.sellingPrice,
    mrp: editingProduct.maximumRetailPrice,
    images: editingProduct.images?.map(img => img.url) ?? [],
    videos: (editingProduct as any).videos?.map((vid: any) => typeof vid === 'string' ? vid : vid.url) ?? [],
    specifications: editingProduct.specifications?.map(s => typeof s === 'string' ? JSON.parse(s) : s) ?? [],
    colors: editingProduct.colors?.map(c => {
      if (typeof c === 'string') {
        try { return JSON.parse(c); } catch (e) { return { name: c }; }
      }
      return c;
    }) ?? [],
  } : undefined

  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList>
        <TabsTrigger value="products">All Products</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Products ({filteredProducts.length}
                  {filteredProducts.length !== products.length && ` of ${products.length}`})
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage inventory, pricing, catalog and visibility
                </p>
              </div>

              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedProducts.length} selected</span>
                  <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)}>
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDeleteClick}>
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            {/* Primary Filter Row */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU/ID, brand, HSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Dynamic Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All Categories ({products.length})</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stock Status Filter */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock (10+)</SelectItem>
                  <SelectItem value="low">Low Stock (&lt;10)</SelectItem>
                  <SelectItem value="out">Out of Stock (0)</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter (Active / Inactive) */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              {/* More Filters Toggle */}
              <Button
                type="button"
                variant={isMoreFiltersOpen || activeFiltersCount > 0 ? "secondary" : "outline"}
                onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>More Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-[11px] rounded-full">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Export Filtered View */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (filteredProducts.length === 0) {
                    toast.error("No products to export");
                    return;
                  }
                  exportProductsToCSV(
                    filteredProducts,
                    `filtered_products_${new Date().toISOString().slice(0, 10)}.csv`
                  );
                  toast.success(`Exported ${filteredProducts.length} products to CSV`);
                }}
                className="flex items-center gap-1.5 text-xs h-9 px-3 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export ({filteredProducts.length})</span>
              </Button>

              {/* Quick Reset Button */}
              {(activeFiltersCount > 0 || searchTerm) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              )}
            </div>

            {/* Expandable Advanced "More Filters" Section */}
            {isMoreFiltersOpen && (
              <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Brand Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Brand</label>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        <SelectItem value="all">All Brands ({allBrands.length})</SelectItem>
                        <SelectItem value="unbranded">No Brand / Unbranded</SelectItem>
                        {allBrands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Price Range (₹)</label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="text-xs h-9"
                      />
                      <span className="text-muted-foreground text-xs">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  {/* Discount Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Discount</label>
                    <Select value={discountFilter} onValueChange={setDiscountFilter}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="All Discounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Discounts</SelectItem>
                        <SelectItem value="any">Any Discount (&gt; 0%)</SelectItem>
                        <SelectItem value="10">10% or more</SelectItem>
                        <SelectItem value="25">25% or more</SelectItem>
                        <SelectItem value="50">50% or more</SelectItem>
                        <SelectItem value="none">No Discount (0%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Media / Video Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Media / Video</label>
                    <Select value={mediaFilter} onValueChange={setMediaFilter}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="All Media" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Media</SelectItem>
                        <SelectItem value="has_video">Has Product Video</SelectItem>
                        <SelectItem value="no_video">No Video</SelectItem>
                        <SelectItem value="has_images">Has Images</SelectItem>
                        <SelectItem value="no_images">Missing Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="stock_asc">Stock: Low to High</SelectItem>
                        <SelectItem value="stock_desc">Stock: High to Low</SelectItem>
                        <SelectItem value="discount_desc">Highest Discount</SelectItem>
                        <SelectItem value="name_asc">Name: A to Z</SelectItem>
                        <SelectItem value="name_desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Secondary Row in More Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Home Page:</span>
                    <Select value={homeFilter} onValueChange={setHomeFilter}>
                      <SelectTrigger className="h-8 text-xs w-48">
                        <SelectValue placeholder="Home Display" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All (Home & Catalog)</SelectItem>
                        <SelectItem value="on_home">Featured on Home Section</SelectItem>
                        <SelectItem value="not_on_home">Catalog Only (Not on Home)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetAllFilters}
                      disabled={activeFiltersCount === 0 && !searchTerm}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filter Chips Bar */}
            {(activeFiltersCount > 0 || searchTerm) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Search: "{searchTerm}"
                    <button type="button" onClick={() => setSearchTerm("")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Category: {allCategories.find(c => c.id === categoryFilter)?.name || (categoryFilter === "uncategorized" ? "Uncategorized" : categoryFilter)}
                    <button type="button" onClick={() => setCategoryFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {brandFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Brand: {allBrands.find(b => b.id === brandFilter)?.name || (brandFilter === "unbranded" ? "Unbranded" : brandFilter)}
                    <button type="button" onClick={() => setBrandFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {stockFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Stock: {stockFilter === "in" ? "In Stock (10+)" : stockFilter === "low" ? "Low Stock (<10)" : "Out of Stock"}
                    <button type="button" onClick={() => setStockFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Status: {statusFilter === "active" ? "Active" : "Inactive"}
                    <button type="button" onClick={() => setStatusFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Price: {minPrice ? `₹${minPrice}` : "₹0"} - {maxPrice ? `₹${maxPrice}` : "Any"}
                    <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {discountFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Discount: {discountFilter === "any" ? "> 0%" : discountFilter === "none" ? "0%" : `${discountFilter}%+`}
                    <button type="button" onClick={() => setDiscountFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {mediaFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Media: {mediaFilter === "has_video" ? "Has Video" : mediaFilter === "no_video" ? "No Video" : mediaFilter === "has_images" ? "Has Images" : "No Images"}
                    <button type="button" onClick={() => setMediaFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {homeFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Home: {homeFilter === "on_home" ? "On Home Page" : "Catalog Only"}
                    <button type="button" onClick={() => setHomeFilter("all")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {sortBy !== "newest" && (
                  <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                    Sort: {sortBy.replace("_", " ")}
                    <button type="button" onClick={() => setSortBy("newest")} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-primary hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">
                        <Checkbox
                          checked={selectedProducts?.length === products?.length && products?.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Selling Price</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reviews</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts?.map((product) => {
                      const stockStatus = getStockStatus(product.stock)
                      return (
                        <tr key={product._id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedProducts.includes(product._id as string)}
                              onCheckedChange={() => handleSelectProduct(product._id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0]?.url || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-contain bg-muted"
                              />
                              <div>
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{product._id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm truncate max-w-[100px]">{product._id}</td>
                          <td className="py-3 px-4 text-sm capitalize">
                            {(product.category as any)?.name || product.category || "None"}
                          </td>
                          <td className="py-3 px-4 text-sm capitalize">
                            {(product.brand as any)?.name || product.brand || "—"}
                          </td>
                          <td className="py-3 px-4 font-semibold">₹{product.sellingPrice}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={product.stock < 10 ? "text-red-600 font-semibold" : ""}>
                                {product.stock}
                              </span>
                              <Badge className={`${stockStatus.color} hover:${stockStatus.color} text-xs`}>
                                {stockStatus.label}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mr-4">
                              <span className="font-medium text-foreground">{product.ratings?.count || 0}</span>
                              <span className="text-xs">reviews</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Switch
                              checked={product.isActive}
                              onCheckedChange={async (checked) => {
                                try {
                                  const formData = new FormData();
                                  formData.append("isActive", String(checked));
                                  await updateProductMutation({ productId: product._id, productData: formData }).unwrap();
                                  toast.success(`Product ${checked ? 'activated' : 'deactivated'}`);
                                } catch (err) {
                                  toast.error("Failed to update status");
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(product)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleManageReviews(product._id)}>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  Manage Reviews
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveToHome(product)}>
                                  <Home className="w-4 h-4 mr-2" />
                                  Move to Home
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(product._id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredProducts?.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-12 text-muted-foreground">
                          <p className="font-medium text-base mb-1">No products found</p>
                          <p className="text-sm">Try adjusting your filters or search terms.</p>
                          {(activeFiltersCount > 0 || searchTerm) && (
                            <Button variant="outline" size="sm" onClick={resetAllFilters} className="mt-4">
                              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                              Clear all filters
                            </Button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts?.length || 0)} of {filteredProducts?.length || 0} products
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Stock Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">Products requiring attention</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products
                  ?.filter((p) => p.stock <= 10)
                  ?.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-8 h-8 rounded object-contain bg-muted"
                        />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product._id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${product.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                          {product.stock} left
                        </p>
                        <Button variant="outline" size="sm" className="mt-1 bg-transparent" onClick={() => handleEdit(product)}>
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <AddEditProductModal
        isOpen={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingProduct(null);
        }}
        initialData={modalInitialData as any}
        onSave={handleUpdateSave}
      />

      <ManageReviewsModal
        isOpen={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        productId={reviewProductId as string}
      />

      <Dialog open={isMoveToHomeOpen} onOpenChange={setIsMoveToHomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Product to Home Section</DialogTitle>
            <DialogDescription>
              Select a section on the homepage where you want to display <strong>{movingProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Homepage Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionsLoading ? (
                    <SelectItem value="loading" disabled>Loading sections...</SelectItem>
                  ) : (
                    homeSections?.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.heading} ({section.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {homeSections?.find(s => s.id === selectedSection)?.type === 'quad_grid' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Card Position</label>
                <Select value={selectedQuadIndex} onValueChange={setSelectedQuadIndex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Card" />
                  </SelectTrigger>
                  <SelectContent>
                    {homeSections?.find(s => s.id === selectedSection)?.quadCards?.map((card : any) => (
                      <SelectItem key={card.index} value={card.index.toString()}>
                        {card.title} (Position {card.index + 1})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {homeSections?.find(s => s.id === selectedSection)?.type === 'single_product_carousel' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Display Slot</label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedQuadIndex(idx.toString())}
                      className={`
                        cursor-pointer p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all
                        ${selectedQuadIndex === idx.toString() 
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20" 
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200"}
                      `}
                    >
                      <span className={`text-lg font-bold ${selectedQuadIndex === idx.toString() ? "text-blue-600" : "text-slate-400"}`}>
                        {idx + 1}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">Slot</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveToHomeOpen(false)}>Cancel</Button>
            <Button onClick={executeMoveToHome} disabled={!selectedSection}>
              Confirm Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertData.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertData.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              alertData.onConfirm()
              setAlertOpen(false)
            }} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkOperationsModal
        isOpen={isBulkModalOpen}
        onOpenChange={setIsBulkModalOpen}
        selectedProductIds={selectedProducts}
        onSuccess={() => setSelectedProducts([])}
      />
    </Tabs>
  )
}
