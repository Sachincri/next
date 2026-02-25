/**
 * loading.tsx — Skeleton shown while the product detail page server component fetches data.
 * Next.js shows this instantly via Suspense while getProduct() and getSimilarProducts() run.
 */
export default function ProductLoading() {
    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen animate-pulse">
            <main className="w-full max-w-7xl md:mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                {/* Breadcrumb */}
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Gallery skeleton */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="w-full h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="flex gap-2 mt-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Info skeleton */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mt-4" />
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
                        </div>
                    </div>
                </div>

                {/* Tabs skeleton */}
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4 mb-6">
                        {['Description', 'Specifications', 'Reviews'].map((tab) => (
                            <div key={tab} className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                        ))}
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
