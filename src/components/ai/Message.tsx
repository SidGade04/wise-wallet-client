import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, User, ChevronDown, ChevronRight, ExternalLink, Wrench } from "lucide-react";
import { format } from "date-fns";
import { AssistantMessage } from "@/types/assistant";

interface MessageProps {
  message: AssistantMessage;
}

export function Message({ message }: MessageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isUser = message.role === "user";
  const isError = message.metadata?.error;

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
  };

  const renderCitations = () => {
    const citations = message.metadata?.citations || [];
    if (citations.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
        <div className="space-y-1">
          {citations.map((citation, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                {index + 1}
              </Badge>
              <span className="text-muted-foreground">{citation.title}</span>
              {citation.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => window.open(citation.url, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTools = () => {
    const tools = message.metadata?.used_tools || [];
    if (tools.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs font-medium text-muted-foreground mb-2">Tools used:</p>
        <div className="space-y-1">
          {tools.map((tool, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <Wrench className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {tool.tool_name} {tool.success ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className={`${isError ? 'bg-destructive text-destructive-foreground' : 'bg-gradient-financial text-white'}`}>
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`${isUser ? 'bg-primary text-primary-foreground' : isError ? 'border-destructive/50' : ''}`}>
          <CardContent className="p-3">
            <div 
              className="text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            />
            
            {/* Citations and Tools */}
            {(message.metadata?.citations?.length > 0 || message.metadata?.used_tools?.length > 0) && (
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs"
                  >
                    {showDetails ? (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    )}
                    Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  {renderCitations()}
                  {renderTools()}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : ''}`}>
          {format(new Date(message.timestamp), 'MMM d, h:mm a')}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}


