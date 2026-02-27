"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Download,
  Upload,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Undo,
  Redo,
  Trash2,
  Eye,
  Edit,
  FileIcon,
} from "lucide-react";

interface TextEditorProps {
  onClose?: () => void;
}

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function TextEditor({ onClose }: TextEditorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从后端加载文档
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await invoke<Document[]>("get_all_documents");
        setDocuments(data);
      } catch (error) {
        console.error("加载文档失败:", error);
      }
    };
    loadDocuments();
  }, []);

  // 创建新文档
  const createNewDocument = useCallback(async () => {
    const now = new Date().toISOString();
    const newDoc: Document = {
      id: Date.now().toString(),
      title: "未命名文档",
      content: "",
      created_at: now,
      updated_at: now,
    };

    try {
      await invoke("add_document", { doc: newDoc });
      setDocuments((prev) => [newDoc, ...prev]);
    } catch (error) {
      console.error("创建文档失败:", error);
    }
    setCurrentDoc(newDoc);
    setTitle(newDoc.title);
    setContent(newDoc.content);
    setHistory([newDoc.content]);
    setHistoryIndex(0);
  }, []);

  // 保存文档
  const saveDocument = useCallback(async () => {
    if (!currentDoc) return;

    const now = new Date().toISOString();
    const updatedDoc: Document = {
      ...currentDoc,
      title: title || "未命名文档",
      content,
      updated_at: now,
    };

    try {
      await invoke("update_document", { doc: updatedDoc });
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === currentDoc.id ? updatedDoc : doc))
      );
      setCurrentDoc(updatedDoc);
    } catch (error) {
      console.error("保存文档失败:", error);
    }
  }, [currentDoc, title, content]);

  // 打开文档
  const openDocument = useCallback((doc: Document) => {
    setCurrentDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setHistory([doc.content]);
    setHistoryIndex(0);
  }, []);

  // 删除文档
  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        await invoke("delete_document", { id: docId });
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
        if (currentDoc?.id === docId) {
          setCurrentDoc(null);
          setTitle("");
          setContent("");
          setHistory([]);
          setHistoryIndex(-1);
        }
      } catch (error) {
        console.error("删除文档失败:", error);
      }
    },
    [currentDoc]
  );

  // 保存到历史记录
  const saveToHistory = useCallback(
    (newContent: string) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // 格式化文本
  const formatText = useCallback(
    (format: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      let newText = "";
      switch (format) {
        case "bold":
          newText = `**${selectedText}**`;
          break;
        case "italic":
          newText = `*${selectedText}*`;
          break;
        case "underline":
          newText = `<u>${selectedText}</u>`;
          break;
        case "code":
          newText = `\`${selectedText}\``;
          break;
        case "quote":
          newText = `> ${selectedText}`;
          break;
        case "link":
          newText = `[${selectedText}](url)`;
          break;
        case "ul":
          newText = `- ${selectedText}`;
          break;
        case "ol":
          newText = `1. ${selectedText}`;
          break;
        default:
          newText = selectedText;
      }

      const newContent =
        content.substring(0, start) + newText + content.substring(end);
      setContent(newContent);
      saveToHistory(newContent);

      // 恢复焦点和选择
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + newText.length);
      }, 0);
    },
    [content, saveToHistory]
  );

  // 处理文件上传
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          const now = new Date().toISOString();
          const newDoc: Document = {
            id: Date.now().toString(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            content,
            created_at: now,
            updated_at: now,
          };
          try {
            await invoke("add_document", { doc: newDoc });
            setDocuments((prev) => [newDoc, ...prev]);
            setCurrentDoc(newDoc);
            setTitle(newDoc.title);
            setContent(newDoc.content);
            setHistory([newDoc.content]);
            setHistoryIndex(0);
          } catch (error) {
            console.error("导入文档失败:", error);
          }
        };
        reader.readAsText(file);
      }
    },
    []
  );

  // 下载文档
  const downloadDocument = useCallback(() => {
    if (!currentDoc) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "未命名文档"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentDoc, content, title]);

  // 渲染Markdown预览
  const renderMarkdown = useCallback((text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.*$)/gm, "<li>$2</li>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
      )
      .replace(/\n/g, "<br>");
  }, []);

  // 内容变化时保存到历史
  useEffect(() => {
    if (content !== history[historyIndex]) {
      saveToHistory(content);
    }
  }, [content, history, historyIndex, saveToHistory]);

  // 初始化时创建新文档
  useEffect(() => {
    if (documents.length === 0) {
      createNewDocument();
    }
  }, [documents.length, createNewDocument]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            文本编辑器
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
          <Button variant="outline" size="sm" onClick={createNewDocument}>
            <FileIcon className="w-4 h-4 mr-1" />
            新建
          </Button>
          <Button variant="outline" size="sm" onClick={saveDocument}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            打开
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadDocument}
            disabled={!currentDoc}
          >
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
          <Separator orientation="vertical" className="h-8" />
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
          <Separator orientation="vertical" className="h-8" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText("bold")}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText("italic")}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText("code")}
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText("quote")}
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => formatText("ul")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => formatText("ol")}>
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText("link")}
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex-1 flex gap-4">
          {/* 文档列表 */}
          <div className="w-64 space-y-2">
            <h4 className="font-medium">文档列表</h4>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    currentDoc?.id === doc.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => openDocument(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs opacity-70">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 编辑区域 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文档标题"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden">
              {isPreview ? (
                <div
                  className="h-full p-4 overflow-y-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(content),
                  }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="开始输入您的文档内容..."
                  className="w-full h-full p-4 resize-none border-0 outline-none font-mono text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
