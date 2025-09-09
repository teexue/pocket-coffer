"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  ArrowUpDown,
  Ruler,
  Weight,
  Thermometer,
  Clock,
  DollarSign,
  Volume2,
  Zap,
  Globe,
} from "lucide-react";

interface UnitConverterProps {
  onClose?: () => void;
}

interface ConversionUnit {
  name: string;
  symbol: string;
  factor: number; // 相对于基础单位的转换因子
}

interface ConversionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  baseUnit: string;
  units: ConversionUnit[];
}

const conversionCategories: ConversionCategory[] = [
  {
    id: "length",
    name: "长度",
    icon: Ruler,
    baseUnit: "meter",
    units: [
      { name: "毫米", symbol: "mm", factor: 0.001 },
      { name: "厘米", symbol: "cm", factor: 0.01 },
      { name: "米", symbol: "m", factor: 1 },
      { name: "千米", symbol: "km", factor: 1000 },
      { name: "英寸", symbol: "in", factor: 0.0254 },
      { name: "英尺", symbol: "ft", factor: 0.3048 },
      { name: "码", symbol: "yd", factor: 0.9144 },
      { name: "英里", symbol: "mi", factor: 1609.344 },
    ],
  },
  {
    id: "weight",
    name: "重量",
    icon: Weight,
    baseUnit: "gram",
    units: [
      { name: "毫克", symbol: "mg", factor: 0.001 },
      { name: "克", symbol: "g", factor: 1 },
      { name: "千克", symbol: "kg", factor: 1000 },
      { name: "吨", symbol: "t", factor: 1000000 },
      { name: "盎司", symbol: "oz", factor: 28.3495 },
      { name: "磅", symbol: "lb", factor: 453.592 },
      { name: "英石", symbol: "st", factor: 6350.29 },
    ],
  },
  {
    id: "temperature",
    name: "温度",
    icon: Thermometer,
    baseUnit: "celsius",
    units: [
      { name: "摄氏度", symbol: "°C", factor: 1 },
      { name: "华氏度", symbol: "°F", factor: 1 },
      { name: "开尔文", symbol: "K", factor: 1 },
    ],
  },
  {
    id: "time",
    name: "时间",
    icon: Clock,
    baseUnit: "second",
    units: [
      { name: "毫秒", symbol: "ms", factor: 0.001 },
      { name: "秒", symbol: "s", factor: 1 },
      { name: "分钟", symbol: "min", factor: 60 },
      { name: "小时", symbol: "h", factor: 3600 },
      { name: "天", symbol: "d", factor: 86400 },
      { name: "周", symbol: "w", factor: 604800 },
      { name: "月", symbol: "mo", factor: 2629746 },
      { name: "年", symbol: "y", factor: 31556952 },
    ],
  },
  {
    id: "currency",
    name: "货币",
    icon: DollarSign,
    baseUnit: "CNY",
    units: [
      { name: "人民币", symbol: "CNY", factor: 1 },
      { name: "美元", symbol: "USD", factor: 7.2 },
      { name: "欧元", symbol: "EUR", factor: 7.8 },
      { name: "英镑", symbol: "GBP", factor: 9.1 },
      { name: "日元", symbol: "JPY", factor: 0.048 },
      { name: "韩元", symbol: "KRW", factor: 0.0054 },
      { name: "港币", symbol: "HKD", factor: 0.92 },
      { name: "台币", symbol: "TWD", factor: 0.23 },
    ],
  },
  {
    id: "volume",
    name: "体积",
    icon: Volume2,
    baseUnit: "liter",
    units: [
      { name: "毫升", symbol: "ml", factor: 0.001 },
      { name: "升", symbol: "L", factor: 1 },
      { name: "立方米", symbol: "m³", factor: 1000 },
      { name: "立方厘米", symbol: "cm³", factor: 0.001 },
      { name: "加仑(美)", symbol: "gal(US)", factor: 3.78541 },
      { name: "加仑(英)", symbol: "gal(UK)", factor: 4.54609 },
      { name: "品脱", symbol: "pt", factor: 0.473176 },
      { name: "夸脱", symbol: "qt", factor: 0.946353 },
    ],
  },
  {
    id: "area",
    name: "面积",
    icon: Globe,
    baseUnit: "square_meter",
    units: [
      { name: "平方毫米", symbol: "mm²", factor: 0.000001 },
      { name: "平方厘米", symbol: "cm²", factor: 0.0001 },
      { name: "平方米", symbol: "m²", factor: 1 },
      { name: "平方千米", symbol: "km²", factor: 1000000 },
      { name: "公顷", symbol: "ha", factor: 10000 },
      { name: "平方英寸", symbol: "in²", factor: 0.00064516 },
      { name: "平方英尺", symbol: "ft²", factor: 0.092903 },
      { name: "平方码", symbol: "yd²", factor: 0.836127 },
      { name: "英亩", symbol: "ac", factor: 4046.86 },
    ],
  },
  {
    id: "power",
    name: "功率",
    icon: Zap,
    baseUnit: "watt",
    units: [
      { name: "瓦特", symbol: "W", factor: 1 },
      { name: "千瓦", symbol: "kW", factor: 1000 },
      { name: "兆瓦", symbol: "MW", factor: 1000000 },
      { name: "马力", symbol: "hp", factor: 745.7 },
      { name: "英制马力", symbol: "hp(UK)", factor: 745.7 },
      { name: "公制马力", symbol: "hp(M)", factor: 735.499 },
    ],
  },
];

export function UnitConverter({ onClose }: UnitConverterProps) {
  const [selectedCategory, setSelectedCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const currentCategory = conversionCategories.find(
    (cat) => cat.id === selectedCategory
  );

  // 温度转换（特殊处理）
  const convertTemperature = useCallback(
    (value: number, from: string, to: string): number => {
      let celsius: number;

      // 先转换为摄氏度
      switch (from) {
        case "celsius":
          celsius = value;
          break;
        case "fahrenheit":
          celsius = ((value - 32) * 5) / 9;
          break;
        case "kelvin":
          celsius = value - 273.15;
          break;
        default:
          celsius = value;
      }

      // 从摄氏度转换为目标单位
      switch (to) {
        case "celsius":
          return celsius;
        case "fahrenheit":
          return (celsius * 9) / 5 + 32;
        case "kelvin":
          return celsius + 273.15;
        default:
          return celsius;
      }
    },
    []
  );

  // 单位转换
  const convert = useCallback(
    (
      value: number,
      from: string,
      to: string,
      category: ConversionCategory
    ): number => {
      if (category.id === "temperature") {
        return convertTemperature(value, from, to);
      }

      if (category.id === "currency") {
        // 货币转换需要实时汇率，这里使用固定汇率作为示例
        const fromUnit = category.units.find((u) => u.symbol === from);
        const toUnit = category.units.find((u) => u.symbol === to);

        if (fromUnit && toUnit) {
          // 先转换为基础单位（人民币），再转换为目标单位
          const baseValue = value * fromUnit.factor;
          return baseValue / toUnit.factor;
        }
        return value;
      }

      const fromUnit = category.units.find((u) => u.symbol === from);
      const toUnit = category.units.find((u) => u.symbol === to);

      if (fromUnit && toUnit) {
        // 先转换为基础单位，再转换为目标单位
        const baseValue = value * fromUnit.factor;
        return baseValue / toUnit.factor;
      }

      return value;
    },
    [convertTemperature]
  );

  // 执行转换
  const performConversion = useCallback(() => {
    if (!fromValue || !fromUnit || !toUnit || !currentCategory) return;

    setIsConverting(true);

    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setToValue("");
      setIsConverting(false);
      return;
    }

    const result = convert(value, fromUnit, toUnit, currentCategory);
    setToValue(result.toFixed(6).replace(/\.?0+$/, ""));
    setIsConverting(false);
  }, [fromValue, fromUnit, toUnit, currentCategory, convert]);

  // 交换单位
  const swapUnits = useCallback(() => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;

    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  }, [fromUnit, toUnit, fromValue, toValue]);

  // 当输入值或单位改变时自动转换
  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      performConversion();
    }
  }, [fromValue, fromUnit, toUnit, performConversion]);

  // 当类别改变时重置单位
  useEffect(() => {
    if (currentCategory) {
      setFromUnit(currentCategory.units[0].symbol);
      setToUnit(
        currentCategory.units[1]?.symbol || currentCategory.units[0].symbol
      );
      setFromValue("");
      setToValue("");
    }
  }, [selectedCategory, currentCategory]);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            单位转换器
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* 类别选择 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {conversionCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs">{category.name}</span>
              </Button>
            );
          })}
        </div>

        <Separator />

        {/* 转换器 */}
        {currentCategory && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">
                {currentCategory.name}转换
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 从单位 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">从</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">单位</label>
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {currentCategory.units.map((unit) => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">数值</label>
                    <Input
                      type="number"
                      step="any"
                      value={fromValue}
                      onChange={(e) => setFromValue(e.target.value)}
                      placeholder="输入数值"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 转换按钮 */}
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapUnits}
                  className="rounded-full"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* 到单位 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">到</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">单位</label>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {currentCategory.units.map((unit) => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">结果</label>
                    <Input
                      type="text"
                      value={isConverting ? "转换中..." : toValue}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 转换结果详情 */}
            {fromValue && toValue && !isConverting && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {fromValue}{" "}
                      {
                        currentCategory.units.find((u) => u.symbol === fromUnit)
                          ?.symbol
                      }{" "}
                      = {toValue}{" "}
                      {
                        currentCategory.units.find((u) => u.symbol === toUnit)
                          ?.symbol
                      }
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {currentCategory.name}转换结果
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 常用转换 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">常用转换</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentCategory.units.slice(0, 4).map((unit) => (
                    <Button
                      key={unit.symbol}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFromUnit(unit.symbol);
                        setFromValue("1");
                      }}
                      className="text-xs"
                    >
                      1 {unit.symbol}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </div>
  );
}
