"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface ImageEditorProps {
  onClose?: () => void;
}

interface ImageState {
  src: string;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
}

const initialImageState: ImageState = {
  src: "",
  width: 0,
  height: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: false,
  sepia: false,
  invert: false,
};

export function ImageEditor({ onClose }: ImageEditorProps) {
  const [imageState, setImageState] = useState<ImageState>(initialImageState);
  const [history, setHistory] = useState<ImageState[]>([initialImageState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 保存历史状态
  const saveToHistory = useCallback(
    (newState: ImageState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setImageState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setImageState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // 处理文件上传
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const newState: ImageState = {
              ...initialImageState,
              src: e.target?.result as string,
              width: img.width,
              height: img.height,
            };
            setImageState(newState);
            saveToHistory(newState);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    [saveToHistory]
  );

  // 应用滤镜到画布
  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageState.width;
    canvas.height = imageState.height;

    // 应用变换
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scaleX, imageState.scaleY);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // 应用滤镜
    const filters = [];
    if (imageState.brightness !== 100) {
      filters.push(`brightness(${imageState.brightness}%)`);
    }
    if (imageState.contrast !== 100) {
      filters.push(`contrast(${imageState.contrast}%)`);
    }
    if (imageState.saturation !== 100) {
      filters.push(`saturate(${imageState.saturation}%)`);
    }
    if (imageState.hue !== 0) {
      filters.push(`hue-rotate(${imageState.hue}deg)`);
    }
    if (imageState.blur > 0) {
      filters.push(`blur(${imageState.blur}px)`);
    }
    if (imageState.grayscale) {
      filters.push("grayscale(100%)");
    }
    if (imageState.sepia) {
      filters.push("sepia(100%)");
    }
    if (imageState.invert) {
      filters.push("invert(100%)");
    }

    ctx.filter = filters.join(" ");
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }, [imageState]);

  // 更新图片状态
  const updateImageState = useCallback(
    (updates: Partial<ImageState>) => {
      const newState = { ...imageState, ...updates };
      setImageState(newState);
      saveToHistory(newState);
    },
    [imageState, saveToHistory]
  );

  // 旋转图片
  const rotateImage = useCallback(
    (angle: number) => {
      updateImageState({ rotation: imageState.rotation + angle });
    },
    [imageState.rotation, updateImageState]
  );

  // 翻转图片
  const flipImage = useCallback(
    (axis: "horizontal" | "vertical") => {
      if (axis === "horizontal") {
        updateImageState({ scaleX: imageState.scaleX * -1 });
      } else {
        updateImageState({ scaleY: imageState.scaleY * -1 });
      }
    },
    [imageState.scaleX, imageState.scaleY, updateImageState]
  );

  // 重置图片
  const resetImage = useCallback(() => {
    if (imageState.src) {
      const resetState: ImageState = {
        ...initialImageState,
        src: imageState.src,
        width: imageState.width,
        height: imageState.height,
      };
      setImageState(resetState);
      saveToHistory(resetState);
    }
  }, [imageState.src, imageState.width, imageState.height, saveToHistory]);

  // 下载图片
  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // 当图片状态改变时重新绘制
  useEffect(() => {
    if (imageState.src) {
      applyFilters();
    }
  }, [imageState, applyFilters]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            图片编辑器
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* 工具栏 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            上传图片
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-1" />
            撤销
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4 mr-1" />
            重做
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetImage}
            disabled={!imageState.src}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            disabled={!imageState.src}
          >
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {imageState.src ? (
          <div className="flex-1 flex gap-4">
            {/* 编辑面板 */}
            <div className="w-80 space-y-4">
              <Tabs defaultValue="transform" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transform">变换</TabsTrigger>
                  <TabsTrigger value="filters">滤镜</TabsTrigger>
                  <TabsTrigger value="adjust">调整</TabsTrigger>
                </TabsList>

                <TabsContent value="transform" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">旋转</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateImage(-90)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateImage(90)}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">翻转</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => flipImage("horizontal")}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => flipImage("vertical")}
                      >
                        <FlipVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">缩放</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm px-2 py-1 bg-muted rounded">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(Math.min(5, zoom + 0.1))}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">效果滤镜</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={imageState.grayscale ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateImageState({ grayscale: !imageState.grayscale })
                        }
                      >
                        灰度
                      </Button>
                      <Button
                        variant={imageState.sepia ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateImageState({ sepia: !imageState.sepia })
                        }
                      >
                        复古
                      </Button>
                      <Button
                        variant={imageState.invert ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateImageState({ invert: !imageState.invert })
                        }
                      >
                        反色
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">模糊</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={imageState.blur}
                        onChange={(e) =>
                          updateImageState({ blur: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        {imageState.blur}px
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="adjust" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">亮度</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageState.brightness}
                        onChange={(e) =>
                          updateImageState({
                            brightness: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        {imageState.brightness}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">对比度</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageState.contrast}
                        onChange={(e) =>
                          updateImageState({ contrast: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        {imageState.contrast}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">饱和度</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageState.saturation}
                        onChange={(e) =>
                          updateImageState({
                            saturation: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        {imageState.saturation}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">色相</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={imageState.hue}
                        onChange={(e) =>
                          updateImageState({ hue: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground">
                        {imageState.hue}°
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 画布区域 */}
            <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
              <div
                className="relative"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center",
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full border border-border rounded"
                />
                <img
                  ref={imageRef}
                  src={imageState.src}
                  alt="编辑中的图片"
                  className="hidden"
                  onLoad={applyFilters}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">上传图片开始编辑</h3>
                <p className="text-muted-foreground">
                  支持 JPG、PNG、GIF 等格式
                </p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                选择图片
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
