"use client";

import { ColorPicker } from "./color-picker";
import { Timer } from "./timer";
import { ClockTool } from "./clock";
import { CalculatorTool } from "./calculator";
import { ImageEditor } from "./image-editor";
import { TextEditor } from "./text-editor";
import { Calendar } from "./calendar";
import { SystemTools } from "./system-tools";
import { PasswordManager } from "./password-manager";
import { QRGenerator } from "./qr-generator";
import { UnitConverter } from "./unit-converter";
import { Base64Encoder } from "./base64-encoder";
import { JSONFormatter } from "./json-formatter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ToolPageProps {
  toolId: string;
  onBack: () => void;
}

export function ToolPage({ toolId, onBack }: ToolPageProps) {
  const renderTool = () => {
    switch (toolId) {
      case "color-picker":
        return <ColorPicker />;
      case "timer":
        return <Timer />;
      case "clock":
        return <ClockTool />;
      case "calculator":
        return <CalculatorTool />;
      case "image-editor":
        return <ImageEditor onClose={onBack} />;
      case "text-editor":
        return <TextEditor onClose={onBack} />;
      case "calendar":
        return <Calendar onClose={onBack} />;
      case "system-tools":
        return <SystemTools onClose={onBack} />;
      case "password-manager":
        return <PasswordManager onClose={onBack} />;
      case "qr-generator":
        return <QRGenerator onClose={onBack} />;
      case "unit-converter":
        return <UnitConverter onClose={onBack} />;
      case "base64-encoder":
        return <Base64Encoder onClose={onBack} />;
      case "json-formatter":
        return <JSONFormatter onClose={onBack} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">工具正在开发中...</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button size="sm" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>
      {renderTool()}
    </div>
  );
}
