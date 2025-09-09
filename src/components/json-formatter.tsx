"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Code,
  Copy,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Minimize2,
  Expand,
  Search,
} from "lucide-react";

interface JSONFormatterProps {
  onClose?: () => void;
}

interface JSONError {
  line: number;
  column: number;
  message: string;
}

export function JSONFormatter({ onClose }: JSONFormatterProps) {
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<JSONError | null>(null);
  const [success, setSuccess] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 显示消息
  const showMessage = useCallback(
    (message: string, type: "success" | "error") => {
      if (type === "success") {
        setSuccess(message);
        setError(null);
      } else {
        setError({ line: 0, column: 0, message });
        setSuccess("");
      }
      setTimeout(() => {
        setSuccess("");
        setError(null);
      }, 3000);
    },
    []
  );

  // 验证JSON格式
  const validateJSON = useCallback(
    (jsonString: string): { valid: boolean; error?: JSONError } => {
      try {
        JSON.parse(jsonString);
        return { valid: true };
      } catch (error) {
        if (error instanceof SyntaxError) {
          const match = error.message.match(/position (\d+)/);
          const position = match ? parseInt(match[1]) : 0;

          // 计算行号和列号
          const lines = jsonString.substring(0, position).split("\n");
          const line = lines.length;
          const column = lines[lines.length - 1].length + 1;

          return {
            valid: false,
            error: {
              line,
              column,
              message: error.message,
            },
          };
        }
        return {
          valid: false,
          error: {
            line: 0,
            column: 0,
            message: "未知错误",
          },
        };
      }
    },
    []
  );

  // 格式化JSON
  const formatJSON = useCallback(
    (jsonString: string, indent: number = 2): string => {
      try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, indent);
      } catch (error) {
        throw new Error("JSON格式化失败");
      }
    },
    []
  );

  // 压缩JSON
  const minifyJSON = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error("JSON压缩失败");
    }
  }, []);

  // 执行格式化
  const handleFormat = useCallback(async () => {
    if (!inputJson.trim()) {
      showMessage("请输入JSON内容", "error");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess("");

    try {
      const validation = validateJSON(inputJson);
      if (!validation.valid) {
        setError(validation.error!);
        setIsProcessing(false);
        return;
      }

      const formatted = formatJSON(inputJson, indentSize);
      setOutputJson(formatted);
      showMessage("格式化成功", "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "格式化失败",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [inputJson, indentSize, validateJSON, formatJSON, showMessage]);

  // 执行压缩
  const handleMinify = useCallback(async () => {
    if (!inputJson.trim()) {
      showMessage("请输入JSON内容", "error");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess("");

    try {
      const validation = validateJSON(inputJson);
      if (!validation.valid) {
        setError(validation.error!);
        setIsProcessing(false);
        return;
      }

      const minified = minifyJSON(inputJson);
      setOutputJson(minified);
      showMessage("压缩成功", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "压缩失败", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [inputJson, validateJSON, minifyJSON, showMessage]);

  // 验证JSON
  const handleValidate = useCallback(async () => {
    if (!inputJson.trim()) {
      showMessage("请输入JSON内容", "error");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess("");

    try {
      const validation = validateJSON(inputJson);
      if (validation.valid) {
        showMessage("JSON格式正确", "success");
      } else {
        setError(validation.error!);
      }
    } catch (error) {
      showMessage("验证失败", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [inputJson, validateJSON, showMessage]);

  // 搜索功能
  const handleSearch = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setCurrentSearchIndex(0);
        return;
      }

      const lines = outputJson.split("\n");
      const results: number[] = [];

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          results.push(index + 1);
        }
      });

      setSearchResults(results);
      setCurrentSearchIndex(0);
    },
    [outputJson]
  );

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

  // 下载JSON文件
  const downloadJSON = useCallback(
    (content: string, filename: string) => {
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      showMessage("文件下载成功", "success");
    },
    [showMessage]
  );

  // 清空内容
  const clearContent = useCallback(() => {
    setInputJson("");
    setOutputJson("");
    setError(null);
    setSuccess("");
    setSearchTerm("");
    setSearchResults([]);
    setCurrentSearchIndex(0);
  }, []);

  // 交换输入输出
  const swapContent = useCallback(() => {
    const temp = inputJson;
    setInputJson(outputJson);
    setOutputJson(temp);
  }, [inputJson, outputJson]);

  // 示例JSON
  const loadExample = useCallback(() => {
    const example = {
      name: "张三",
      age: 25,
      email: "zhangsan@example.com",
      address: {
        street: "北京市朝阳区",
        city: "北京",
        country: "中国",
      },
      hobbies: ["读书", "游泳", "编程"],
      isActive: true,
      score: 95.5,
    };
    setInputJson(JSON.stringify(example, null, 2));
  }, []);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            JSON格式化工具
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadExample}>
              示例
            </Button>
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
            <div>
              <div className="font-medium">JSON错误</div>
              <div className="text-sm">
                第 {error.line} 行，第 {error.column} 列
              </div>
              <div className="text-sm">{error.message}</div>
            </div>
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleFormat}
            disabled={isProcessing || !inputJson.trim()}
          >
            <Expand className="w-4 h-4 mr-1" />
            {isProcessing ? "处理中..." : "格式化"}
          </Button>
          <Button
            variant="outline"
            onClick={handleMinify}
            disabled={isProcessing || !inputJson.trim()}
          >
            <Minimize2 className="w-4 h-4 mr-1" />
            压缩
          </Button>
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isProcessing || !inputJson.trim()}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            验证
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center gap-2">
            <label className="text-sm">缩进:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value))}
              className="p-1 border rounded text-sm"
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={8}>8 空格</option>
              <option value={0}>制表符</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 输入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">输入JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                ref={textareaRef}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder="输入JSON内容..."
                className="w-full h-64 p-3 border rounded resize-none font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(inputJson)}
                  disabled={!inputJson}
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadJSON(inputJson, "input.json")}
                  disabled={!inputJson}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 输出区域 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">输出结果</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      className="pl-8 w-32 h-8 text-sm"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {currentSearchIndex + 1} / {searchResults.length}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={outputJson}
                onChange={(e) => setOutputJson(e.target.value)}
                placeholder="格式化结果将显示在这里..."
                className="w-full h-64 p-3 border rounded resize-none font-mono text-sm bg-muted"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(outputJson)}
                  disabled={!outputJson}
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadJSON(outputJson, "output.json")}
                  disabled={!outputJson}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
                <Button
                  variant="outline"
                  onClick={swapContent}
                  disabled={!inputJson || !outputJson}
                  size="sm"
                >
                  交换
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>格式化：</strong>
                将压缩的JSON格式化为易读的格式，支持自定义缩进。
              </p>
              <p>
                <strong>压缩：</strong>移除JSON中的空格和换行，减小文件大小。
              </p>
              <p>
                <strong>验证：</strong>
                检查JSON格式是否正确，显示错误位置和详细信息。
              </p>
              <p>
                <strong>搜索：</strong>在输出结果中搜索特定内容，支持高亮显示。
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </div>
  );
}
