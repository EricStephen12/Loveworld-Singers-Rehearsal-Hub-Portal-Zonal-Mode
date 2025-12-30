'use client';

import { Mic, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ScreenHeader from '@/components/ScreenHeader';

export default function VocalWarmupsPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <div className="h-full flex flex-col">
        <ScreenHeader 
          title="Vocal Warm-ups" 
          showMenuButton={false}
          leftButtons={
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          }
          rightImageSrc="/logo.png"
        />

        <div className="flex-1 flex items-center justify-center">
          <Mic className="w-16 h-16 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
