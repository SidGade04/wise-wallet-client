import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, TrendingUp, DollarSign, Target, Lightbulb, Trash2 } from "lucide-react";
import { useAssistant } from "@/store/assistant";
import { Chat } from "@/components/ai/Chat";
import { SuggestionChips } from "@/components/ai/SuggestionChips";
import { useIsMobile } from "@/hooks/useMobile";
import { StaggerContainer, StaggerItem } from "@/components/ui/page-transition";

export default function Assistant() {
  const isMobile = useIsMobile();
  const { threads, currentThreadId, createThread, selectThread, deleteThread } = useAssistant();
  const [externalQuestion, setExternalQuestion] = useState<string | null>(null);

  const handleNewChat = () => {
    createThread();
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the thread when clicking delete
    if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      deleteThread(threadId);
    }
  };

  const handleSuggestionClick = (question: string) => {
    // Create a new thread if none exists
    if (!currentThreadId) {
      createThread();
    }
    // Set the external question to trigger the chat
    setExternalQuestion(question);
  };

  const handleQuestionSubmitted = () => {
    // Clear the external question after it's been submitted
    setExternalQuestion(null);
  };

  const currentThread = threads.find(t => t.id === currentThreadId);

  return (
    <StaggerContainer className="h-full flex flex-col space-y-6 min-h-0 overflow-hidden">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              AI Financial Assistant
            </h1>
            <p className="text-muted-foreground">
              Get personalized insights and guidance for your finances
            </p>
          </div>
          <Button onClick={handleNewChat} variant="financial">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </StaggerItem>

      {/* Main Content */}
      <StaggerItem className="flex-1 min-h-0 overflow-hidden">
        <div className={`grid gap-6 h-full min-h-0 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Chat Section */}
          <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-financial rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  Chat with AI Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your finances, get spending insights, and receive personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {currentThread ? (
                  <Chat 
                    threadId={currentThread.id} 
                    externalQuestion={externalQuestion}
                    onQuestionSubmitted={handleQuestionSubmitted}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground mb-4">
                        Click "New Chat" to begin asking questions about your finances.
                      </p>
                      <Button onClick={handleNewChat} variant="financial">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div className="col-span-1">
            <div className="space-y-6">
              {/* Quick Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Quick Suggestions
                  </CardTitle>
                  <CardDescription>
                    Common questions to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SuggestionChips onSuggestionClick={handleSuggestionClick} />
                </CardContent>
              </Card>

              {/* Thread History */}
              {threads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Chats
                    </CardTitle>
                    <CardDescription>
                      Your conversation history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {threads.slice(0, 5).map((thread) => (
                        <div
                          key={thread.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            thread.id === currentThreadId
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                          onClick={() => selectThread(thread.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {thread.title || 'New Chat'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {thread.messages.length} messages
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {thread.id === currentThreadId && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteThread(thread.id, e)}
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                title="Delete chat"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    What I Can Help With
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Spending Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Understand your spending patterns and trends
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Budget Optimization</p>
                        <p className="text-xs text-muted-foreground">
                          Get personalized budget recommendations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Financial Goals</p>
                        <p className="text-xs text-muted-foreground">
                          Plan and track your financial objectives
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}


