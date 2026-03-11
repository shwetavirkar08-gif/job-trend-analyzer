import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { MessageCircle, Send, X, Bot, User, Briefcase, FileText, TrendingUp, Target } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI assistant. I can help you with resume analysis, job matching, skill suggestions, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const quickReplies = [
    { text: "How to upload resume?", icon: FileText },
    { text: "Find matching jobs", icon: Briefcase },
    { text: "Skill suggestions", icon: Target },
    { text: "Market trends", icon: TrendingUp },
    { text: "Track skill progress", icon: Target }
  ];

  const handleQuickReply = (text) => {
    handleUserMessage(text);
  };

  const handleUserMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await axios.post('/api/chatbot/message', { message });
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: res.data?.response || 'Sorry, I could not understand that.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleUserMessage(inputValue);
    }
  };

  return ReactDOM.createPortal(
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 animate-fade-in"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2147483647 }}
        title="Chat with AI Assistant"
        aria-label="Open AI Chatbot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="w-96 h-[500px] bg-white dark:bg-secondary-800 rounded-lg shadow-xl border border-gray-200 dark:border-secondary-700 flex flex-col animate-slide-up"
          style={{ position: 'fixed', bottom: 96, right: 24, zIndex: 2147483647 }}
        >
          {/* Header */}
          <div className="bg-blue-600 dark:bg-secondary-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">AI Career Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-gray-100 text-gray-800 dark:bg-secondary-700 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="whitespace-pre-line">{message.content}</div>
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-secondary-700 text-gray-800 dark:text-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick replies:</div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => {
                  const Icon = reply.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply.text)}
                      className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-secondary-700 dark:hover:bg-secondary-600 dark:text-gray-100 text-xs px-2 py-1 rounded-full transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{reply.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-secondary-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about the site or jobs..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 disabled:bg-gray-300 dark:disabled:bg-secondary-600 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>,
    document.body
  );
};

export default Chatbot;
