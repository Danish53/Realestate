// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User, Sparkles } from 'lucide-react';

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!input.trim() || isLoading) return;

//   // 1. User ka message object (ID ke saath)
//   const userMessage = { id: Date.now(), role: "user", content: input };
//   setMessages(prev => [...prev, userMessage]);
//   setInput("");
//   setIsLoading(true); // Loading start karein

//   try {
//     const response = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ messages: [...messages, userMessage] })
//     });

//     const data = await response.json();

//     if (data.text) {
//       // 2. Assistant ka message add karein (ID ke saath)
//       setMessages(prev => [...prev, { 
//         id: Date.now() + 1, 
//         role: "assistant", 
//         content: data.text 
//       }]);
//     } else if (data.error) {
//        alert("Error: " + data.error);
//     }
//   } catch (err) {
//     console.error("Chat Error:", err);
//   } finally {
//     setIsLoading(false); // Loading khatam
//   }
// };


//   return (
//     <div className="flex flex-col h-[600px] max-w-2xl mx-auto my-10 bg-dark shadow-xl rounded-2xl overflow-hidden border border-gray-100">
//       <div className="p-4 bg-blue-600 text-dark flex items-center gap-2 shadow-md">
//         <Sparkles size={20} />
//         <h2 className="font-semibold">Gemini AI Assistant</h2>
//       </div>

//       <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//         {messages.map((m) => (
//           <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${m.role === 'user' ? 'bg-blue-500' : 'bg-indigo-600'}`}>
//                 {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
//               </div>
//               <div className={`p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-dark border text-gray-800 rounded-tl-none'}`}>
//                 {m.content}
//               </div>
//             </div>
//           </div>
//         ))}
//         {isLoading && <div className="text-xs text-gray-400 animate-bounce">Gemini is thinking...</div>}
//       </div>

//       <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2 bg-white">
//         <input
//           className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-black transition-all"
//           value={input}
//           placeholder="Type your message..."
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button type="submit" disabled={isLoading || !input} className="bg-blue-600 text-dark p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg">
//           <Send size={20} />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;




import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, X, MessageCircle, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { saveChatHistory, loadChatHistory, clearChatHistory } from '@/utils/chatStorage';

const ChatBot = ({ isOpen, onClose, onPropertyFound }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history when component mounts
  useEffect(() => {
    const savedMessages = loadChatHistory();
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else if (isOpen) {
      // Welcome message only if no history
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: "👋 Hello! I'm your AI Real Estate Assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!input.trim() || isLoading) return;

  //   const userMessage = { 
  //     id: Date.now(), 
  //     role: "user", 
  //     content: input,
  //     timestamp: new Date().toISOString()
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setInput("");
  //   setIsLoading(true);

  //   try {
  //     const response = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ 
  //         messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content }))
  //       })
  //     });

  //     const data = await response.json();

  //     if (data.text) {
  //       const assistantMessage = { 
  //         id: Date.now() + 1, 
  //         role: "assistant", 
  //         content: data.text,
  //         timestamp: new Date().toISOString()
  //       };
  //       setMessages(prev => [...prev, assistantMessage]);
  //     } else if (data.error) {
  //       alert("Error: " + data.error);
  //     }
  //   } catch (err) {
  //     console.error("Chat Error:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content }))
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("API Error:", data.error);
        const errorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, something went wrong while fetching results. Please try again.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data.text) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.text,                 // clean AI text
          hasProperties: !!data.pageLink,     // true if property search
          pageLink: data.pageLink || null,    // URL from backend
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // optional: parent callback agar aap use karna chahen
        if (onPropertyFound && data.pageLink) {
          onPropertyFound({
            data: null,
            link: data.pageLink,
            params: data.params || null
          });
        }
      }

    } catch (err) {
      console.error("Chat Error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Network error occurred. Please check your connection and try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: "👋 Chat cleared! How can I help you?",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleNewChat = () => {
    clearChatHistory();
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: "👋 Starting fresh! How can I assist you with real estate today?",
      timestamp: new Date().toISOString()
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Chat Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <div className="header-icon">
            <Sparkles size={12} />
          </div>
          <div className="header-info">
            <h3>AI Real Estate Assistant</h3>
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={handleNewChat} title="New Chat">
            <MessageCircle size={16} />
          </button>
          <button className="header-btn" onClick={handleClearChat} title="Clear History">
            <Trash2 size={16} />
          </button>
          <button className="header-btn" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button className="header-btn close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`message-wrapper ${m.role}`}>
            <div className="message-avatar">
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {m.content}

                {m.hasProperties && m.pageLink && (
                  <a
                    href={m.pageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-btn"
                  >
                    View Full Property Listings
                  </a>
                )}
              </div>

              <span className="message-time">
                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          className="chat-input"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} />
          <span className="btn-tooltip">Send message</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;