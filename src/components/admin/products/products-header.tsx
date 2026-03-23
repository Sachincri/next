"use client"

import { useState } from "react"
import { Button } from "../../ui/button"
import { Plus, Upload, Download, FileSpreadsheet } from "lucide-react"
import AddProductModal from "./add-product-modal"
import { useCreateProductMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"

export default function ProductsHeader() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [createProduct] = useCreateProductMutation()

  const handleSaveProduct = async (formData: FormData) => {
    try {
      const res = await createProduct(formData).unwrap()
      toast.success(res?.message || "Product created successfully")
      setIsAddModalOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product")
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
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-start px-2">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-start px-2">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm" className="flex-1 sm:flex-none justify-start px-2">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
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
    </>
  )
}
