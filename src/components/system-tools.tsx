'use client';

import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Battery,
  Activity,
  RefreshCw,
  Trash2,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
} from 'lucide-react';

interface SystemToolsProps {
  onClose?: () => void;
}

interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  cookieEnabled: boolean;
  onlineStatus: boolean;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  performance: {
    loadTime: number;
    connectionType: string;
    effectiveType: string;
  };
  // 真实系统信息（来自后端）
  osName?: string;
  osVersion?: string;
  kernelVersion?: string;
  hostname?: string;
  cpuName?: string;
  cpuCores?: number;
  totalMemory?: number;
  usedMemory?: number;
  totalDisk?: number;
  usedDisk?: number;
}

interface ProcessInfo {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'stopped' | 'error';
}

export function SystemTools({ onClose }: SystemToolsProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState<{
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  }>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
  });

  // 获取系统信息
  const getSystemInfo = useCallback((): SystemInfo => {
    const nav = navigator;
    const screen = window.screen;

    // 获取内存信息（如果支持）
    const memory = (nav as any).deviceMemory
      ? {
          used: Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || 0,
          total: Math.round((performance as any).memory?.totalJSHeapSize / 1024 / 1024) || 0,
          limit: Math.round((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024) || 0,
        }
      : {
          used: 0,
          total: 0,
          limit: 0,
        };

    // 获取网络连接信息
    const connection =
      (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection;
    const connectionType = connection?.type || 'unknown';
    const effectiveType = connection?.effectiveType || 'unknown';

    return {
      platform: nav.platform,
      userAgent: nav.userAgent,
      language: nav.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      cookieEnabled: nav.cookieEnabled,
      onlineStatus: nav.onLine,
      memory,
      performance: {
        loadTime: Math.round(performance.now()),
        connectionType,
        effectiveType,
      },
    };
  }, []);

  // 从后端获取真实系统信息
  const fetchRealSystemInfo = useCallback(async () => {
    try {
      const realInfo = await invoke<{
        os_name: string;
        os_version: string;
        kernel_version: string;
        hostname: string;
        cpu_name: string;
        cpu_cores: number;
        total_memory: number;
        used_memory: number;
        total_disk: number;
        used_disk: number;
      }>('get_system_info');

      setSystemInfo((prev) =>
        prev
          ? {
              ...prev,
              osName: realInfo.os_name,
              osVersion: realInfo.os_version,
              kernelVersion: realInfo.kernel_version,
              hostname: realInfo.hostname,
              cpuName: realInfo.cpu_name,
              cpuCores: realInfo.cpu_cores,
              totalMemory: realInfo.total_memory,
              usedMemory: realInfo.used_memory,
              totalDisk: realInfo.total_disk,
              usedDisk: realInfo.used_disk,
            }
          : null
      );
    } catch (error) {
      console.error('获取真实系统信息失败:', error);
    }
  }, []);

  // 模拟进程信息
  const generateProcesses = useCallback((): ProcessInfo[] => {
    const processNames = [
      'System',
      'Explorer',
      'Chrome',
      'Firefox',
      'VSCode',
      'Node.js',
      'Python',
      'Docker',
      'Git',
      'npm',
    ];

    return processNames.map((name, index) => ({
      id: `process-${index}`,
      name,
      cpu: Math.random() * 100,
      memory: Math.random() * 1000,
      status: Math.random() > 0.1 ? 'running' : 'stopped',
    }));
  }, []);

  // 模拟系统健康状态
  const generateSystemHealth = useCallback(() => {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
    };
  }, []);

  // 刷新系统信息
  const refreshSystemInfo = useCallback(async () => {
    setIsRefreshing(true);

    // 模拟刷新延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const info = getSystemInfo();
    const processList = generateProcesses();
    const health = generateSystemHealth();

    setSystemInfo(info);
    setProcesses(processList);
    setSystemHealth(health);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, [getSystemInfo, generateProcesses, generateSystemHealth]);

  // 清理系统缓存
  const clearSystemCache = useCallback(() => {
    // 模拟清理操作
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // 清理localStorage中的临时数据
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('temp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // 清理sessionStorage
    sessionStorage.clear();

    // 刷新信息
    refreshSystemInfo();
  }, [refreshSystemInfo]);

  // 优化系统性能
  const optimizeSystem = useCallback(() => {
    // 模拟优化操作
    const optimizedProcesses = processes.map((process) => ({
      ...process,
      cpu: Math.max(0, process.cpu - Math.random() * 20),
      memory: Math.max(0, process.memory - Math.random() * 100),
    }));

    setProcesses(optimizedProcesses);

    // 更新系统健康状态
    const newHealth = {
      cpu: Math.max(0, systemHealth.cpu - Math.random() * 30),
      memory: Math.max(0, systemHealth.memory - Math.random() * 25),
      disk: Math.max(0, systemHealth.disk - Math.random() * 20),
      network: systemHealth.network,
    };

    setSystemHealth(newHealth);
  }, [processes, systemHealth]);

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取健康状态颜色
  const getHealthColor = (value: number) => {
    if (value < 30) return 'text-green-600';
    if (value < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 初始化
  useEffect(() => {
    refreshSystemInfo();
    fetchRealSystemInfo();

    // 设置自动刷新
    const interval = setInterval(() => {
      refreshSystemInfo();
      fetchRealSystemInfo();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSystemInfo, fetchRealSystemInfo]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            系统工具
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshSystemInfo} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新
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
        {/* 系统健康状态 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.cpu)}`}>
                {systemHealth.cpu.toFixed(1)}%
              </div>
              <Progress value={systemHealth.cpu} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="w-4 h-4" />
                <span className="text-sm font-medium">内存</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.memory)}`}>
                {systemHealth.memory.toFixed(1)}%
              </div>
              <Progress value={systemHealth.memory} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">磁盘</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.disk)}`}>
                {systemHealth.disk.toFixed(1)}%
              </div>
              <Progress value={systemHealth.disk} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">网络</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.network)}`}>
                {systemHealth.network.toFixed(1)}%
              </div>
              <Progress value={systemHealth.network} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">系统信息</TabsTrigger>
            <TabsTrigger value="processes">进程管理</TabsTrigger>
            <TabsTrigger value="performance">性能监控</TabsTrigger>
            <TabsTrigger value="tools">系统工具</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">系统信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">平台</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{systemInfo.platform}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">语言</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{systemInfo.language}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">时区</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{systemInfo.timezone}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">屏幕分辨率</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{systemInfo.screenResolution}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4" />
                        <span className="font-medium">在线状态</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {systemInfo.onlineStatus ? '在线' : '离线'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="w-4 h-4" />
                        <span className="font-medium">内存使用</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {systemInfo.memory.used}MB / {systemInfo.memory.total}MB
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">进程管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processes.map((process) => (
                    <div
                      key={process.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(process.status)}
                        <div>
                          <p className="font-medium">{process.name}</p>
                          <p className="text-sm text-muted-foreground">
                            CPU: {process.cpu.toFixed(1)}% | 内存: {process.memory.toFixed(1)}MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          停止
                        </Button>
                        <Button variant="outline" size="sm">
                          重启
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">性能指标</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">页面加载时间</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.performance.loadTime}ms
                      </span>
                    </div>
                    <Progress value={Math.min(100, (systemInfo?.performance.loadTime || 0) / 10)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">连接类型</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.performance.connectionType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">有效连接类型</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.performance.effectiveType}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">资源使用</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">JavaScript 堆内存</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.memory.used}MB
                      </span>
                    </div>
                    <Progress
                      value={
                        ((systemInfo?.memory.used || 0) / (systemInfo?.memory.limit || 1)) * 100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">总堆内存</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.memory.total}MB
                      </span>
                    </div>
                    <Progress
                      value={
                        ((systemInfo?.memory.total || 0) / (systemInfo?.memory.limit || 1)) * 100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">内存限制</span>
                      <span className="text-sm text-muted-foreground">
                        {systemInfo?.memory.limit}MB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">系统清理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      清理浏览器缓存、临时文件和存储数据
                    </p>
                    <Button onClick={clearSystemCache} className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      清理系统缓存
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">性能优化</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">优化系统性能，减少资源占用</p>
                    <Button onClick={optimizeSystem} className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      优化系统性能
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">系统状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">最后更新</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
