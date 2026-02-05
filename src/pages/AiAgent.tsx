import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Settings2, History, Plus, MessageSquare, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChat, PROVIDERS } from "@/components/chat-provider";

export default function AiAgent() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    sessions,
    sessionId,
    loadSession,
    handleNewChat,
    handleDeleteSession,
    isHistoryOpen,
    setIsHistoryOpen,
    apiKey,
    setApiKey,
    model,
    setModel,
    provider,
    setProvider,
    systemPrompt,
    setSystemPrompt,
    saveConfig
  } = useChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleProviderChange = (val: string) => {
    setProvider(val);
    if (PROVIDERS[val]) {
      setModel(PROVIDERS[val].defaultModel);
    }
  };

  const getHelpLink = () => {
    switch (provider) {
      case "glm": return "https://open.bigmodel.cn/";
      case "openai": return "https://platform.openai.com/api-keys";
      case "deepseek": return "https://platform.deepseek.com/api_keys";
      case "qwen": return "https://dashscope.console.aliyun.com/apiKey";
      case "doubao": return "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6" /> {t("nav.ai")}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-2" /> {t("ai.new_chat")}
          </Button>

          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" /> {t("ai.history")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{t("ai.history")}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4 mt-2">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                        sessionId === session.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {session.title || t("ai.untitled")}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {new Date(session.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      {t("ai.no_history")}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" /> {t("ai.settings")}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ai.config.title")}</DialogTitle>
              <DialogDescription>
                {t("ai.config.desc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>{t("ai.provider.label")}</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDERS).map(([key, conf]) => (
                      <SelectItem key={key} value={key}>{conf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("ai.system.label")}</Label>
                <Textarea 
                  value={systemPrompt}
                  onChange={(e: any) => setSystemPrompt(e.target.value)}
                  placeholder={t("ai.system.placeholder")}
                  className="h-24"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("ai.key.label")}</Label>
                <Input 
                  value={apiKey}
                  onChange={(e: any) => setApiKey(e.target.value)}
                  type="password"
                  placeholder={t("ai.key.placeholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("ai.key.help")} {getHelpLink() && <a href={getHelpLink()} target="_blank" className="underline">{getHelpLink().replace('https://', '').split('/')[0]}</a>}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>{t("ai.model.label")}</Label>
                <Input 
                  value={model}
                  onChange={(e: any) => setModel(e.target.value)}
                  placeholder={t("ai.model.placeholder")}
                />
              </div>
              <Button onClick={saveConfig} className="w-full">{t("ai.save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="flex-1 p-4 overflow-hidden flex flex-col bg-muted/30">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("ai.start")}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}>
                    {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-card border p-3 rounded-lg text-sm shadow-sm">
                   {t("ai.thinking")}
                 </div>
               </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="pt-4 mt-2 flex gap-2">
          <Textarea 
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t("ai.placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}