import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-lark-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🌍</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">正在分析全球政策数据库...</h3>
      <div className="flex flex-col items-center space-y-1 text-gray-500 text-sm">
        <p className="animate-pulse">连接 Google Search 验证最新法条...</p>
        <p className="animate-pulse delay-75">比对当地文化与主流实践...</p>
        <p className="animate-pulse delay-150">生成中国企业合规建议...</p>
      </div>
    </div>
  );
};