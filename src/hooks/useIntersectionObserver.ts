import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    enabled?: boolean;
}

export const useIntersectionObserver = ({
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    enabled = true,
}: UseIntersectionObserverProps = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold,
                root,
                rootMargin,
            }
        );

        const element = ref.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, root, rootMargin, enabled]);

    return { ref, isIntersecting };
};
