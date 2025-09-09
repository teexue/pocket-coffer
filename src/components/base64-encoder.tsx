"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Copy,
  Download,
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface Base64EncoderProps {
  onClose?: () => void;
}

type EncodingType = "text" | "file";

export function Base64Encoder({ onClose }: Base64EncoderProps) {
  const [encodingType, setEncodingType] = useState<EncodingType>("text");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 显示消息
  const showMessage = useCallback(
    (message: string, type: "success" | "error") => {
      if (type === "success") {
        setSuccess(message);
        setError("");
      } else {
        setError(message);
        setSuccess("");
      }
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    },
    []
  );

  // 文本编码
  const encodeText = useCallback((text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error("文本编码失败");
    }
  }, []);

  // 文本解码
  const decodeText = useCallback((base64: string): string => {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error("Base64解码失败，请检查输入格式");
    }
  }, []);

  // 文件编码
  const encodeFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1]; // 移除 data:type;base64, 前缀
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsDataURL(file);
    });
  }, []);

  // 文件解码
  const decodeFile = useCallback(
    (base64: string, mimeType: string = "application/octet-stream"): Blob => {
      try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      } catch (error) {
        throw new Error("Base64解码失败");
      }
    },
    []
  );

  // 执行编码
  const handleEncode = useCallback(async () => {
    if (!inputText.trim()) {
      showMessage("请输入要编码的内容", "error");
      return;
    }

    setIsEncoding(true);
    setError("");
    setSuccess("");

    try {
      const encoded = encodeText(inputText);
      setOutputText(encoded);
      showMessage("编码成功", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "编码失败", "error");
    } finally {
      setIsEncoding(false);
    }
  }, [inputText, encodeText, showMessage]);

  // 执行解码
  const handleDecode = useCallback(async () => {
    if (!inputText.trim()) {
      showMessage("请输入要解码的Base64内容", "error");
      return;
    }

    setIsDecoding(true);
    setError("");
    setSuccess("");

    try {
      const decoded = decodeText(inputText);
      setOutputText(decoded);
      showMessage("解码成功", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "解码失败", "error");
    } finally {
      setIsDecoding(false);
    }
  }, [inputText, decodeText, showMessage]);

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setFileSize(file.size);
      setIsEncoding(true);
      setError("");
      setSuccess("");

      try {
        const base64 = await encodeFile(file);
        setInputText(base64);
        setOutputText(`data:${file.type};base64,${base64}`);
        showMessage("文件编码成功", "success");
      } catch (error) {
        showMessage(
          error instanceof Error ? error.message : "文件编码失败",
          "error"
        );
      } finally {
        setIsEncoding(false);
      }
    },
    [encodeFile, showMessage]
  );

  // 下载解码后的文件
  const downloadFile = useCallback(() => {
    if (!outputText || !fileName) return;

    try {
      const base64 = outputText.includes(",")
        ? outputText.split(",")[1]
        : outputText;
      const blob = decodeFile(base64);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      showMessage("文件下载成功", "success");
    } catch (error) {
      showMessage("文件下载失败", "error");
    }
  }, [outputText, fileName, decodeFile, showMessage]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showMessage("已复制到剪贴板", "success");
      } catch (error) {
        showMessage("复制失败", "error");
      }
    },
    [showMessage]
  );

  // 清空内容
  const clearContent = useCallback(() => {
    setInputText("");
    setOutputText("");
    setFileName("");
    setFileSize(0);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 交换输入输出
  const swapContent = useCallback(() => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  }, [inputText, outputText]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Base64编码器
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearContent}>
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                关闭
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* 消息提示 */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Tabs
          value={encodingType}
          onValueChange={(value) => setEncodingType(value as EncodingType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文本编码</TabsTrigger>
            <TabsTrigger value="file">文件编码</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 输入区域 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">输入文本</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入要编码或解码的文本..."
                    className="w-full h-32 p-3 border rounded resize-none font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEncode}
                      disabled={isEncoding || !inputText.trim()}
                      className="flex-1"
                    >
                      {isEncoding ? "编码中..." : "编码"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDecode}
                      disabled={isDecoding || !inputText.trim()}
                      className="flex-1"
                    >
                      {isDecoding ? "解码中..." : "解码"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 输出区域 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">输出结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    placeholder="编码或解码结果将显示在这里..."
                    className="w-full h-32 p-3 border rounded resize-none font-mono text-sm bg-muted"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(outputText)}
                      disabled={!outputText}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      onClick={swapContent}
                      disabled={!inputText || !outputText}
                      className="flex-1"
                    >
                      交换
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 文件上传区域 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">文件上传</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      点击选择文件或拖拽文件到此处
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      选择文件
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {fileName && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{fileName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        大小: {(fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 文件结果区域 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Base64结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    placeholder="文件编码结果将显示在这里..."
                    className="w-full h-32 p-3 border rounded resize-none font-mono text-sm bg-muted"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(outputText)}
                      disabled={!outputText}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadFile}
                      disabled={!outputText || !fileName}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>文本编码：</strong>
                将普通文本转换为Base64格式，常用于数据传输和存储。
              </p>
              <p>
                <strong>文本解码：</strong>将Base64格式的文本转换回原始文本。
              </p>
              <p>
                <strong>文件编码：</strong>
                将文件转换为Base64格式，常用于图片、文档等文件的在线传输。
              </p>
              <p>
                <strong>文件解码：</strong>
                将Base64格式的文件数据转换回原始文件并下载。
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </div>
  );
}
