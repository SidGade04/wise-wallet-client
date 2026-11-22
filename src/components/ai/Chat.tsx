import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, Trash2 } from "lucide-react";
import { useAssistant } from "@/store/assistant";
import { supabase } from "@/lib/supabase";
import { Message } from "./Message";
import { useToast } from "@/hooks/useToast";

interface ChatProps {
  threadId: string;
  externalQuestion?: string;
  onQuestionSubmitted?: () => void;
}

export function Chat({ threadId, externalQuestion, onQuestionSubmitted }: ChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    threads, 
    addMessage, 
    updateMessage, 
    setThreadTitle,
    deleteThread
  } = useAssistant();
  
  const thread = threads.find(t => t.id === threadId);
  const messages = thread?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle external questions from suggestion chips
  useEffect(() => {
    if (externalQuestion && !isLoading) {
      setInput(externalQuestion);
      // Auto-submit the question
      handleSubmitQuestion(externalQuestion);
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    }
  }, [externalQuestion, isLoading]);

  const handleSubmitQuestion = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessage(threadId, {
      id: userMsgId,
      role: "user",
      content: question,
      timestamp: new Date().toISOString()
    });

    // Set thread title from first message if not set
    if (messages.length === 0 && !thread?.title) {
      setThreadTitle(threadId, question.slice(0, 50) + (question.length > 50 ? "..." : ""));
    }

    try {
      // Call AI service
      const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8001";
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem("auth_token") || "";
      const response = await fetch(`${aiServiceUrl}/v1/assistant/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question,
          context: {
            thread_id: threadId,
            previous_messages: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response
      const aiMsgId = `ai-${Date.now()}`;
      addMessage(threadId, {
        id: aiMsgId,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
        metadata: {
          citations: data.citations || [],
          used_tools: data.used_tools || [],
          ...data.metadata
        }
      });

    } catch (error) {
      console.error("Error calling AI service:", error);
      
      // Add error message
      const errorMsgId = `error-${Date.now()}`;
      addMessage(threadId, {
        id: errorMsgId,
        role: "assistant",
        content: "I apologize, but I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date().toISOString(),
        metadata: {
          error: true,
          error_message: error instanceof Error ? error.message : "Unknown error"
        }
      });

      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    await handleSubmitQuestion(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDeleteChat = () => {
    if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      deleteThread(threadId);
      toast({
        title: "Chat deleted",
        description: "The chat has been successfully deleted.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 p-4 min-h-0 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
              <p className="text-muted-foreground">
                Ask me anything about your finances, spending patterns, or budget!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-financial text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="flex-1 max-w-[80%]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            <Button 
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteChat}
              className="self-end"
              title="Delete this chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


