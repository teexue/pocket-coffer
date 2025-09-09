"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  Search,
} from "lucide-react";

interface PasswordManagerProps {
  onClose?: () => void;
}

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export function PasswordManager({ onClose }: PasswordManagerProps) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    website: "",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);

  // 密码生成配置
  const [generatorConfig, setGeneratorConfig] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });

  // 生成密码
  const generatePassword = useCallback(() => {
    setIsGenerating(true);

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const similar = "il1Lo0O";
    const ambiguous = "{}[]()/\\'\"`~,;.<>";

    let charset = "";
    if (generatorConfig.includeUppercase) charset += uppercase;
    if (generatorConfig.includeLowercase) charset += lowercase;
    if (generatorConfig.includeNumbers) charset += numbers;
    if (generatorConfig.includeSymbols) charset += symbols;
    if (generatorConfig.excludeSimilar) {
      charset = charset
        .split("")
        .filter((char) => !similar.includes(char))
        .join("");
    }
    if (generatorConfig.excludeAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !ambiguous.includes(char))
        .join("");
    }

    let password = "";
    for (let i = 0; i < generatorConfig.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(password);
    setFormData((prev) => ({ ...prev, password }));
    setIsGenerating(false);
  }, [generatorConfig]);

  // 评估密码强度
  const evaluatePasswordStrength = useCallback(
    (password: string): PasswordStrength => {
      let score = 0;
      const feedback: string[] = [];

      if (password.length < 8) {
        feedback.push("密码长度至少8位");
      } else if (password.length >= 12) {
        score += 1;
      }

      if (/[a-z]/.test(password)) {
        score += 1;
      } else {
        feedback.push("包含小写字母");
      }

      if (/[A-Z]/.test(password)) {
        score += 1;
      } else {
        feedback.push("包含大写字母");
      }

      if (/[0-9]/.test(password)) {
        score += 1;
      } else {
        feedback.push("包含数字");
      }

      if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
      } else {
        feedback.push("包含特殊字符");
      }

      if (password.length >= 16) {
        score += 1;
      }

      let color = "text-red-600";
      if (score >= 4) color = "text-green-600";
      else if (score >= 3) color = "text-yellow-600";

      return { score, feedback, color };
    },
    []
  );

  // 添加密码
  const addPassword = useCallback(() => {
    if (!formData.title || !formData.password) return;

    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      title: formData.title,
      username: formData.username,
      password: formData.password,
      website: formData.website,
      notes: formData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPasswords((prev) => [newEntry, ...prev]);
    setFormData({
      title: "",
      username: "",
      password: "",
      website: "",
      notes: "",
    });
    setShowForm(false);
  }, [formData]);

  // 删除密码
  const deletePassword = useCallback((id: string) => {
    setPasswords((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("复制失败:", err);
    }
  }, []);

  // 切换密码显示
  const togglePasswordVisibility = useCallback((id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // 过滤密码
  const filteredPasswords = passwords.filter(
    (password) =>
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.website.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取密码强度
  const getPasswordStrength = (password: string) => {
    return evaluatePasswordStrength(password);
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            密码管理器
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加密码
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
        <Tabs defaultValue="passwords" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="passwords">密码库</TabsTrigger>
            <TabsTrigger value="generator">密码生成器</TabsTrigger>
            <TabsTrigger value="strength">强度检测</TabsTrigger>
          </TabsList>

          <TabsContent value="passwords" className="space-y-4">
            {/* 搜索栏 */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索密码..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 密码列表 */}
            <div className="space-y-2">
              {filteredPasswords.map((password) => {
                const strength = getPasswordStrength(password.password);
                return (
                  <Card key={password.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{password.title}</h3>
                            <div className={`text-xs ${strength.color}`}>
                              {strength.score >= 4
                                ? "强"
                                : strength.score >= 3
                                ? "中"
                                : "弱"}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {password.username && (
                              <div>用户名: {password.username}</div>
                            )}
                            {password.website && (
                              <div>网站: {password.website}</div>
                            )}
                            {password.notes && (
                              <div>备注: {password.notes}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              togglePasswordVisibility(password.id)
                            }
                          >
                            {showPasswords[password.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(password.password)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePassword(password.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">
                            {showPasswords[password.id]
                              ? password.password
                              : "••••••••"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredPasswords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "未找到匹配的密码"
                    : "暂无密码，点击添加密码开始使用"}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">密码生成器</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">密码长度</label>
                    <Input
                      type="number"
                      min="4"
                      max="128"
                      value={generatorConfig.length}
                      onChange={(e) =>
                        setGeneratorConfig((prev) => ({
                          ...prev,
                          length: parseInt(e.target.value) || 16,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">包含字符类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.includeUppercase}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            includeUppercase: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">大写字母 (A-Z)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.includeLowercase}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            includeLowercase: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">小写字母 (a-z)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.includeNumbers}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            includeNumbers: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">数字 (0-9)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.includeSymbols}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            includeSymbols: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">特殊字符</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">排除字符</label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.excludeSimilar}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            excludeSimilar: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">排除相似字符 (il1Lo0O)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatorConfig.excludeAmbiguous}
                        onChange={(e) =>
                          setGeneratorConfig((prev) => ({
                            ...prev,
                            excludeAmbiguous: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm">
                        排除歧义字符
                        (&#123;&#125;&#91;&#93;&#40;&#41;&#47;&#39;&#34;&#96;&#126;&#44;&#59;&#46;&#60;&#62;&#41;
                      </span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={generatePassword}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isGenerating ? "animate-spin" : ""
                    }`}
                  />
                  生成密码
                </Button>

                {generatedPassword && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">生成的密码</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={generatedPassword}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generatedPassword)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      强度:{" "}
                      {getPasswordStrength(generatedPassword).score >= 4
                        ? "强"
                        : getPasswordStrength(generatedPassword).score >= 3
                        ? "中"
                        : "弱"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">密码强度检测</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">输入密码</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入要检测的密码"
                  />
                </div>

                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">强度评估</span>
                    </div>
                    {(() => {
                      const strength = getPasswordStrength(newPassword);
                      return (
                        <div className="space-y-2">
                          <div
                            className={`text-lg font-bold ${strength.color}`}
                          >
                            {strength.score >= 4
                              ? "强"
                              : strength.score >= 3
                              ? "中等"
                              : "弱"}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                strength.score >= 4
                                  ? "bg-green-500"
                                  : strength.score >= 3
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${(strength.score / 5) * 100}%`,
                              }}
                            />
                          </div>
                          {strength.feedback.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                建议改进:
                              </div>
                              {strength.feedback.map((item, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 添加密码表单 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>添加密码</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">标题</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="密码标题"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">用户名</label>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="用户名或邮箱"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="密码"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">网站</label>
                  <Input
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="网站地址"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">备注</label>
                  <Input
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="备注信息"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addPassword} className="flex-1">
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </div>
  );
}
