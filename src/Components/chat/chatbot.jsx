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
import { stripChatMarkdown } from '@/utils/stripChatMarkdown';
import { getfilterData } from '@/store/reducer/momentSlice';

const ASSISTANT_ERROR_REPLY =
  "I'm your AI property assistant for Pakistan. That message didn't go through — please try again.\n\nAsk me about houses, flats, plots, budgets, or areas anytime.";

/** Long replies reveal gradually after the request finishes (API unchanged). */
const STREAM_CHARS_PER_TICK = 16;
const STREAM_TICK_MS = 32;
const STREAM_INSTANT_MAX_LEN = 160;

const ChatBot = ({ isOpen, onClose, onPropertyFound }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef(null);
  const streamTimerRef = useRef(null);

  const clearStreamTimer = () => {
    if (streamTimerRef.current != null) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  };

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
  }, [ isOpen ]);

  // Save messages whenever they change (skip mid-stream to avoid noisy writes)
  useEffect(() => {
    if (messages.length > 0 && !messages.some((m) => m.streaming)) {
      saveChatHistory(messages);
    }
  }, [messages]);

  useEffect(() => () => clearStreamTimer(), []);

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
    if (!input.trim() || isLoading || isStreaming) return;

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

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || data.error) {
        if (data.error) console.error("API Error:", data.error);
        else console.error("Chat HTTP error:", response.status, response.statusText);
        const errorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: ASSISTANT_ERROR_REPLY,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data.text) {
        const assistantId = Date.now() + 1;
        const fullText = data.text;

        if (data.searchSync && typeof data.searchSync === "object") {
          try {
            getfilterData(data.searchSync);
          } catch (_) {
            /* ignore */
          }
        }

        if (data.scrapePageLink && typeof window !== "undefined") {
          try {
            sessionStorage.setItem("chat_scrape_listing_url", data.scrapePageLink);
          } catch (_) {
            /* ignore */
          }
        }

        const base = {
          id: assistantId,
          role: "assistant",
          hasProperties: !!data.pageLink,
          pageLink: data.pageLink || null,
          dbListingMatch: !!data.dbListingMatch,
          listingsButtonLabel: data.dbListingMatch
            ? "View listings"
            : "View Listings",
          timestamp: new Date().toISOString(),
        };

        if (onPropertyFound && data.pageLink) {
          onPropertyFound({
            data: null,
            link: data.pageLink,
            params: data.params || null,
          });
        }

        if (fullText.length <= STREAM_INSTANT_MAX_LEN) {
          setMessages((prev) => [
            ...prev,
            { ...base, content: fullText, streaming: false },
          ]);
        } else {
          clearStreamTimer();
          setIsStreaming(true);
          setMessages((prev) => [
            ...prev,
            { ...base, content: "", streaming: true },
          ]);

          let pos = 0;
          const step = () => {
            pos = Math.min(fullText.length, pos + STREAM_CHARS_PER_TICK);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: fullText.slice(0, pos),
                      streaming: pos < fullText.length,
                    }
                  : m
              )
            );
            if (pos < fullText.length) {
              streamTimerRef.current = setTimeout(step, STREAM_TICK_MS);
            } else {
              streamTimerRef.current = null;
              setIsStreaming(false);
            }
          };
          streamTimerRef.current = setTimeout(step, STREAM_TICK_MS);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: ASSISTANT_ERROR_REPLY,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

    } catch (err) {
      console.error("Chat Error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: ASSISTANT_ERROR_REPLY,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearStreamTimer();
    setIsStreaming(false);
    clearChatHistory();
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: "👋 Chat cleared! How can I help you?",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleNewChat = () => {
    clearStreamTimer();
    setIsStreaming(false);
    clearChatHistory();
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: "👋 Starting fresh! How can I assist you with real estate today?",
      timestamp: new Date().toISOString()
    }]);
  };

  /** Splits assistant text on blank lines so multi-paragraph replies render like ChatGPT. */
  const renderAssistantText = (text) => {
    const parts = stripChatMarkdown(String(text || ""))
      .trim()
      .split(/\n\n+/)
      .filter(Boolean);
    if (!parts.length) return null;
    return parts.map((block, i) => (
      <p key={i} className="chat-msg-block">{block}</p>
    ));
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
            <h3 className="text-white">AI Real Estate Assistant</h3>
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="header-btn" onClick={handleNewChat} title="New Chat" aria-label="New Chat">
            <MessageCircle size={16} />
          </button>
          <button type="button" className="header-btn" onClick={handleClearChat} title="Clear History" aria-label="Clear History">
            <Trash2 size={16} />
          </button>
          <button type="button" className="header-btn" onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Maximize" : "Minimize"}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button type="button" className="header-btn close-btn" onClick={onClose} aria-label="Close chat">
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
                {m.role === "assistant" && m.hasProperties && m.pageLink && (
                  <a
                    href={m.pageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-btn chat-listings-link text-[#F1592A]"
                  >
                    {m.listingsButtonLabel || "View Listings"}
                  </a>
                )}
                {m.role === "assistant" ? renderAssistantText(m.content) : m.content}
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
          disabled={isLoading || isStreaming}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={isLoading || isStreaming || !input.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
          <span className="btn-tooltip">Send message</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;