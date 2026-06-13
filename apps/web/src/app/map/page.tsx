"use client";
import dynamic from "next/dynamic";
import { Map } from "lucide-react";

const AsiaMap = dynamic(() => import("@/components/map/AsiaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
      <div className="text-muted-foreground text-sm flex items-center gap-2">
        <Map className="w-4 h-4 animate-pulse" />
        Loading map…
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-border/40 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-lg">Interactive Asia Map</h1>
          <p className="text-xs text-muted-foreground">
            Click any city marker to open its full dashboard.
          </p>
        </div>
        <div className="text-xs text-muted-foreground glass-card rounded-lg px-3 py-1.5">
          10 cities mapped
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 p-4">
        <AsiaMap />
      </div>
    </div>
  );
}
