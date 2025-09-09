"use client";

import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { ToolGrid } from "../components/tool-grid";
import { ToolPage } from "../components/tool-page";

export default function Home() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const handleToolLaunch = (toolId: string) => {
    setCurrentTool(toolId);
  };

  const handleBackToHome = () => {
    setCurrentTool(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-6">
            {currentTool ? (
              <ToolPage toolId={currentTool} onBack={handleBackToHome} />
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">方寸匣</h1>
                  <p className="text-muted-foreground mt-2">
                    您的个人效率工具箱，让工作更高效
                  </p>
                </div>
                <ToolGrid onToolLaunch={handleToolLaunch} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
