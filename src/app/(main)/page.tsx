import { Metadata } from 'next';
import Home from '@/components/home/Home';

export const metadata: Metadata = {
  title: 'Home | E-Commerce Store',
  description: 'Discover amazing products at unbeatable prices',
};


async function getHomeData() {
  try {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1'}/home`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // Transform match: response.setHomePageData || response.data
    return data?.setHomePageData || data?.data;
  } catch (error) {
    return null;
  }
}


export default async function HomePage() {
  const data = await getHomeData();
  return <Home initialData={data} />;
}
