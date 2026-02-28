'use client';

import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Timer as TimerIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';

type TimerMode = 'countdown' | 'stopwatch';

interface TimePreset {
  label: string;
  minutes: number;
}

const timePresets: TimePreset[] = [
  { label: '1分钟', minutes: 1 },
  { label: '5分钟', minutes: 5 },
  { label: '10分钟', minutes: 10 },
  { label: '15分钟', minutes: 15 },
  { label: '25分钟', minutes: 25 },
  { label: '30分钟', minutes: 30 },
  { label: '45分钟', minutes: 45 },
  { label: '60分钟', minutes: 60 },
];

export function Timer() {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 倒计时剩余时间（秒），默认5分钟
  const [elapsedTime, setElapsedTime] = useState(0); // 秒表已用时间（秒）
  const [customMinutes, setCustomMinutes] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const minutes = await invoke<string | null>('get_setting', { key: 'timer_custom_minutes' });
        const sound = await invoke<string | null>('get_setting', { key: 'timer_sound_enabled' });

        if (minutes) {
          setCustomMinutes(parseInt(minutes, 10));
        }
        if (sound !== null) {
          setSoundEnabled(sound === 'true');
        }
      } catch (error) {
        console.error('加载计时器设置失败:', error);
      }
    };
    loadSettings();
  }, []);

  // 保存自定义时间设置
  const handleCustomMinutesChange = async (value: number) => {
    setCustomMinutes(value);
    try {
      await invoke('set_setting', { key: 'timer_custom_minutes', value: value.toString() });
    } catch (error) {
      console.error('保存计时器设置失败:', error);
    }
  };

  // 保存声音设置
  const handleSoundToggle = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      await invoke('set_setting', { key: 'timer_sound_enabled', value: newValue.toString() });
    } catch (error) {
      console.error('保存计时器设置失败:', error);
    }
  };
  const [isInitialized, setIsInitialized] = useState(false); // 跟踪是否已初始化
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放提醒声音
  const playAlert = () => {
    if (soundEnabled) {
      // 创建简单的提示音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // 开始/暂停计时器
  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      if (mode === 'countdown') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playAlert();
            pauseTimer();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    pauseTimer();
    if (mode === 'countdown') {
      setTimeLeft(customMinutes * 60);
      setIsInitialized(true);
    } else {
      setElapsedTime(0);
    }
  };

  const setPresetTime = (minutes: number) => {
    handleCustomMinutesChange(minutes);
    setIsInitialized(false); // 重新初始化，让useEffect更新timeLeft
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 当customMinutes变化时，自动更新倒计时时间（仅在未初始化或重置后）
  useEffect(() => {
    if (mode === 'countdown' && !isInitialized) {
      setTimeLeft(customMinutes * 60);
      setIsInitialized(true);
    }
  }, [customMinutes, mode, isInitialized]);

  // 计算进度百分比
  const getProgress = () => {
    if (mode === 'countdown') {
      const totalTime = customMinutes * 60;
      return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
    } else {
      // 秒表模式显示一个循环的进度
      return ((elapsedTime % 60) / 60) * 100;
    }
  };

  const currentTime = mode === 'countdown' ? timeLeft : elapsedTime;
  const progress = getProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">计时器</h2>
        <p className="text-muted-foreground">倒计时和秒表功能，帮助您管理时间</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 计时器控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TimerIcon className="w-5 h-5" />
              计时器控制
            </CardTitle>
            <CardDescription>选择模式并设置时间</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 模式选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">计时模式</label>
              <Select value={mode} onValueChange={(value: TimerMode) => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="countdown">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      倒计时
                    </div>
                  </SelectItem>
                  <SelectItem value="stopwatch">
                    <div className="flex items-center gap-2">
                      <TimerIcon className="w-4 h-4" />
                      秒表
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 时间设置（仅倒计时模式） */}
            {mode === 'countdown' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">设置时间</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => handleCustomMinutesChange(Number(e.target.value))}
                    min="1"
                    max="999"
                    className="flex-1"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">分钟</span>
                </div>

                {/* 快速预设 */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">快速选择</label>
                  <div className="flex flex-wrap gap-1">
                    {timePresets.map((preset) => (
                      <Button
                        key={preset.minutes}
                        size="sm"
                        variant="outline"
                        onClick={() => setPresetTime(preset.minutes)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 控制按钮 */}
            <div className="flex gap-2">
              <Button size="sm" onClick={toggleTimer} className="flex-1">
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    开始
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={resetTimer}>
                <Square className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>

            {/* 声音控制 */}
            <div className="flex items-center justify-between">
              <span className="text-sm">声音提醒</span>
              <Button size="sm" variant="ghost" onClick={handleSoundToggle}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 时间显示 */}
        <Card>
          <CardHeader>
            <CardTitle>时间显示</CardTitle>
            <CardDescription>
              {mode === 'countdown' ? '倒计时剩余时间' : '已用时间'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 大时间显示 */}
            <div className="text-center">
              <div className="text-6xl font-mono font-bold mb-4">{formatTime(currentTime)}</div>

              {/* 进度条 */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{mode === 'countdown' ? '剩余' : '已用'}</span>
                  <span>
                    {mode === 'countdown'
                      ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                          .toString()
                          .padStart(2, '0')}`
                      : `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
                          .toString()
                          .padStart(2, '0')}`}
                  </span>
                </div>
              </div>
            </div>

            {/* 状态指示 */}
            <div className="flex justify-center">
              <Badge
                variant={isRunning ? 'default' : 'secondary'}
                className={isRunning ? 'bg-green-100 text-green-800' : ''}
              >
                {isRunning ? '运行中' : '已停止'}
              </Badge>
            </div>

            {/* 模式信息 */}
            <div className="text-center text-sm text-muted-foreground">
              {mode === 'countdown' ? (
                <p>倒计时模式：从 {customMinutes} 分钟开始倒计时</p>
              ) : (
                <p>秒表模式：记录经过的时间</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">倒计时模式</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 设置倒计时时间（1-999分钟）</li>
                <li>• 使用快速预设或自定义输入</li>
                <li>• 时间到达时会播放提醒音</li>
                <li>• 支持暂停和重置功能</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">秒表模式</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 记录经过的时间</li>
                <li>• 支持暂停和继续</li>
                <li>• 可以随时重置归零</li>
                <li>• 进度条显示秒数循环</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
