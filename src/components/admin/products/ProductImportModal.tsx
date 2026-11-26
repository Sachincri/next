"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { downloadSampleCSVTemplate, parseCSVToProducts } from "@/utils/csvHelper"
import { useBulkImportProductsMutation } from "@/redux/api/adminApi"
import toast from "react-hot-toast"

interface ProductImportModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductImportModal({
  isOpen,
  onOpenChange,
}: ProductImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedProducts, setParsedProducts] = useState<any[]>([])
  const [fileName, setFileName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bulkImport, { isLoading }] = useBulkImportProductsMutation()

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg("")
    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMsg("Please select a valid CSV (.csv) file")
      return
    }

    setFile(selectedFile)
    setFileName(selectedFile.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) {
        setErrorMsg("Selected file is empty")
        return
      }

      const products = parseCSVToProducts(text)
      if (products.length === 0) {
        setErrorMsg(
          "No valid products found. Ensure columns match the sample template and 'Product Name' and 'Selling Price' are filled."
        )
        setParsedProducts([])
      } else {
        setParsedProducts(products)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleReset = () => {
    setFile(null)
    setParsedProducts([])
    setFileName("")
    setErrorMsg("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleImportSubmit = async () => {
    if (parsedProducts.length === 0) {
      toast.error("No valid products to import")
      return
    }

    try {
      const res = await bulkImport({ products: parsedProducts }).unwrap()
      toast.success(res?.message || `Successfully imported ${parsedProducts.length} products`)
      handleReset()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to import products")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) handleReset(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Upload className="w-5 h-5 text-primary" />
            Import Products (CSV)
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Bulk upload products to your catalog using a spreadsheet file.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Download sample template banner */}
          <div className="flex items-center justify-between p-3 bg-muted/40 border rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold">Need the format template?</p>
                <p className="text-[11px] text-muted-foreground">
                  Download our pre-formatted sample CSV with all required headers.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSampleCSVTemplate}
              className="text-xs h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Sample CSV
            </Button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 transition-colors rounded-xl p-6 text-center cursor-pointer bg-muted/10 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-background rounded-full shadow-sm ring-1 ring-border group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                {fileName ? fileName : "Click to select or drag & drop CSV file"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supports .csv files up to 500 products at once.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 text-xs rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview of Parsed Products */}
          {parsedProducts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">
                    {parsedProducts.length} Products Ready to Import
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Valid CSV
                </Badge>
              </div>

              <div className="border rounded-lg overflow-x-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="py-2 px-3 text-left">Name</th>
                      <th className="py-2 px-3 text-left">Price</th>
                      <th className="py-2 px-3 text-left">Stock</th>
                      <th className="py-2 px-3 text-left">Category</th>
                      <th className="py-2 px-3 text-left">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.slice(0, 5).map((p, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-1.5 px-3 font-medium truncate max-w-[180px]">{p.name}</td>
                        <td className="py-1.5 px-3">₹{p.sellingPrice}</td>
                        <td className="py-1.5 px-3">{p.stock}</td>
                        <td className="py-1.5 px-3">{p.categoryName || "—"}</td>
                        <td className="py-1.5 px-3">{p.brandName || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedProducts.length > 5 && (
                <p className="text-[11px] text-muted-foreground text-center">
                  Showing first 5 of {parsedProducts.length} items.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImportSubmit}
            disabled={parsedProducts.length === 0 || isLoading}
          >
            {isLoading ? "Importing..." : `Import ${parsedProducts.length > 0 ? `(${parsedProducts.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
