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
import {
  Calculator,
  History,
  RotateCcw,
  Delete,
  Square,
  Percent,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
} from "lucide-react";

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export function CalculatorTool() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isScientificMode, setIsScientificMode] = useState(false);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;

      if (key >= "0" && key <= "9") {
        inputNumber(key);
      } else if (key === ".") {
        inputDecimal();
      } else if (key === "+") {
        inputOperation("+");
      } else if (key === "-") {
        inputOperation("-");
      } else if (key === "*") {
        inputOperation("×");
      } else if (key === "/") {
        inputOperation("÷");
      } else if (key === "Enter" || key === "=") {
        calculate();
      } else if (key === "Escape") {
        clear();
      } else if (key === "Backspace") {
        backspace();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [display, previousValue, operation, waitingForOperand]);

  // 输入数字
  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      if (num === "00") {
        // 处理00的情况
        if (display === "0") {
          setDisplay("0");
        } else {
          setDisplay(display + "00");
        }
      } else {
        setDisplay(display === "0" ? num : display + num);
      }
    }
  };

  // 输入小数点
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  // 输入运算符
  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculateValue(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // 计算值
  const calculateValue = (
    firstValue: number,
    secondValue: number,
    operation: string
  ): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case "%":
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  // 执行计算
  const calculate = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculateValue(previousValue, inputValue, operation);

      // 添加到历史记录
      const expression = `${previousValue} ${operation} ${inputValue}`;
      addToHistory(expression, String(newValue));

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  // 清除
  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // 退格
  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  // 添加到历史记录
  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 19)]); // 保留最近20条
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
  };

  // 科学计算函数
  const scientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "sin":
        result = Math.sin((value * Math.PI) / 180);
        break;
      case "cos":
        result = Math.cos((value * Math.PI) / 180);
        break;
      case "tan":
        result = Math.tan((value * Math.PI) / 180);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      default:
        result = value;
    }

    addToHistory(`${func}(${value})`, String(result));
    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  // 按钮样式
  const buttonClass = "h-12 text-lg font-medium";
  const numberButtonClass = `${buttonClass} bg-background hover:bg-muted text-foreground border`;
  const operationButtonClass = `${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`;
  const functionButtonClass = `${buttonClass} bg-secondary text-secondary-foreground hover:bg-secondary/80 border`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">计算器</h2>
        <p className="text-muted-foreground">基本运算和科学计算功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 计算器主体 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  计算器
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsScientificMode(!isScientificMode)}
                >
                  {isScientificMode ? "基本模式" : "科学模式"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 显示屏 */}
              <div className="bg-muted p-4 rounded-lg text-right">
                <div className="text-3xl font-mono font-bold min-h-[2rem] break-all">
                  {display}
                </div>
                {operation && previousValue !== null && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {previousValue} {operation}
                  </div>
                )}
              </div>

              {/* 按钮网格 */}
              <div className="grid grid-cols-4 gap-2">
                {/* 第一行 */}
                <Button className={functionButtonClass} onClick={clear}>
                  C
                </Button>
                <Button className={functionButtonClass} onClick={backspace}>
                  <Delete className="w-4 h-4" />
                </Button>
                <Button
                  className={functionButtonClass}
                  onClick={() => inputOperation("%")}
                >
                  <Percent className="w-4 h-4" />
                </Button>
                <Button
                  className={operationButtonClass}
                  onClick={() => inputOperation("÷")}
                >
                  <Divide className="w-4 h-4" />
                </Button>

                {/* 第二行 */}
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("7")}
                >
                  7
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("8")}
                >
                  8
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("9")}
                >
                  9
                </Button>
                <Button
                  className={operationButtonClass}
                  onClick={() => inputOperation("×")}
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* 第三行 */}
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("4")}
                >
                  4
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("5")}
                >
                  5
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("6")}
                >
                  6
                </Button>
                <Button
                  className={operationButtonClass}
                  onClick={() => inputOperation("-")}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                {/* 第四行 */}
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("1")}
                >
                  1
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("2")}
                >
                  2
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("3")}
                >
                  3
                </Button>
                <Button
                  className={operationButtonClass}
                  onClick={() => inputOperation("+")}
                >
                  <Plus className="w-4 h-4" />
                </Button>

                {/* 第五行 */}
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("0")}
                >
                  0
                </Button>
                <Button
                  className={numberButtonClass}
                  onClick={() => inputNumber("00")}
                >
                  00
                </Button>
                <Button className={numberButtonClass} onClick={inputDecimal}>
                  .
                </Button>
                <Button className={operationButtonClass} onClick={calculate}>
                  <Equal className="w-4 h-4" />
                </Button>
              </div>

              {/* 科学计算按钮 */}
              {isScientificMode && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("sqrt")}
                  >
                    √
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("square")}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("sin")}
                  >
                    sin
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("cos")}
                  >
                    cos
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("tan")}
                  >
                    tan
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("log")}
                  >
                    log
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("ln")}
                  >
                    ln
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("pi")}
                  >
                    π
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => scientificFunction("e")}
                  >
                    e
                  </Button>
                  <Button
                    className={functionButtonClass}
                    onClick={() => setDisplay(String(Math.PI))}
                  >
                    π
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 历史记录 */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  计算历史
                </CardTitle>
                <Button size="sm" variant="outline" onClick={clearHistory}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>最近的计算记录</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  暂无计算历史
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => setDisplay(item.result)}
                    >
                      <div className="text-sm font-mono text-muted-foreground">
                        {item.expression}
                      </div>
                      <div className="text-lg font-bold">= {item.result}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">基本操作</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 支持键盘输入（0-9, +, -, *, /, =）</li>
                <li>• 点击按钮或使用键盘进行计算</li>
                <li>• C键清除所有，Backspace退格</li>
                <li>• 支持连续运算和链式计算</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">科学计算</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 平方根、平方、三角函数</li>
                <li>• 对数、自然对数</li>
                <li>• 圆周率π和自然常数e</li>
                <li>• 点击历史记录可重复使用结果</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
