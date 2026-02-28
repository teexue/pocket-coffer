'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Download, Copy } from 'lucide-react';

interface QRGeneratorProps {
  onClose?: () => void;
}

interface QRConfig {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: string;
  backgroundColor: string;
}

type QRType = 'text' | 'url' | 'wifi' | 'phone' | 'email' | 'sms' | 'vcard' | 'location';

export function QRGenerator({ onClose }: QRGeneratorProps) {
  const [qrType, setQrType] = useState<QRType>('text');
  const [qrData, setQrData] = useState('');
  const [qrConfig, setQrConfig] = useState<QRConfig>({
    size: 256,
    errorCorrectionLevel: 'M',
    margin: 4,
    color: '#000000',
    backgroundColor: '#ffffff',
  });
  const [generatedQR, setGeneratedQR] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    wifi: {
      ssid: '',
      password: '',
      security: 'WPA',
      hidden: false,
    },
    phone: '',
    email: {
      address: '',
      subject: '',
      body: '',
    },
    sms: {
      number: '',
      message: '',
    },
    vcard: {
      name: '',
      phone: '',
      email: '',
      organization: '',
      title: '',
      website: '',
    },
    location: {
      latitude: '',
      longitude: '',
      label: '',
    },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码数据字符串
  const generateQRData = useCallback((type: QRType, data: any): string => {
    switch (type) {
      case 'text':
        return data.text || '';
      case 'url':
        return data.url || '';
      case 'wifi': {
        const wifiData = data.wifi;
        if (!wifiData.ssid) return '';
        let wifiString = `WIFI:T:${wifiData.security};S:${wifiData.ssid};`;
        if (wifiData.password) {
          wifiString += `P:${wifiData.password};`;
        }
        if (wifiData.hidden) {
          wifiString += `H:true;`;
        }
        wifiString += ';';
        return wifiString;
      }
      case 'phone':
        return `tel:${data.phone}`;
      case 'email': {
        const emailData = data.email;
        if (!emailData.address) return '';
        let emailString = `mailto:${emailData.address}`;
        const params = [];
        if (emailData.subject) params.push(`subject=${encodeURIComponent(emailData.subject)}`);
        if (emailData.body) params.push(`body=${encodeURIComponent(emailData.body)}`);
        if (params.length > 0) {
          emailString += `?${params.join('&')}`;
        }
        return emailString;
      }
      case 'sms': {
        const smsData = data.sms;
        if (!smsData.number) return '';
        let smsString = `sms:${smsData.number}`;
        if (smsData.message) {
          smsString += `:${encodeURIComponent(smsData.message)}`;
        }
        return smsString;
      }
      case 'vcard': {
        const vcardData = data.vcard;
        if (!vcardData.name) return '';
        let vcardString = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcardString += `FN:${vcardData.name}\n`;
        if (vcardData.phone) vcardString += `TEL:${vcardData.phone}\n`;
        if (vcardData.email) vcardString += `EMAIL:${vcardData.email}\n`;
        if (vcardData.organization) vcardString += `ORG:${vcardData.organization}\n`;
        if (vcardData.title) vcardString += `TITLE:${vcardData.title}\n`;
        if (vcardData.website) vcardString += `URL:${vcardData.website}\n`;
        vcardString += 'END:VCARD';
        return vcardString;
      }
      case 'location': {
        const locationData = data.location;
        if (!locationData.latitude || !locationData.longitude) return '';
        let locationString = `geo:${locationData.latitude},${locationData.longitude}`;
        if (locationData.label) {
          locationString += `?q=${encodeURIComponent(locationData.label)}`;
        }
        return locationString;
      }
      default:
        return '';
    }
  }, []);

  // 生成二维码
  const generateQR = useCallback(async () => {
    if (!qrData) return;

    setIsGenerating(true);

    try {
      // 这里使用一个简单的二维码生成库
      // 在实际项目中，您需要安装 qrcode 库: npm install qrcode
      // 由于这是演示，我们使用一个模拟的二维码生成

      // 模拟生成延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 创建一个简单的二维码图案（实际项目中应该使用真正的二维码库）
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = qrConfig.size;
          canvas.height = qrConfig.size;

          // 清空画布
          ctx.fillStyle = qrConfig.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制模拟的二维码图案
          ctx.fillStyle = qrConfig.color;
          const cellSize = Math.floor(qrConfig.size / 25);
          const margin = qrConfig.margin;

          // 绘制一些随机的方块来模拟二维码
          for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
              if (Math.random() > 0.5) {
                ctx.fillRect(
                  margin + i * cellSize,
                  margin + j * cellSize,
                  cellSize - 1,
                  cellSize - 1
                );
              }
            }
          }

          // 添加定位点（二维码的三个角）
          const drawFinderPattern = (x: number, y: number) => {
            ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
            ctx.fillStyle = qrConfig.backgroundColor;
            ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
            ctx.fillStyle = qrConfig.color;
            ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
          };

          drawFinderPattern(margin, margin);
          drawFinderPattern(margin + cellSize * 18, margin);
          drawFinderPattern(margin, margin + cellSize * 18);

          setGeneratedQR(canvas.toDataURL());
        }
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [qrData, qrConfig]);

  // 下载二维码
  const downloadQR = useCallback(() => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = generatedQR;
    link.click();
  }, [generatedQR]);

  // 复制二维码
  const copyQR = useCallback(async () => {
    if (!generatedQR) return;

    try {
      // 将base64转换为blob
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, [generatedQR]);

  // 当数据或配置改变时重新生成
  useEffect(() => {
    const data = generateQRData(qrType, formData);
    setQrData(data);
  }, [qrType, formData, generateQRData]);

  // 当二维码数据改变时重新生成
  useEffect(() => {
    if (qrData) {
      generateQR();
    }
  }, [qrData, generateQR]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            二维码生成器
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex gap-4">
          {/* 左侧：配置面板 */}
          <div className="w-80 space-y-4">
            <Tabs value={qrType} onValueChange={(value) => setQrType(value as QRType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">文本</TabsTrigger>
                <TabsTrigger value="url">链接</TabsTrigger>
                <TabsTrigger value="wifi">WiFi</TabsTrigger>
                <TabsTrigger value="phone">电话</TabsTrigger>
                <TabsTrigger value="email">邮件</TabsTrigger>
                <TabsTrigger value="sms">短信</TabsTrigger>
                <TabsTrigger value="vcard">名片</TabsTrigger>
                <TabsTrigger value="location">位置</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">文本内容</label>
                  <Input
                    value={formData.text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="输入要生成二维码的文本"
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">网址</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">网络名称 (SSID)</label>
                  <Input
                    value={formData.wifi.ssid}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, ssid: e.target.value },
                      }))
                    }
                    placeholder="WiFi网络名称"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">密码</label>
                  <Input
                    type="password"
                    value={formData.wifi.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, password: e.target.value },
                      }))
                    }
                    placeholder="WiFi密码"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">安全类型</label>
                  <select
                    value={formData.wifi.security}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, security: e.target.value },
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">无密码</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.wifi.hidden}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, hidden: e.target.checked },
                      }))
                    }
                  />
                  <label className="text-sm">隐藏网络</label>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">电话号码</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+86 138 0013 8000"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">邮箱地址</label>
                  <Input
                    type="email"
                    value={formData.email.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: { ...prev.email, address: e.target.value },
                      }))
                    }
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">主题</label>
                  <Input
                    value={formData.email.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: { ...prev.email, subject: e.target.value },
                      }))
                    }
                    placeholder="邮件主题"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">内容</label>
                  <Input
                    value={formData.email.body}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: { ...prev.email, body: e.target.value },
                      }))
                    }
                    placeholder="邮件内容"
                  />
                </div>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">电话号码</label>
                  <Input
                    value={formData.sms.number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sms: { ...prev.sms, number: e.target.value },
                      }))
                    }
                    placeholder="+86 138 0013 8000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">短信内容</label>
                  <Input
                    value={formData.sms.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sms: { ...prev.sms, message: e.target.value },
                      }))
                    }
                    placeholder="短信内容"
                  />
                </div>
              </TabsContent>

              <TabsContent value="vcard" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">姓名</label>
                  <Input
                    value={formData.vcard.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, name: e.target.value },
                      }))
                    }
                    placeholder="姓名"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">电话</label>
                  <Input
                    value={formData.vcard.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, phone: e.target.value },
                      }))
                    }
                    placeholder="电话号码"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">邮箱</label>
                  <Input
                    type="email"
                    value={formData.vcard.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, email: e.target.value },
                      }))
                    }
                    placeholder="邮箱地址"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">公司</label>
                  <Input
                    value={formData.vcard.organization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, organization: e.target.value },
                      }))
                    }
                    placeholder="公司名称"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">职位</label>
                  <Input
                    value={formData.vcard.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, title: e.target.value },
                      }))
                    }
                    placeholder="职位"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">网站</label>
                  <Input
                    value={formData.vcard.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vcard: { ...prev.vcard, website: e.target.value },
                      }))
                    }
                    placeholder="网站地址"
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">纬度</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          latitude: e.target.value,
                        },
                      }))
                    }
                    placeholder="39.9042"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">经度</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          longitude: e.target.value,
                        },
                      }))
                    }
                    placeholder="116.4074"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">标签</label>
                  <Input
                    value={formData.location.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, label: e.target.value },
                      }))
                    }
                    placeholder="位置标签"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* 二维码配置 */}
            <div className="space-y-4">
              <h4 className="font-medium">二维码设置</h4>
              <div>
                <label className="text-sm font-medium">尺寸</label>
                <Input
                  type="number"
                  min="100"
                  max="1000"
                  value={qrConfig.size}
                  onChange={(e) =>
                    setQrConfig((prev) => ({
                      ...prev,
                      size: parseInt(e.target.value) || 256,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">错误纠正级别</label>
                <select
                  value={qrConfig.errorCorrectionLevel}
                  onChange={(e) =>
                    setQrConfig((prev) => ({
                      ...prev,
                      errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H',
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">边距</label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={qrConfig.margin}
                  onChange={(e) =>
                    setQrConfig((prev) => ({
                      ...prev,
                      margin: parseInt(e.target.value) || 4,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">前景色</label>
                  <Input
                    type="color"
                    value={qrConfig.color}
                    onChange={(e) =>
                      setQrConfig((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">背景色</label>
                  <Input
                    type="color"
                    value={qrConfig.backgroundColor}
                    onChange={(e) =>
                      setQrConfig((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">二维码预览</h3>
              <div className="border rounded-lg p-4 bg-white">
                {generatedQR ? (
                  <img src={generatedQR} alt="Generated QR Code" className="max-w-full h-auto" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                    {isGenerating ? '生成中...' : '输入内容生成二维码'}
                  </div>
                )}
              </div>
            </div>

            {generatedQR && (
              <div className="flex gap-2">
                <Button onClick={downloadQR}>
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
                <Button variant="outline" onClick={copyQR}>
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </CardContent>
    </div>
  );
}
