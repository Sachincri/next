/**
 * loading.tsx — Next.js Suspense boundary for the (main) route group.
 * Shown instantly while server components in layout fetch data.
 */
export default function MainLoading() {
    return (
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 animate-pulse">
            {/* Navbar skeleton */}
            <div className="h-16 bg-white dark:bg-slate-900 shadow-sm" />

            {/* Category bar skeleton */}
            <div className="h-24 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 mt-0">
                <div className="container mx-auto px-4 flex items-center gap-6 h-full">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="w-12 h-2 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero / carousel skeleton */}
            <div className="mx-2 mt-2">
                <div className="w-full h-56 md:h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Product grid skeleton */}
            <div className="container mx-auto px-4 mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-slate-200 dark:bg-slate-800 h-56" />
                ))}
            </div>
        </div>
    );
}
