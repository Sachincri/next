"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Separator } from "@/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card"
import { Package, Tag, Layers, Info, DollarSign, Palette, Check, X } from "lucide-react"
import { Product } from "@/types"

interface ProductDetailModalProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
    if (!product) return null

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
        if (stock < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
        return { label: "In Stock", color: "bg-green-100 text-green-800" }
    }

    const stockStatus = getStockStatus(product.stock)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        Product Details
                        {product.isActive ? (
                            <Badge className="bg-green-100 text-green-800 ml-2">Active</Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-800 ml-2">Inactive</Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header / Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50 mb-4">
                                <img
                                    src={product.images?.[0]?.url || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {product.images?.slice(1).map((img: any, i: number) => (
                                    <div key={i} className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                        <img src={img.url} alt={`Preview ${i}`} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold">{product.name}</h2>
                                <p className="text-sm text-muted-foreground font-mono mt-1">ID: {product._id}</p>
                            </div>

                            <Card>
                                <CardContent className="p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                                        <p className="text-xl font-bold">₹{product.sellingPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">MRP</p>
                                        <p className="text-lg text-muted-foreground line-through">
                                            ₹{product.maximumRetailPrice}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Stock</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{product.stock}</span>
                                            <Badge className={`${stockStatus.color} text-[10px]`}>{stockStatus.label}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold">{product.ratings?.average?.toFixed(1) || "N/A"}</span>
                                            <span className="text-muted-foreground text-xs">({product.ratings?.count || 0} reviews)</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium flex items-center gap-2"><Layers className="w-4 h-4" /> Category</span>
                                    <span>{(product.category as any)?.name || product.category || "N/A"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> Brand</span>
                                    <span>{(product.brand as any)?.name || product.brand || "N/A"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium flex items-center gap-2"><Info className="w-4 h-4" /> Warranty</span>
                                    <span>{product.warranty || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div
                            className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border text-gray-700"
                            dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Specifications */}
                        <Card className="border-none shadow-sm bg-gray-50/50">
                            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Specifications</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {product.specifications?.map((spec: any, i: number) => {
                                    const s = typeof spec === 'string' ? JSON.parse(spec) : spec;
                                    return (
                                        <div key={i} className="border bg-white rounded-lg p-3 space-y-2">
                                            <p className="font-bold text-sm text-primary">{s.title}</p>
                                            <ul className="space-y-1.5">
                                                {s.items?.map((item: any, j: number) => (
                                                    <li key={j} className="text-xs flex justify-between border-b border-gray-50 last:border-0 pb-1">
                                                        <span className="text-muted-foreground">{item.key}:</span>
                                                        <span className="font-medium text-right ml-4">{item.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                                {(!product.specifications || product.specifications.length === 0) && (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">No specifications provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {/* Offers */}
                            <Card className="border-none shadow-sm bg-blue-50/30">
                                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-blue-700"><Tag className="w-4 h-4" /> Available Offers</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {product.offers?.map((offer: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 bg-white p-2 rounded border border-blue-100 text-sm">
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-0.5 shrink-0 text-[9px] h-4">Offer</Badge>
                                                <span className="text-gray-700 leading-tight text-xs">{offer}</span>
                                            </div>
                                        ))}
                                        {(!product.offers || product.offers.length === 0) && <p className="text-xs text-muted-foreground italic">No special offers available.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sizes & Colors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="border-none shadow-sm bg-gray-50/50">
                                    <CardHeader className="pb-2"><CardTitle className="text-base">Sizes</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes?.map((size: string, i: number) => (
                                                <Badge key={i} variant="outline" className="bg-white">{size}</Badge>
                                            ))}
                                            {(!product.sizes || product.sizes.length === 0) && <p className="text-xs text-muted-foreground italic">N/A</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-gray-50/50">
                                    <CardHeader className="pb-2"><CardTitle className="text-base">Colors</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {product.colors?.map((c: any, i: number) => {
                                                const color = typeof c === 'string' ? JSON.parse(c) : c;
                                                return (
                                                    <div key={i} className="flex items-center gap-1.5 bg-white border rounded px-2 py-1 shadow-sm">
                                                        {color.image && <img src={color.image} alt={color.name} className="w-4 h-4 rounded-full object-contain" />}
                                                        <span className="text-[10px] font-medium">{color.name}</span>
                                                    </div>
                                                )
                                            })}
                                            {(!product.colors || product.colors.length === 0) && <p className="text-xs text-muted-foreground italic">N/A</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Highlights */}
                            <Card className="border-none shadow-sm bg-violet-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-violet-700">
                                        <Check className="w-4 h-4" /> Key Highlights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {product.highlights?.map((h: string, i: number) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <div className="mt-1.5 w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                                                <span className="text-gray-700">{h}</span>
                                            </li>
                                        ))}
                                        {(!product.highlights || product.highlights.length === 0) && <p className="text-xs text-muted-foreground italic">No highlights listed.</p>}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* SEO Metadata */}
                            <Card className="border-none shadow-sm bg-gray-50/50">
                                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" /> SEO Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Title</p>
                                        <p className="text-xs font-medium">{product.seo?.title || "Default Title"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Description</p>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{product.seo?.description || "Default description used."}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Keywords</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(product?.seo?.keywords)
                                                ? product.seo.keywords
                                                : product?.seo?.keywords?.split(',').map(k => k.trim()) || []
                                            ).map((k: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-[9px] h-4 px-1.5 bg-violet-100 text-violet-700">{k}</Badge>
                                            ))}
                                            {(!product?.seo?.keywords || (Array.isArray(product.seo.keywords) && product.seo.keywords.length === 0)) && <p className="text-[10px] text-muted-foreground italic">No keywords</p>}
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
