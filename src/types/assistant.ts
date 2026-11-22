export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    citations?: Citation[];
    used_tools?: ToolResult[];
    error?: boolean;
    error_message?: string;
    [key: string]: any;
  };
}

export interface AssistantThread {
  id: string;
  title: string | null;
  messages: AssistantMessage[];
  created_at: string;
  updated_at: string;
}

export interface Citation {
  title: string;
  url: string;
  relevance_score: number;
}

export interface ToolResult {
  tool_name: string;
  success: boolean;
  result: any;
  error?: string;
}

export interface AssistantQuery {
  user_id: string;
  question: string;
  context?: {
    thread_id?: string;
    previous_messages?: AssistantMessage[];
    [key: string]: any;
  };
}

export interface AssistantResponse {
  answer: string;
  citations: Citation[];
  used_tools: ToolResult[];
  metadata: {
    user_id: string;
    kb_chunks_retrieved: number;
    tools_used: number;
    [key: string]: any;
  };
}


