"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Save,
  X,
} from "lucide-react";

interface CalendarProps {
  onClose?: () => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

type ViewMode = "month" | "week" | "day";

const colors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function Calendar({ onClose }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    color: colors[0],
  });

  // 获取月份名称
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { month: "long" });
  };

  // 获取星期名称
  const getWeekdayName = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { weekday: "short" });
  };

  // 获取月份的第一天
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // 获取月份的天数
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 获取月份开始前的空白天数
  const getDaysBeforeMonth = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    return firstDay.getDay();
  };

  // 生成日历网格
  const generateCalendarGrid = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const daysBefore = getDaysBeforeMonth(currentDate);
    const days = [];

    // 添加上个月的末尾几天
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      0
    );
    for (let i = daysBefore - 1; i >= 0; i--) {
      days.push({
        date: new Date(
          prevMonth.getFullYear(),
          prevMonth.getMonth(),
          prevMonth.getDate() - i
        ),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 添加当前月的所有天
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
      });
    }

    // 添加下个月的开头几天
    const remainingDays = 42 - days.length; // 6行 x 7天 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentDate]);

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 获取某天的事件
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (
        (eventStart <= date && eventEnd >= date) ||
        eventStart.toDateString() === date.toDateString()
      );
    });
  };

  // 创建新事件
  const createEvent = useCallback(() => {
    if (!formData.title || !formData.startDate) return;

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime || "00:00"}`
    );
    const endDateTime = new Date(
      `${formData.endDate || formData.startDate}T${formData.endTime || "23:59"}`
    );

    const newEvent: Event = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location,
      color: formData.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEvents((prev) => [...prev, newEvent]);
    setShowEventForm(false);
    resetForm();
  }, [formData]);

  // 更新事件
  const updateEvent = useCallback(() => {
    if (!selectedEvent || !formData.title || !formData.startDate) return;

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime || "00:00"}`
    );
    const endDateTime = new Date(
      `${formData.endDate || formData.startDate}T${formData.endTime || "23:59"}`
    );

    const updatedEvent: Event = {
      ...selectedEvent,
      title: formData.title,
      description: formData.description,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location,
      color: formData.color,
      updatedAt: new Date(),
    };

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEvent.id ? updatedEvent : event
      )
    );
    setSelectedEvent(null);
    setIsEditing(false);
    setShowEventForm(false);
    resetForm();
  }, [selectedEvent, formData]);

  // 删除事件
  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    setSelectedEvent(null);
    setIsEditing(false);
    setShowEventForm(false);
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      color: colors[0],
    });
  }, []);

  // 打开事件表单
  const openEventForm = useCallback(
    (date?: Date, event?: Event) => {
      if (event) {
        setSelectedEvent(event);
        setIsEditing(true);
        setFormData({
          title: event.title,
          description: event.description,
          startDate: event.startDate.toISOString().split("T")[0],
          startTime: event.startDate.toTimeString().slice(0, 5),
          endDate: event.endDate.toISOString().split("T")[0],
          endTime: event.endDate.toTimeString().slice(0, 5),
          location: event.location || "",
          color: event.color,
        });
      } else {
        setSelectedEvent(null);
        setIsEditing(false);
        const targetDate = date || currentDate;
        setFormData({
          title: "",
          description: "",
          startDate: targetDate.toISOString().split("T")[0],
          startTime: "",
          endDate: targetDate.toISOString().split("T")[0],
          endTime: "",
          location: "",
          color: colors[0],
        });
      }
      setShowEventForm(true);
    },
    [currentDate]
  );

  // 导航到上个月
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  // 导航到下个月
  const goToNextMonth = useCallback(() => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  // 导航到今天
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // 渲染月视图
  const renderMonthView = () => {
    const grid = generateCalendarGrid();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

    return (
      <div className="space-y-2">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            return (
              <div
                key={index}
                className={`min-h-24 p-1 border rounded cursor-pointer transition-colors ${
                  day.isCurrentMonth
                    ? "bg-background hover:bg-muted"
                    : "bg-muted/50 text-muted-foreground"
                } ${day.isToday ? "ring-2 ring-primary" : ""}`}
                onClick={() => openEventForm(day.date)}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate cursor-pointer"
                      style={{
                        backgroundColor: event.color + "20",
                        color: event.color,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventForm(day.date, event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div key={index} className="border rounded p-2">
                <div className="text-sm font-medium mb-2">
                  {getWeekdayName(date)} {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded cursor-pointer"
                      style={{
                        backgroundColor: event.color + "20",
                        color: event.color,
                      }}
                      onClick={() => openEventForm(date, event)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-2">
        <div className="text-lg font-medium mb-4">
          {currentDate.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
        <div className="space-y-1">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 border rounded cursor-pointer"
              style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
              onClick={() => openEventForm(currentDate, event)}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">
                {event.startDate.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {event.endDate.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {event.location && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            日历
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              今天
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-lg font-medium">
              {getMonthName(currentDate)} {currentDate.getFullYear()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="month">月</TabsTrigger>
                <TabsTrigger value="week">周</TabsTrigger>
                <TabsTrigger value="day">日</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={() => openEventForm()}>
              <Plus className="w-4 h-4 mr-1" />
              新建事件
            </Button>
          </div>
        </div>

        {/* 日历内容 */}
        <div className="flex-1">
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </div>

        {/* 事件表单 */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{isEditing ? "编辑事件" : "新建事件"}</CardTitle>
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
                    placeholder="事件标题"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">描述</label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="事件描述"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">开始日期</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">开始时间</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">结束日期</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">结束时间</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">地点</label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="事件地点"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">颜色</label>
                  <div className="flex gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${
                          formData.color === color
                            ? "border-foreground"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, color }))
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={isEditing ? updateEvent : createEvent}>
                    <Save className="w-4 h-4 mr-1" />
                    {isEditing ? "更新" : "创建"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEventForm(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                  {isEditing && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (selectedEvent) {
                          deleteEvent(selectedEvent.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </div>
  );
}
