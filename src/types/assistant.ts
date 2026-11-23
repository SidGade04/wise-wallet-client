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
  question: string;
  context?: {
    thread_id?: string;
    previous_messages?: Pick<AssistantMessage, "role" | "content">[];
    [key: string]: any;
  };
}

export interface AssistantResponse {
  answer: string;
  citations: Citation[];
  used_tools: ToolResult[];
  metadata: {
    user_id: string;
    transaction_count?: number;
    account_count?: number;
    source?: string;
    [key: string]: any;
  };
}


