"use client";
import React, { useState, useEffect } from 'react';
import { Link2, LayoutGrid, Award, Package, X } from 'lucide-react';
import { server } from '@/redux/constants';

interface Option {
    id: string;
    name: string;
    slug?: string;
    image?: string;
}

interface RedirectLinkBuilderProps {
    value: string;
    onChange: (value: string) => void;
    onSelectDetailed?: (data: Option) => void;
}

type RedirectType = 'custom' | 'category' | 'brand' | 'product';

const RedirectLinkBuilder: React.FC<RedirectLinkBuilderProps> = ({ value, onChange, onSelectDetailed }) => {
    const [type, setType] = useState<RedirectType>('custom');
    const [customUrl, setCustomUrl] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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

        if (value.includes('/product?category=')) {
            setType('category');
            const id = value.split('category=')[1]?.split('&')[0];
            setSelectedId(id);
        } else if (value.includes('/product?brand=')) {
            setType('brand');
            const id = value.split('brand=')[1]?.split('&')[0];
            setSelectedId(id);
        } else if (value.startsWith('/product/')) {
            setType('product');
            const id = value.replace('/product/', '');
            setSelectedId(id);
        } else if (value.startsWith('/category/')) {
            setType('category');
            const slug = value.replace('/category/', '');
            setSelectedId(slug);
        } else if (value.startsWith('/brand/')) {
            setType('brand');
            const slug = value.replace('/brand/', '');
            setSelectedId(slug);
        } else {
            setType('custom');
            setCustomUrl(value);
        }
    }, [value]); // Link changes when value externally syncs

    // Fetch options
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === 'category' && categories.length === 0) {
                    const response = await fetch(`${server}/categories`);
                    const data = await response.json();
                    setCategories(data.data.map((c: any) => ({ 
                        id: c._id, 
                        name: `${c.name}${c.parent ? ` (Sub of ${typeof c.parent === 'object' ? c.parent.name : 'Parent'})` : ''}`, 
                        slug: c.slug,
                        image: c.image?.url
                    })));
                } else if (type === 'brand' && brands.length === 0) {
                    const response = await fetch(`${server}/brands`);
                    const data = await response.json();
                    setBrands(data.data.map((b: any) => ({ id: b._id, name: b.name, slug: b.slug })));
                } else if (type === 'product' && products.length === 0) {
                    const response = await fetch(`${server}/admin/product/details`, { credentials: 'include' });
                    const data = await response.json();
                    setProducts(data.data.products.map((p: any) => ({ id: p._id, name: p.name, image: p.images[0]?.url })));
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
    }, [type, categories.length, brands.length, products.length]);

    const handleTypeChange = (newType: RedirectType) => {
        setType(newType);
        setSelectedId('');
        setCustomUrl('');
        setSearchTerm('');
        onChange('');
    };

    const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = e.target.value;
        setSelectedId(newVal);

        if (!newVal) {
            onChange('');
            return;
        }

        const selectedOption = (type === 'category' ? categories : type === 'brand' ? brands : products).find(opt => opt.id === newVal);
        if (selectedOption && onSelectDetailed) {
            onSelectDetailed(selectedOption);
        }

        if (type === 'category') {
            onChange(`/product?category=${newVal}`);
        } else if (type === 'brand') {
            onChange(`/product?brand=${newVal}`);
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

    const filteredOptions = (type === 'category' ? categories : type === 'brand' ? brands : products).filter(
        opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                <div className="w-full space-y-3">
                    {type === 'custom' ? (
                        <input
                            type="text"
                            placeholder="https://... or /page"
                            value={customUrl}
                            onChange={handleCustomChange}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
                        />
                    ) : (
                        <div className="space-y-2">
                             {!loading && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={`Search ${type}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-400 transition-all"
                                    />
                                    {searchTerm && (
                                        <button 
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <select
                                    value={selectedId}
                                    onChange={handleSelectionChange}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-200 disabled:opacity-50"
                                >
                                    <option value="">{loading ? 'Loading options...' : searchTerm && filteredOptions.length === 0 ? 'No matches found' : `Select ${type}...`}</option>
                                    {filteredOptions.map((opt) => (
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
                        </div>
                    )}
                </div>
            </div>
            {/* Preview current full value for transparency */}
            {value && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 px-1">
                    <span className="font-bold uppercase tracking-wider text-slate-400">Target Path:</span>
                    <span className="font-mono bg-blue-50/50 dark:bg-blue-900/10 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 truncate max-w-xs" title={value}>{value}</span>
                </div>
            )}
        </div>
    );
};


export default RedirectLinkBuilder;
