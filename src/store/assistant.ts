import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssistantMessage, AssistantThread } from '@/types/assistant';

interface AssistantState {
  threads: AssistantThread[];
  currentThreadId: string | null;
  
  // Thread management
  createThread: () => string;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  setThreadTitle: (threadId: string, title: string) => void;
  
  // Message management
  addMessage: (threadId: string, message: AssistantMessage) => void;
  updateMessage: (threadId: string, messageId: string, updates: Partial<AssistantMessage>) => void;
  deleteMessage: (threadId: string, messageId: string) => void;
  
  // Utility
  getCurrentThread: () => AssistantThread | null;
  clearAllThreads: () => void;
}

export const useAssistant = create<AssistantState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,

      createThread: () => {
        const newThread: AssistantThread = {
          id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: null,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThreadId: newThread.id
        }));

        return newThread.id;
      },

      selectThread: (threadId: string) => {
        set({ currentThreadId: threadId });
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const newThreads = state.threads.filter(t => t.id !== threadId);
          const newCurrentThreadId = state.currentThreadId === threadId 
            ? (newThreads.length > 0 ? newThreads[0].id : null)
            : state.currentThreadId;

          return {
            threads: newThreads,
            currentThreadId: newCurrentThreadId
          };
        });
      },

      setThreadTitle: (threadId: string, title: string) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? { ...thread, title, updated_at: new Date().toISOString() }
              : thread
          )
        }));
      },

      addMessage: (threadId: string, message: AssistantMessage) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [...thread.messages, message],
                  updated_at: new Date().toISOString()
                }
              : thread
          )
        }));
      },

      updateMessage: (threadId: string, messageId: string, updates: Partial<AssistantMessage>) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: thread.messages.map(msg =>
                    msg.id === messageId
                      ? { ...msg, ...updates }
                      : msg
                  ),
                  updated_at: new Date().toISOString()
                }
              : thread
          )
        }));
      },

      deleteMessage: (threadId: string, messageId: string) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: thread.messages.filter(msg => msg.id !== messageId),
                  updated_at: new Date().toISOString()
                }
              : thread
          )
        }));
      },

      getCurrentThread: () => {
        const state = get();
        return state.threads.find(t => t.id === state.currentThreadId) || null;
      },

      clearAllThreads: () => {
        set({ threads: [], currentThreadId: null });
      }
    }),
    {
      name: 'assistant-storage',
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId
      })
    }
  )
);


