"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Palette, RotateCcw, History } from "lucide-react";

interface ColorHistory {
  id: string;
  color: string;
  timestamp: Date;
}

export function ColorPicker() {
  const [currentColor, setCurrentColor] = useState("#3b82f6");
  const [tempColor, setTempColor] = useState("#3b82f6");
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // 颜色格式转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getColorFormats = (color: string) => {
    const rgb = hexToRgb(color);
    if (!rgb) {
      return {
        hex: "#000000",
        rgb: "rgb(0, 0, 0)",
        rgba: "rgba(0, 0, 0, 1)",
        hsl: "hsl(0, 0%, 0%)",
        hsla: "hsla(0, 0%, 0%, 1)",
        css: "#000000",
        number: "0x000000",
      };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
      hex: color.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
      css: color,
      number: `0x${color.slice(1)}`,
    };
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const addToHistory = (color: string) => {
    const newEntry: ColorHistory = {
      id: Date.now().toString(),
      color,
      timestamp: new Date(),
    };
    setColorHistory((prev) => [newEntry, ...prev.slice(0, 9)]); // 保留最近10个
  };

  const handleTempColorChange = (color: string) => {
    setTempColor(color);
  };

  const confirmColor = () => {
    setCurrentColor(tempColor);
    addToHistory(tempColor);
  };

  const cancelColorChange = () => {
    setTempColor(currentColor);
  };

  const clearHistory = () => {
    setColorHistory([]);
  };

  const colorFormats = getColorFormats(tempColor);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">颜色选择器</h2>
        <p className="text-muted-foreground">选择颜色并获取多种格式的代码</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 颜色选择区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              颜色选择
            </CardTitle>
            <CardDescription>使用颜色选择器或输入颜色值</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={tempColor}
                onChange={(e) => handleTempColorChange(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
              />
              <div className="flex-1">
                <Input
                  type="text"
                  value={tempColor}
                  onChange={(e) => handleTempColorChange(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>

            {/* 颜色预览 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">颜色预览</label>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-20 rounded-lg border-2 border-border"
                  style={{ backgroundColor: tempColor }}
                />
                <div
                  className="flex-1 h-20 rounded-lg border-2 border-border"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>临时颜色</span>
                <span>当前颜色</span>
              </div>
            </div>

            {/* 确认/取消按钮 */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={confirmColor}
                disabled={tempColor === currentColor}
              >
                确认选择
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelColorChange}
                disabled={tempColor === currentColor}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 颜色格式 */}
        <Card>
          <CardHeader>
            <CardTitle>颜色格式</CardTitle>
            <CardDescription>点击复制对应的颜色代码</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hex" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hex">HEX</TabsTrigger>
                <TabsTrigger value="rgb">RGB</TabsTrigger>
                <TabsTrigger value="hsl">HSL</TabsTrigger>
              </TabsList>

              <TabsContent value="hex" className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.hex}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.hex, "hex")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.number}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(colorFormats.number, "number")
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rgb" className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.rgb}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.rgb, "rgb")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.rgba}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.rgba, "rgba")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="hsl" className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.hsl}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.hsl, "hsl")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={colorFormats.hsla}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.hsla, "hsla")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {copiedFormat && (
              <div className="mt-2">
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  已复制 {copiedFormat.toUpperCase()} 格式
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 颜色历史 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <CardTitle>颜色历史</CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={clearHistory}>
              <RotateCcw className="w-4 h-4 mr-2" />
              清空历史
            </Button>
          </div>
          <CardDescription>最近选择的颜色</CardDescription>
        </CardHeader>
        <CardContent>
          {colorHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              暂无颜色历史
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {colorHistory.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => setTempColor(item.color)}
                >
                  <div
                    className="w-full h-16 rounded-lg border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs font-mono mt-1 text-center">
                    {item.color.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
