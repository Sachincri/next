"use client"

import { useState } from "react"
import { Button } from "../../ui/button"
import { Plus, Upload, Download, FileSpreadsheet } from "lucide-react"
import AddProductModal from "./add-product-modal"
import ProductImportModal from "./ProductImportModal"
import BulkOperationsModal from "./BulkOperationsModal"
import { useCreateProductMutation, useGetAdminProductsQuery } from "@/redux/api/adminApi"
import { exportProductsToCSV } from "@/utils/csvHelper"
import toast from "react-hot-toast"

export default function ProductsHeader() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [createProduct] = useCreateProductMutation()
  const { data: productsData } = useGetAdminProductsQuery()
  const products = productsData?.products || []

  const handleSaveProduct = async (formData: FormData) => {
    try {
      const res = await createProduct(formData).unwrap()
      toast.success(res?.message || "Product created successfully")
      setIsAddModalOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product")
      throw error
    }
  }

  const handleExport = () => {
    if (products.length === 0) {
      toast.error("No products available to export")
      return
    }
    const success = exportProductsToCSV(
      products,
      `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`
    )
    if (success) {
      toast.success(`Exported ${products.length} products to CSV`)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Management</h1>
          <p className="text-muted-foreground">Manage your inventory and product catalog</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none justify-start px-3"
          >
            <Upload className="w-4 h-4 mr-2 text-primary" />
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1 sm:flex-none justify-start px-3"
          >
            <Download className="w-4 h-4 mr-2 text-emerald-600" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none justify-start px-3"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-purple-600" />
            Bulk
          </Button>

          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleSaveProduct}
      />

      <ProductImportModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      <BulkOperationsModal
        isOpen={isBulkModalOpen}
        onOpenChange={setIsBulkModalOpen}
        selectedProductIds={products.map((p) => p._id)}
      />
    </>
  )
}

