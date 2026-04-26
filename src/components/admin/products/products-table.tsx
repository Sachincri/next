"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Switch } from "@/ui/switch"
import { Search, Filter, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Eye, BarChart3, AlertTriangle, Home } from "lucide-react"
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
  useAddProductToHomeSectionMutation
} from "@/redux/api/adminApi"

import AddEditProductModal from "./add-product-modal"
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
  const { data: analyticsData } = useGetProductAnalyticsQuery();

  const products = productsData?.products || [];

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

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
    for (const id of selectedProducts) {
      try {
        await deleteProductMutation(id).unwrap();
      } catch (err) {
        console.error(`Failed to delete product ${id}`);
      }
    }
    setSelectedProducts([])
    toast.success(`${selectedProducts.length} products deletion process initiated`);
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
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update product");
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

  const filteredProducts = products?.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const skuMatch = product._id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = nameMatch || skuMatch

    const categoryName = typeof product.category === 'object' && product.category !== null ? (product.category as any).name : product.category;
    const matchesCategory = categoryFilter === "all" || categoryName?.toLowerCase() === categoryFilter.toLowerCase()

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "out" && product.stock === 0) ||
      (stockFilter === "low" && product.stock > 0 && product.stock < 10) ||
      (stockFilter === "in" && product.stock >= 10)

    return matchesSearch && matchesCategory && matchesStock
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const modalInitialData = editingProduct ? {
    ...editingProduct,
    sellingPrice: editingProduct.sellingPrice,
    mrp: editingProduct.maximumRetailPrice,
    images: editingProduct.images?.map(img => img.url) ?? [],
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
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold">Products ({filteredProducts?.length})</CardTitle>

              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedProducts?.length} selected</span>
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDeleteClick}>
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
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
                            {(product.category as any)?.name || product.category}
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
                        <td colSpan={8} className="text-center py-10 text-muted-foreground">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts?.length || 0)} of {filteredProducts?.length || 0} products
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
        onOpenChange={setIsEditModalOpen}
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
    </Tabs>
  )
}
