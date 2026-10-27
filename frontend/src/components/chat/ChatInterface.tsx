import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Send, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const sampleMessages: Message[] = [
  {
    id: '1',
    content: "Hello! I'm MedASK AI. How can I help you understand your medications or suggest natural remedies today?",
    isUser: false,
    timestamp: new Date(),
  },
];

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isAITyping: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  setInput,
  handleSendMessage,
  handleKeyDown,
  isAITyping,
}) => {
  // DEBUG: Console log to confirm component is loaded
  useEffect(() => {
    console.log('ChatInterface mounted!');
  }, []);
  // DEBUG: Force isAITyping to true on mount for testing



  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Slight delay to allow tab switch to settle before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50); // 50ms delay, can be adjusted
    return () => clearTimeout(timer);
  }, [messages]);


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] p-2">
        <div className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl shadow-lg flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-500 to-indigo-500">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="text-violet-600 font-bold text-2xl">AI</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">MedASK AI Assistant</h2>
              <p className="text-violet-100 text-sm">Ask me anything about your medications</p>
            </div>
          </div>
          {/* Main Chat Area */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'} items-start`}
                >
                  {/* Avatar for AI/User */}
                  {!message.isUser && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center mr-3 mt-1">
                      <span className="text-white font-bold text-lg">AI</span>
                    </div>
                  )}
                  <div
                    className={`relative max-w-[75%] ${
                      message.isUser
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white rounded-br-2xl rounded-tl-2xl rounded-bl-2xl ml-12'
                        : 'bg-gray-50 text-gray-900 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl mr-12'
                    } p-4 shadow-sm flex flex-col`}
                    style={{ alignItems: 'flex-start' }}
                  >
                    {/* AI markdown rendering */}
                    {!message.isUser ? (
                      <ReactMarkdown
                        components={{ p: ({ node, ...props }) => <p style={{ margin: 0, fontFamily: 'inherit' }} {...props} /> }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="break-words text-right">{message.content}</span>
                    )}
                    <div
                      className={`text-xs mt-2 ${message.isUser ? 'text-white/70 text-right' : 'text-gray-500 text-left'}`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {/* Avatar for user */}
                  {message.isUser && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-300 flex items-center justify-center ml-3 mt-1">
                      <span className="text-white font-bold text-lg">U</span>
                    </div>
                  )}
                </div>
              ))}
              {/* AI typing (thinking) animation bubble */}
              {isAITyping && (
                <div className="flex w-full justify-start items-start">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 flex items-center justify-center mr-3 mt-1">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <div
                    className="relative max-w-[75%] bg-gray-50 text-gray-900 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl mr-12 p-4 shadow-sm flex items-center gap-1"
                    style={{ alignItems: 'center' }}
                  >
                    <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t px-6 py-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none text-base bg-gray-50"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={input.trim() === ''}
                  className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white h-12 w-12 rounded-xl shadow-md flex items-center justify-center text-xl"
                >
                  <Send className="w-6 h-6" />
                </Button>
              </div>
              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setInput('What are the side effects of Lisinopril?')}
                >
                  What are the side effects of Lisinopril? <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setInput('What natural remedies can help with high blood pressure?')}
                >
                  What natural remedies can help with high blood pressure? <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setInput('How should I take my medication?')}
                >
                  How should I take my medication? <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setInput('Can you explain how my medication works?')}
                >
                  Can you explain how my medication works? <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 bg-white hover:bg-gray-100"
                  onClick={() => setInput('Are there any foods I should avoid?')}
                >
                  Are there any foods I should avoid? <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;