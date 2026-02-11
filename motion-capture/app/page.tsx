"use client"; 
import dynamic from 'next/dynamic';

const MotionCanvas = dynamic(() => import('../components/MotionCanvas'), {
  ssr: false,
  loading: () => <p className="text-center p-10">Laddar AI-modell & Kamera...</p>
});

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">FaceMesh med Next.js</h1>
        <MotionCanvas />
      </div>
    </main>
  );
}