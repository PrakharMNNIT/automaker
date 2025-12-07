"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

let messageCounter = 0;
const generateMessageId = () => `msg-${++messageCounter}`;

const getAgentResponse = (userInput: string): string => {
  const lowerInput = userInput.toLowerCase();

  if (lowerInput.includes("todo") || lowerInput.includes("task")) {
    return "I can help you build a todo application! Let me ask a few questions:\n\n1. What tech stack would you prefer? (React, Vue, plain JavaScript)\n2. Do you need user authentication?\n3. Should tasks be stored locally or in a database?\n\nPlease share your preferences and I'll create a detailed spec.";
  }

  if (lowerInput.includes("api") || lowerInput.includes("backend")) {
    return "Great! For building an API, I'll need to know:\n\n1. What type of data will it handle?\n2. Do you need authentication?\n3. What database would you like to use? (PostgreSQL, MongoDB, SQLite)\n4. Should I generate OpenAPI documentation?\n\nShare your requirements and I'll design the architecture.";
  }

  if (lowerInput.includes("help") || lowerInput.includes("what can you do")) {
    return "I can help you with:\n\n• **Project Planning** - Define your app specification and features\n• **Code Generation** - Write code based on your requirements\n• **Testing** - Create and run tests for your features\n• **Code Review** - Analyze and improve existing code\n\nJust describe what you want to build, and I'll guide you through the process!";
  }

  return `I understand you want to work on: "${userInput}"\n\nLet me analyze this and create a plan. In the full version, I would:\n\n1. Generate a detailed app_spec.txt\n2. Create feature_list.json with test cases\n3. Start implementing features one by one\n4. Run tests to verify each feature\n\nThis functionality requires API keys to be configured in Settings.`;
};

export function AgentView() {
  const { currentProject } = useAppStore();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm the Automaker Agent. I can help you build software autonomously. What would you like to create today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = useCallback(() => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    const currentInput = input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate agent response (in a real implementation, this would call the AI API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: getAgentResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  }, [input, isProcessing]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="agent-view-no-project">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground">
            Open or create a project to start working with the AI agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="agent-view">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Bot className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold">AI Agent</h1>
          <p className="text-sm text-muted-foreground">
            Autonomous development assistant for {currentProject.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="message-list">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === "assistant" ? "bg-primary/10" : "bg-muted"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <Card
              className={cn(
                "max-w-[80%]",
                message.role === "user" && "bg-primary text-primary-foreground"
              )}
            >
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe what you want to build..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            data-testid="agent-input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            data-testid="send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
