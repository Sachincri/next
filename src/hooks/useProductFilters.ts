import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export const useProductFilters = () => {
    const searchParams = useSearchParams()

    return useMemo(() => {
        return {
            keyword: searchParams.get('keyword') || '',
            page: Number(searchParams.get('page')) || 1,
            category: searchParams.get('category') || '',
            brand: searchParams.get('brand') || '',
            ratings: Number(searchParams.get('ratings')) || 0,
            discount: Number(searchParams.get('discount')) || 0,
            price: [
                searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
                searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 10000000,
            ] as number[],
        }
    }, [searchParams])
}
