"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export function SettingsView() {
  const { apiKeys, setApiKeys, setCurrentView } = useAppStore();
  const [anthropicKey, setAnthropicKey] = useState(apiKeys.anthropic);
  const [googleKey, setGoogleKey] = useState(apiKeys.google);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnthropicKey(apiKeys.anthropic);
    setGoogleKey(apiKeys.google);
  }, [apiKeys]);

  const handleSave = () => {
    setApiKeys({
      anthropic: anthropicKey,
      google: googleKey,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "*".repeat(key.length);
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className="flex-1 flex flex-col" data-testid="settings-view">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your API keys and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Configure your AI provider API keys. Keys are stored locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Anthropic API Key */}
              <div className="space-y-2">
                <Label htmlFor="anthropic-key" className="flex items-center gap-2">
                  Anthropic API Key
                  {apiKeys.anthropic && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="anthropic-key"
                      type={showAnthropicKey ? "text" : "password"}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="pr-10"
                      data-testid="anthropic-api-key-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                      data-testid="toggle-anthropic-visibility"
                    >
                      {showAnthropicKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for Claude AI features. Get your key at{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              {/* Google API Key */}
              <div className="space-y-2">
                <Label htmlFor="google-key" className="flex items-center gap-2">
                  Google API Key (Gemini)
                  {apiKeys.google && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="google-key"
                      type={showGoogleKey ? "text" : "password"}
                      value={googleKey}
                      onChange={(e) => setGoogleKey(e.target.value)}
                      placeholder="AIza..."
                      className="pr-10"
                      data-testid="google-api-key-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowGoogleKey(!showGoogleKey)}
                      data-testid="toggle-google-visibility"
                    >
                      {showGoogleKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for Gemini AI features. Get your key at{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    makersuite.google.com
                  </a>
                </p>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-xs opacity-80 mt-1">
                    API keys are stored in your browser's local storage. Never share your API keys
                    or commit them to version control.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              data-testid="save-settings"
              className="min-w-[100px]"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView("welcome")}
              data-testid="back-to-home"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
