"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Calendar,
  Clock,
  FileText,
  Image,
  Palette,
  Settings,
  Timer,
  Wrench,
  Zap,
} from "lucide-react";

const tools = [
  {
    id: "calculator",
    name: "计算器",
    icon: Calculator,
    description: "快速计算工具",
    category: "数学工具",
  },
  {
    id: "timer",
    name: "计时器",
    icon: Timer,
    description: "倒计时和秒表",
    category: "时间管理",
  },
  {
    id: "calendar",
    name: "日历",
    icon: Calendar,
    description: "日程管理",
    category: "时间管理",
  },
  {
    id: "clock",
    name: "时钟",
    icon: Clock,
    description: "多时区时钟",
    category: "时间管理",
  },
  {
    id: "text-editor",
    name: "文本编辑器",
    icon: FileText,
    description: "快速文本编辑",
    category: "文本工具",
  },
  {
    id: "image-editor",
    name: "图片编辑器",
    icon: Image,
    description: "简单图片处理",
    category: "图像工具",
  },
  {
    id: "color-picker",
    name: "颜色选择器",
    icon: Palette,
    description: "颜色拾取工具",
    category: "设计工具",
  },
  {
    id: "system-tools",
    name: "系统工具",
    icon: Wrench,
    description: "系统信息查看",
    category: "系统工具",
  },
];

const categories = [
  { id: "all", name: "全部工具", count: tools.length },
  {
    id: "数学工具",
    name: "数学工具",
    count: tools.filter((t) => t.category === "数学工具").length,
  },
  {
    id: "时间管理",
    name: "时间管理",
    count: tools.filter((t) => t.category === "时间管理").length,
  },
  {
    id: "文本工具",
    name: "文本工具",
    count: tools.filter((t) => t.category === "文本工具").length,
  },
  {
    id: "图像工具",
    name: "图像工具",
    count: tools.filter((t) => t.category === "图像工具").length,
  },
  {
    id: "设计工具",
    name: "设计工具",
    count: tools.filter((t) => t.category === "设计工具").length,
  },
  {
    id: "系统工具",
    name: "系统工具",
    count: tools.filter((t) => t.category === "系统工具").length,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div
      className={cn(
        "w-56 border-r bg-background h-screen overflow-y-auto",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-base font-semibold">方寸匣</h2>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            工具分类
          </h3>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-between"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.name}</span>
              <Badge variant="secondary" className="text-xs h-5">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            设置
          </h3>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            应用设置
          </Button>
        </div>
      </div>
    </div>
  );
}
