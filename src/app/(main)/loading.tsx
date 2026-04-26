import { HomeSkeleton } from "@/components/home/HomeSkeleton";

/**
 * loading.tsx — Next.js Suspense boundary for the (main) route group.
 * Shown instantly while server components in layout fetch data.
 */
export default function MainLoading() {
    return <HomeSkeleton />;
}
