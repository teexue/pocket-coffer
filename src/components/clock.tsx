"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Plus, Trash2, Globe, Settings } from "lucide-react";

interface Timezone {
  id: string;
  name: string;
  city: string;
  offset: number;
}

const commonTimezones: Timezone[] = [
  { id: "local", name: "本地时间", city: "本地", offset: 0 },
  { id: "utc", name: "UTC", city: "协调世界时", offset: 0 },
  { id: "beijing", name: "CST", city: "北京", offset: 8 },
  { id: "tokyo", name: "JST", city: "东京", offset: 9 },
  { id: "london", name: "GMT", city: "伦敦", offset: 0 },
  { id: "newyork", name: "EST", city: "纽约", offset: -5 },
  { id: "losangeles", name: "PST", city: "洛杉矶", offset: -8 },
  { id: "paris", name: "CET", city: "巴黎", offset: 1 },
  { id: "sydney", name: "AEST", city: "悉尼", offset: 10 },
  { id: "moscow", name: "MSK", city: "莫斯科", offset: 3 },
];

type ClockType = "digital" | "analog";

export function ClockTool() {
  const [selectedTimezones, setSelectedTimezones] = useState<Timezone[]>([
    commonTimezones[0], // 默认显示本地时间
  ]);
  const [clockType, setClockType] = useState<ClockType>("digital");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddTimezone, setShowAddTimezone] = useState(false);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const formatTime = (date: Date, offset: number) => {
    const utcTime = new Date(date.getTime() + offset * 60 * 60 * 1000);
    return utcTime.toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 格式化日期
  const formatDate = (date: Date, offset: number) => {
    const utcTime = new Date(date.getTime() + offset * 60 * 60 * 1000);
    return utcTime.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
    });
  };

  // 添加时区
  const addTimezone = (timezone: Timezone) => {
    if (!selectedTimezones.find((tz) => tz.id === timezone.id)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
    setShowAddTimezone(false);
  };

  // 移除时区
  const removeTimezone = (timezoneId: string) => {
    if (timezoneId !== "local") {
      // 不能移除本地时间
      setSelectedTimezones(
        selectedTimezones.filter((tz) => tz.id !== timezoneId)
      );
    }
  };

  // 绘制模拟时钟
  const drawAnalogClock = (canvas: HTMLCanvasElement, timezone: Timezone) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制外圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制刻度
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = centerX + Math.cos(angle) * (radius - 15);
      const y1 = centerY + Math.sin(angle) * (radius - 15);
      const x2 = centerX + Math.cos(angle) * (radius - 5);
      const y2 = centerY + Math.sin(angle) * (radius - 5);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 计算当前时间
    const utcTime = new Date(
      currentTime.getTime() + timezone.offset * 60 * 60 * 1000
    );
    const hours = utcTime.getHours() % 12;
    const minutes = utcTime.getMinutes();
    const seconds = utcTime.getSeconds();

    // 绘制时针
    const hourAngle = ((hours + minutes / 60) * 30 - 90) * (Math.PI / 180);
    const hourLength = radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(hourAngle) * hourLength,
      centerY + Math.sin(hourAngle) * hourLength
    );
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 绘制分针
    const minuteAngle = (minutes * 6 - 90) * (Math.PI / 180);
    const minuteLength = radius * 0.7;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(minuteAngle) * minuteLength,
      centerY + Math.sin(minuteAngle) * minuteLength
    );
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制秒针
    const secondAngle = (seconds * 6 - 90) * (Math.PI / 180);
    const secondLength = radius * 0.8;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(secondAngle) * secondLength,
      centerY + Math.sin(secondAngle) * secondLength
    );
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制中心点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#374151";
    ctx.fill();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">世界时钟</h2>
        <p className="text-muted-foreground">查看全球不同时区的时间</p>
      </div>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            时钟设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 时钟类型选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">显示类型：</label>
              <Select
                value={clockType}
                onValueChange={(value: ClockType) => setClockType(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">数字时钟</SelectItem>
                  <SelectItem value="analog">模拟时钟</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 添加时区 */}
            <Button
              size="sm"
              onClick={() => setShowAddTimezone(!showAddTimezone)}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加时区
            </Button>
          </div>

          {/* 时区选择 */}
          {showAddTimezone && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Select
                  onValueChange={(value) => {
                    const timezone = commonTimezones.find(
                      (tz) => tz.id === value
                    );
                    if (timezone) {
                      addTimezone(timezone);
                    }
                  }}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="选择要添加的时区..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTimezones
                      .filter(
                        (tz) =>
                          !selectedTimezones.find(
                            (selected) => selected.id === tz.id
                          )
                      )
                      .map((timezone) => (
                        <SelectItem key={timezone.id} value={timezone.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <span className="font-medium">
                                {timezone.name}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                {timezone.city}
                              </span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              UTC{timezone.offset >= 0 ? "+" : ""}
                              {timezone.offset}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 时钟显示区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedTimezones.map((timezone) => (
          <Card key={timezone.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <CardTitle className="text-lg">{timezone.city}</CardTitle>
                </div>
                {timezone.id !== "local" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTimezone(timezone.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardDescription>
                {timezone.name} (UTC{timezone.offset >= 0 ? "+" : ""}
                {timezone.offset})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clockType === "digital" ? (
                <div className="text-center space-y-2">
                  <div className="text-3xl font-mono font-bold">
                    {formatTime(currentTime, timezone.offset)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(currentTime, timezone.offset)}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <canvas
                    ref={(canvas) => {
                      if (canvas) {
                        drawAnalogClock(canvas, timezone);
                      }
                    }}
                    width={200}
                    height={200}
                    className="border rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">数字时钟</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 显示精确到秒的时间</li>
                <li>• 包含日期和星期信息</li>
                <li>• 清晰易读的数字显示</li>
                <li>• 支持多时区同时显示</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">模拟时钟</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 传统时钟外观</li>
                <li>• 实时指针动画</li>
                <li>• 直观的时间显示</li>
                <li>• 红色秒针突出显示</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
