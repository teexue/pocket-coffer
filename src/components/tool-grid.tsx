"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Calendar,
  Clock,
  FileText,
  Image,
  Palette,
  Timer,
  Wrench,
  Play,
  Lock,
  QrCode,
  Ruler,
  Code,
} from "lucide-react";

const tools = [
  {
    id: "calculator",
    name: "计算器",
    icon: Calculator,
    description: "快速计算工具，支持基本运算和科学计算",
    category: "数学工具",
    status: "available",
  },
  {
    id: "timer",
    name: "计时器",
    icon: Timer,
    description: "倒计时和秒表功能，帮助您管理时间",
    category: "时间管理",
    status: "available",
  },
  {
    id: "calendar",
    name: "日历",
    icon: Calendar,
    description: "个人日程管理，支持事件提醒",
    category: "时间管理",
    status: "available",
  },
  {
    id: "clock",
    name: "时钟",
    icon: Clock,
    description: "多时区时钟显示，世界时间查看",
    category: "时间管理",
    status: "available",
  },
  {
    id: "text-editor",
    name: "文本编辑器",
    icon: FileText,
    description: "快速文本编辑，支持Markdown格式",
    category: "文本工具",
    status: "available",
  },
  {
    id: "image-editor",
    name: "图片编辑器",
    icon: Image,
    description: "简单图片处理，裁剪、调整大小",
    category: "图像工具",
    status: "available",
  },
  {
    id: "color-picker",
    name: "颜色选择器",
    icon: Palette,
    description: "颜色拾取工具，支持多种颜色格式",
    category: "设计工具",
    status: "available",
  },
  {
    id: "system-tools",
    name: "系统工具",
    icon: Wrench,
    description: "系统信息查看，性能监控",
    category: "系统工具",
    status: "available",
  },
  {
    id: "password-manager",
    name: "密码管理器",
    icon: Lock,
    description: "安全密码生成、存储和管理",
    category: "安全工具",
    status: "available",
  },
  {
    id: "qr-generator",
    name: "二维码生成器",
    icon: QrCode,
    description: "生成和扫描二维码，支持多种类型",
    category: "实用工具",
    status: "available",
  },
  {
    id: "unit-converter",
    name: "单位转换器",
    icon: Ruler,
    description: "长度、重量、温度、货币等单位转换",
    category: "数学工具",
    status: "available",
  },
  {
    id: "base64-encoder",
    name: "Base64编码器",
    icon: Code,
    description: "文本和文件的Base64编码解码",
    category: "开发工具",
    status: "available",
  },
  {
    id: "json-formatter",
    name: "JSON格式化工具",
    icon: Code,
    description: "JSON格式化、验证、压缩和美化",
    category: "开发工具",
    status: "available",
  },
];

interface ToolGridProps {
  onToolLaunch: (toolId: string) => void;
}

export function ToolGrid({ onToolLaunch }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTools =
    selectedCategory === "all"
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            可用
          </Badge>
        );
      case "coming-soon":
        return <Badge variant="secondary">即将推出</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          全部工具
        </Button>
        {Array.from(new Set(tools.map((t) => t.category))).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                  <Button
                    size="sm"
                    disabled={tool.status === "coming-soon"}
                    onClick={() =>
                      tool.status === "available" && onToolLaunch(tool.id)
                    }
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {tool.status === "available" ? "启动" : "敬请期待"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">该分类下暂无工具</p>
        </div>
      )}
    </div>
  );
}
