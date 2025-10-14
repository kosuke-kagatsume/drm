'use client';

export default function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-lg mb-2">📊</div>
        <div className="text-sm">チャートを読み込み中...</div>
      </div>
    </div>
  );
}
