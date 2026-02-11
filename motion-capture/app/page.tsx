"use client";
import dynamic from "next/dynamic";

const MotionCanvas = dynamic(() => import("../components/MotionCanvas"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
      Laddar AI-modell & Kamera...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <MotionCanvas />
    </main>
  );
}