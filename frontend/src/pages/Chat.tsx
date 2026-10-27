import React, { useState, useRef, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Send, Copy, ArrowRight, Sparkles, Bot, User, PlusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './Chat.module.css';


interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

const initialAiMessageContent = "Hello! I'm MedASK AI. How can I help you understand your medications or suggest natural remedies today?";
const initialAiMessageId = 'initial-ai-greeting';

// Updated createNewSession to accept existing sessions count for naming
const createNewSession = (existingSessionsCount: number, idSuffix: string = Date.now().toString()): ChatSession => {
  return {
    id: `session-${idSuffix}`,
    name: `Chat #${existingSessionsCount + 1}`, // Sequential naming
    messages: [{
      id: `${initialAiMessageId}-${idSuffix}`,
      content: initialAiMessageContent,
      isUser: false,
      timestamp: new Date(),
    }],
    createdAt: new Date(),
  };
};

const CHAT_SESSIONS_KEY = 'ai_chat_sessions';
const ACTIVE_SESSION_ID_KEY = 'ai_active_session_id';

const Chat = () => {
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  // Load chat sessions and active session from localStorage if available
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (saved) {
      try {
        // Revive Date objects
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === 'timestamp' || key === 'createdAt') return new Date(value);
          return value;
        });
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || null;
  });
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first session on component mount if none loaded from storage
  useEffect(() => {
    if (chatSessions.length === 0) {
      const firstSession = createNewSession(0, 'init'); // Initial session is Chat #1
      setChatSessions([firstSession]);
      setActiveSessionId(firstSession.id);
    }
    // eslint-disable-next-line
  }, []);

  // Persist chatSessions and activeSessionId to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(chatSessions));
  }, [chatSessions]);
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_SESSION_ID_KEY, activeSessionId);
    }
  }, [activeSessionId]);

  // Clear chat history on tab close or reload
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem(CHAT_SESSIONS_KEY);
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const currentMessages = useMemo(() => {
    if (!activeSessionId) return [];
    const activeSession = chatSessions.find(session => session.id === activeSessionId);
    return activeSession ? activeSession.messages : [];
  }, [chatSessions, activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleNewChat = () => {
    // Pass the current number of sessions to createNewSession for correct naming
    const newSession = createNewSession(chatSessions.length);
    setChatSessions(prevSessions => [newSession, ...prevSessions]); // Add new session to the top
    setActiveSessionId(newSession.id);
  };

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleSendMessage = () => {
    if (input.trim() === '' || !activeSessionId) return;
    
    const systemPrompt = "You are a world's best medical assistant. Reply perfectly and briefly.";
    const activeSession = chatSessions.find(session => session.id === activeSessionId);
    const previousMessages = activeSession ? activeSession.messages : [];

    const formattedPreviousMessages = previousMessages.map(msg => 
        `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\n${formattedPreviousMessages}\nUser: ${input}`;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setChatSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, userMessage],
          };
        }
        return session;
      })
    );

    setInput('');
    setShowTypingIndicator(true);

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: fullPrompt }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('AI chat failed');
        const data = await res.json();
        const aiMessage: Message = {
          id: `${Date.now()}-ai`,
          content: data.reply,
          isUser: false,
          timestamp: new Date(),
        };

        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === activeSessionId
              ? { ...session, messages: [...session.messages, aiMessage] }
              : session
          )
        );
        
      })
      .catch((err) => {
        alert('AI chat error: ' + (err.message || 'Unknown error'));
      })
      .finally(() => {
        setShowTypingIndicator(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="flex flex-col h-screen min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-white text-gray-800">
      <Navbar />
      <div className="flex flex-1 flex-col h-full w-full overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-white">
        {/* Main Chat Area Only */}
        <main className="flex flex-col h-full w-full bg-white/60 backdrop-blur-xl shadow-lg border border-gray-200 rounded-none md:rounded-3xl overflow-hidden">
          {/* Header with New Chat button */}
          <div className="flex items-center justify-between bg-white/70 border-b border-gray-100 px-6 py-4 md:rounded-t-2xl sticky top-0 z-20 backdrop-blur-xl">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <Bot className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-gray-800 text-xl font-bold">MedASK AI Assistant</h1>
                <p className="text-gray-500 text-xs mt-1">Ask me anything about your medications</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-600 hover:bg-purple-100/70 hover:text-purple-700 transition-colors duration-200 py-2 px-5 font-semibold shadow rounded-xl"
              onClick={handleNewChat}
            >
              <PlusCircle size={18} />
              <span className="ml-2">New Chat</span>
            </Button>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-[#f7f7fa]">
              {currentMessages.map((message, idx) => {
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Left AI icon */}
                    {!message.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <Sparkles className="text-white w-4 h-4" />
                      </div>
                    )}
                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 relative group
                        ${message.isUser
                          ? 'bg-purple-50 border border-purple-200 text-purple-900 rounded-tr-2xl'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-tl-2xl'}
                        `}
                      style={{ marginLeft: message.isUser ? 'auto' : undefined, marginRight: message.isUser ? undefined : 'auto' }}
                    >
                      {/* Message content */}
                      {message.isUser ? (
                        <p className="break-words">{message.content}</p>
                      ) : (
                        <div className={styles['markdown-body']}>
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      <div className={`text-[11px] mt-2 ${message.isUser ? 'text-purple-400' : 'text-gray-400'} font-normal`}>
                        {formatTime(message.timestamp)}
                      </div>
                      {/* Copy button for AI */}
                      {!message.isUser && (
                        <button
                          className="absolute right-2 bottom-2 bg-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                    {/* Right user icon */}
                    {message.isUser && (
                      <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                        <User className="text-white w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* AI typing indicator */}
              {showTypingIndicator && (
                <div className={`flex justify-start`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Sparkles className="text-white w-4 h-4" />
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 relative bg-white border border-gray-200 text-gray-900 rounded-tl-2xl`}
                    style={{ marginRight: 'auto' }}
                  >
                    <div className="flex items-center gap-1">
                      <div className={styles['ai-typing-dot']} style={{ animationDelay: '0s' }}></div>
                      <div className={styles['ai-typing-dot']} style={{ animationDelay: '0.15s' }}></div>
                      <div className={styles['ai-typing-dot']} style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-3 bg-white/80 backdrop-blur-xl shadow-lg rounded-none md:rounded-b-2xl flex flex-col gap-2 sticky bottom-0 z-20">
              <div className="flex items-center space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-white/70 text-base shadow-sm placeholder-gray-400 transition-all"
                  rows={2}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={input.trim() === ''}
                  className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 h-12 w-12 rounded-full flex items-center justify-center text-white hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-purple-400 transition-all duration-200 shadow-lg"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Chat;
