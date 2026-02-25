"use client";
import React, { useState, useEffect } from 'react';
import { Link2, LayoutGrid, Award, Package } from 'lucide-react';
import { server } from '@/redux/constants';

interface Option {
    id: string;
    name: string;
    slug?: string;
}

interface RedirectLinkBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

type RedirectType = 'custom' | 'category' | 'brand' | 'product';

const RedirectLinkBuilder: React.FC<RedirectLinkBuilderProps> = ({ value, onChange }) => {
    const [type, setType] = useState<RedirectType>('custom');
    const [customUrl, setCustomUrl] = useState('');
    const [selectedId, setSelectedId] = useState('');

    const [categories, setCategories] = useState<Option[]>([]);
    const [brands, setBrands] = useState<Option[]>([]);
    const [products, setProducts] = useState<Option[]>([]); // simplified list for now, ideally search
    const [loading, setLoading] = useState(false);

    // Parse initial value to set state
    useEffect(() => {
        if (!value) {
            setType('custom');
            return;
        }

        if (value.startsWith('/category/')) {
            setType('category');
            const slug = value.replace('/category/', '');
            setSelectedId(slug);
        } else if (value.startsWith('/brand/')) {
            setType('brand');
            const slug = value.replace('/brand/', '');
            setSelectedId(slug);
        } else if (value.startsWith('/product/')) {
            setType('product');
            const id = value.replace('/product/', '');
            setSelectedId(id);
        } else {
            setType('custom');
            setCustomUrl(value);
        }
    }, []); // Run once on mount

    // Fetch options
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === 'category' && categories.length === 0) {
                    const response = await fetch(`${server}/categories`);
                    const data = await response.json();
                    setCategories(data.data.map((c: any) => ({ id: c.slug, name: c.name, slug: c.slug })));
                } else if (type === 'brand' && brands.length === 0) {
                    const response = await fetch(`${server}/brands`);
                    const data = await response.json();
                    setBrands(data.data.map((b: any) => ({ id: b.slug || b.name.toLowerCase(), name: b.name, slug: b.slug })));
                } else if (type === 'product' && products.length === 0) {
                    const response = await fetch(`${server}/admin/product/details`, { credentials: 'include' });
                    const data = await response.json();
                    setProducts(data.data.products.map((p: any) => ({ id: p._id, name: p.name })));
                }
            } catch (err) {
                console.error("Failed to fetch options", err);
            } finally {
                setLoading(false);
            }
        };

        if (type !== 'custom') {
            fetchData();
        }
    }, [type]);

    const handleTypeChange = (newType: RedirectType) => {
        setType(newType);
        setSelectedId('');
        setCustomUrl('');
        onChange('');
    };

    const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = e.target.value;
        setSelectedId(newVal);

        if (type === 'category') {
            onChange(`/category/${newVal}`);
        } else if (type === 'brand') {
            onChange(`/brand/${newVal}`);
        } else if (type === 'product') {
            onChange(`/product/${newVal}`);
        }
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomUrl(e.target.value);
        onChange(e.target.value);
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'category': return <LayoutGrid size={16} />;
            case 'brand': return <Award size={16} />;
            case 'product': return <Package size={16} />;
            default: return <Link2 size={16} />;
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
                <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">
                        {getTypeIcon()}
                    </div>
                    <select
                        value={type}
                        onChange={(e) => handleTypeChange(e.target.value as RedirectType)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-200"
                    >
                        <option value="custom">Custom URL</option>
                        <option value="category">Category</option>
                        <option value="brand">Brand</option>
                        <option value="product">Product</option>
                    </select>
                </div>

                <div className="w-full">
                    {type === 'custom' ? (
                        <input
                            type="text"
                            placeholder="https://... or /page"
                            value={customUrl}
                            onChange={handleCustomChange}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
                        />
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedId}
                                onChange={handleSelectionChange}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-200 disabled:opacity-50"
                            >
                                <option value="">{loading ? 'Loading options...' : `Select ${type}...`}</option>
                                {(type === 'category' ? categories : type === 'brand' ? brands : products).map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Preview current full value for transparency */}
            {value && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span className="font-semibold uppercase tracking-wider">Target:</span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">{value}</span>
                </div>
            )}
        </div>
    );
};

export default RedirectLinkBuilder;
