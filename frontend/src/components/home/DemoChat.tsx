import React from 'react';

const demoMessages = [
  {
    id: 'ai-1',
    content: "Hello! I'm MedASK AI. How can I help you understand your medications or suggest natural remedies today?",
    isUser: false,
  },
  {
    id: 'user-1',
    content: 'What are the side effects of Lisinopril?',
    isUser: true,
  },
  {
    id: 'ai-2',
    content: 'Common side effects of Lisinopril include dizziness, headache, cough, and fatigue. Would you like to know more? 🤖',
    isUser: false,
  },
];

const DemoChat = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
    
    <div className="flex flex-col gap-4 p-6 min-h-[320px] bg-gray-50">
      {demoMessages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} w-full`}>
          {!msg.isUser && (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
          )}
          <div className={`rounded-2xl px-4 py-2 max-w-[70%] text-base shadow-sm ${msg.isUser ? 'bg-purple-50 border border-purple-200 text-purple-900' : 'bg-white border border-gray-200 text-gray-900'}`}>
            {msg.content}
          </div>
          {msg.isUser && (
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
              <span className="text-white font-bold text-lg">U</span>
            </div>
          )}
        </div>
      ))}
      {/* AI Typing Animation */}
      <div className="flex w-full justify-start items-start mt-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center mr-2 mt-1">
          <span className="text-white font-bold text-lg">AI</span>
        </div>
        <div className="relative max-w-[70%] bg-gray-50 text-gray-900 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl mr-8 px-4 py-3 shadow-sm flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full ai-typing-dot" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
    {/* Disabled input */}
    <div className="border-t px-4 py-3 bg-white/80 flex flex-col gap-3">
      {/* Only show the suggestion buttons, not a nav bar */}
      <div className="flex flex-row flex-wrap gap-3 justify-center mb-2">
        {[
          'What are the side effects of Lisinopril?',
          'What natural remedies can help with high blood pressure?',
          'How should I take my medication?',
          'Can you explain how my medication works?',
          'Are there any foods I should avoid?'
        ].map((q, i) => (
          <button
            key={q}
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 text-white text-sm font-medium shadow-md opacity-90 cursor-not-allowed border-none outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-300 hover:opacity-100 hover:shadow-lg"
            style={{ minWidth: '220px' }}
            tabIndex={-1}
          >
            <span>{q}</span>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 bg-gray-100 text-base text-gray-400 cursor-not-allowed"
          placeholder="Type your question here... (Demo only)"
          disabled
        />
        <button
          className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white h-10 w-10 rounded-full flex items-center justify-center opacity-60 cursor-not-allowed"
          disabled
          aria-label="Send message (disabled demo)"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  </div>
);

export default DemoChat;
