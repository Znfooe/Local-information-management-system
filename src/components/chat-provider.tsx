import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import axios from "axios";
import { db } from "@/lib/db";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  sessions: Session[];
  sessionId: string;
  loadSession: (session: Session) => void;
  handleNewChat: () => Promise<void>;
  handleDeleteSession: (e: any, id: string) => Promise<void>;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  saveConfig: () => Promise<void>;
}

export const PROVIDERS: Record<string, { name: string; baseUrl: string; defaultModel: string }> = {
  glm: {
    name: "Zhipu AI (GLM)",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    defaultModel: "glm-4-flash"
  },
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o"
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-chat"
  },
  qwen: {
    name: "Tongyi Qianwen (Qwen)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    defaultModel: "qwen-plus"
  },
  doubao: {
    name: "Doubao (Ark)",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    defaultModel: "ep-20250205-xxxxx" 
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Model Config
  const [systemPrompt, setSystemPrompt] = useState("你是一个乐于助人的AI助手。");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("glm-4-flash"); 
  const [provider, setProvider] = useState("glm");

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const settings = await db.getSettings();
      if (settings.apiKey) setApiKey(settings.apiKey);
      if (settings.model) setModel(settings.model);
      if (settings.provider) setProvider(settings.provider);
      if (settings.systemPrompt) setSystemPrompt(settings.systemPrompt);
      
      const loadedSessions = await db.getSessions();
      if (loadedSessions && loadedSessions.length > 0) {
        loadedSessions.sort((a: Session, b: Session) => b.updatedAt - a.updatedAt);
        setSessions(loadedSessions);
        setSessionId(loadedSessions[0].id);
        setMessages(loadedSessions[0].messages);
      } else {
        // Migration check
        const history = await db.getChatHistory();
        if (history && history.length > 0) {
          const newId = Date.now().toString();
          const newSession = {
            id: newId,
            title: history[0].content.slice(0, 20) || t("ai.recovered"),
            messages: history,
            updatedAt: Date.now()
          };
          await db.saveSession(newSession);
          setSessions([newSession]);
          setSessionId(newId);
          setMessages(history);
        } else {
          handleNewChat();
        }
      }
    };
    init();
  }, []);

  // Auto-save current session when messages change
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;

    const save = async () => {
      const currentSession = sessions.find(s => s.id === sessionId);
      let title = currentSession?.title || t("ai.new_chat");
      
      if (title === t("ai.new_chat") || title === "New Chat") {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg) {
          title = firstUserMsg.content.slice(0, 15);
        }
      }

      const updatedSession = {
        id: sessionId,
        title,
        messages,
        updatedAt: Date.now()
      };
      
      await db.saveSession(updatedSession);
      
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === sessionId);
        if (idx >= 0) {
          const newSessions = [...prev];
          newSessions[idx] = updatedSession;
          return newSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return [updatedSession, ...prev];
      });
    };
    save();
  }, [messages]);

  const handleNewChat = async () => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: t("ai.new_chat"),
      messages: [],
      updatedAt: Date.now()
    };
    await db.saveSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setSessionId(newId);
    setMessages([]);
    setIsHistoryOpen(false);
  };

  const loadSession = (session: Session) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = async (e: any, id: string) => {
    e.stopPropagation();
    if (confirm(t("ai.delete_confirm"))) {
      await db.deleteSession(id);
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (id === sessionId) {
        if (newSessions.length > 0) {
          loadSession(newSessions[0]);
        } else {
          handleNewChat();
        }
      }
    }
  };

  const saveConfig = async () => {
    if (!apiKey.trim()) {
      toast.error(t("ai.key.empty"));
      return;
    }
    try {
      await db.saveSettings({ apiKey, model, systemPrompt, provider });
      toast.success(t("ai.config.saved"));
    } catch (error) {
      console.error("Save config error:", error);
      toast.error(t("ai.config.failed"));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      toast.error(t("ai.key.missing"));
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const conversation = [
        { role: "system", content: systemPrompt },
        ...messages,
        userMsg
      ];

      const currentProvider = PROVIDERS[provider] || PROVIDERS.glm;
      const response = await axios.post(
        currentProvider.baseUrl,
        {
          model: model,
          messages: conversation,
          stream: false
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const aiMsg: Message = {
        role: "assistant",
        content: response.data.choices[0].message.content
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error(t("ai.request.failed"));
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${error.response?.data?.error?.message || error.message}`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
