'use client';

import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Search() {
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  const searchSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/product?keyword=${encodeURIComponent(keyword)}&page=1`)
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={searchSubmitHandler} className="relative">
        <input
          type="text"
          placeholder="Search for Kurta Sets, Summer Dresses..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full h-10 pl-4 pr-12 text-sm border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-10 px-3 text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
