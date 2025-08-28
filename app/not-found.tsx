'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0d] text-white px-4">
      <h1 className="text-5xl font-bold mb-4">404 - Project Not Found</h1>
      <p className="text-lg text-gray-400 mb-6 text-center max-w-md">
        The project you are looking for does not exist or you might have followed a broken link.
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-6 cursor-pointer py-3 rounded-2xl bg-white text-black hover:bg-gray-200 transition-colors shadow-md"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
