import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aiAPI } from '../services/api';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hello Admin! I'm your smart AI assistant. I can analyze users, products, and generate reports.",
      formatted: {
        type: 'welcome',
        quickHelp: [
          'Type "help" to see what I can do',
          'Ask "show all queries" for examples',
          'Try: "Show me users who registered this week"'
        ]
      },
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQueries = [
    // User Analytics
    "Show me users who registered this week but haven't logged in",
    "Which users are most active today?",
    "Find users who haven't logged in for 30 days",
    "Show me admin users and their last login",
    "How many new users registered this month?",
    
    // Product Analytics  
    "Which products are trending among new users?",
    "What's the most popular product category?",
    "Show me products with zero views",
    "Which products have the highest conversion rate?",
    "Find products added this week",
    
    // Business Intelligence
    "What's our user growth rate this month?",
    "Show me peak activity hours",
    "Which day of the week has most registrations?",
    "Compare this week's activity to last week",
    "Show me user retention rate",
    
    // Operational Queries
    "Are there any security issues I should know about?",
    "Show me recent error logs",
    "Which features are used most by admins?",
    "Find users with suspicious activity patterns",
    "Alert me about unusual login locations",
    
    // Custom Reports
    "Generate a weekly user activity report",
    "Create a product performance summary",
    "Show me key metrics for board meeting",
    "Export user data for marketing team",
    "Create alerts for system anomalies"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatResponse = (result) => {
    if (result.data && Array.isArray(result.data)) {
      const items = result.data;
      
      // Product data
      if (items.length > 0 && items[0].name && items[0].viewCount) {
        return {
          type: 'products',
          summary: `📊 Found ${items.length} products. Top: ${items[0].name} (${items[0].viewCount} views)`,
          chartData: items.slice(0, 5).map(item => ({
            name: item.name?.substring(0, 15) || 'Unknown',
            views: item.viewCount || 0
          })),
          details: items.slice(0, 3).map(item => 
            `• ${item.name} - ${item.viewCount} views, ${item.purchaseCount || 0} purchases`
          )
        };
      }
      
      // User data
      if (items.length > 0 && (items[0].username || items[0].email)) {
        const inactive = items.filter(u => !u.lastLogin).length;
        return {
          type: 'users',
          summary: `👥 Found ${items.length} users. ${inactive} haven't logged in yet.`,
          details: items.slice(0, 5).map(user => {
            const name = user.username || user.email || 'Unknown User';
            const email = user.email || 'No email';
            const status = user.lastLogin ? '✅ Has logged in' : '❌ Never logged in';
            const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date';
            return `• ${name} (${email}) - ${status} - Registered: ${created}`;
          })
        };
      }
    }

    // Generic data
    if (result.data && typeof result.data === 'object') {
      return {
        type: 'metrics',
        summary: result.explanation || "Here's your data:",
        details: Object.entries(result.data).map(([key, value]) => `• ${key}: ${value}`)
      };
    }

    return {
      type: 'text',
      summary: result.explanation || result.message || "Analysis complete!",
      details: []
    };
  };

  const sendMessage = async (message = input) => {
    if (!message.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Handle meta-queries locally (help, show queries, etc.)
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('commands')) {
      const helpMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "🤖 Here's what I can help you with:",
        formatted: {
          type: 'help',
          categories: [
            {
              title: '👥 User Analytics',
              examples: [
                'Show me users who registered this week',
                'Find inactive users',
                'Which users are most active?'
              ]
            },
            {
              title: '📊 Product Insights', 
              examples: [
                'Which products are trending?',
                'Show me best selling categories',
                'Find products with low views'
              ]
            },
            {
              title: '📈 Business Intelligence',
              examples: [
                'Generate weekly report',
                'Show growth metrics',
                'Compare this month to last month'
              ]
            }
          ]
        },
        success: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, helpMessage]);
      setLoading(false);
      return;
    }
    
    if (lowerMessage.includes('show') && (lowerMessage.includes('queries') || lowerMessage.includes('all') || lowerMessage.includes('commands') || lowerMessage.includes('examples'))) {
      const queriesMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "💡 Here are some example queries you can try:",
        formatted: {
          type: 'queries',
          list: quickQueries.slice(0, 10)
        },
        success: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, queriesMessage]);
      setLoading(false);
      return;
    }
    
    if (lowerMessage.includes('what') && (lowerMessage.includes('data') || lowerMessage.includes('database') || lowerMessage.includes('information'))) {
      const dataMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "📊 I can access and analyze:",
        formatted: {
          type: 'data',
          sources: [
            '👥 User data: registrations, logins, activity, profiles',
            '🛍️ Product data: views, purchases, categories, ratings',
            '📈 Activity logs: all user actions and timestamps',
            '🎯 Analytics: trends, patterns, conversions, metrics'
          ]
        },
        success: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, dataMessage]);
      setLoading(false);
      return;
    }

    // If it's a regular analytics query, send to backend
    try {
      const response = await aiAPI.query(message);
      const result = response.data;
      
      const formatted = formatResponse(result);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: formatted.summary,
        formatted: formatted,
        success: result.success,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `❌ Error: ${error.response?.data?.message || error.message}. Try asking about users, products, or analytics data.`,
        formatted: {
          type: 'suggestions',
          list: [
            'Show me users who registered this week',
            'Which products are trending?',
            'How many users were active today?'
          ]
        },
        success: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useQuery = (query) => {
    setInput(query);
    sendMessage(query);
  };

  const renderFormatted = (formatted) => {
    if (!formatted) return null;

    // Handle help response
    if (formatted.type === 'help') {
      return (
        <div className="mt-3">
          {formatted.categories.map((category, i) => (
            <div key={i} className="mb-3 bg-blue-50 p-3 rounded">
              <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px' }}>
                {category.title}
              </div>
              {category.examples.map((example, j) => (
                <button
                  key={j}
                  onClick={() => useQuery(example)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    padding: '4px 8px',
                    margin: '2px 0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: '#3B82F6'
                  }}
                >
                  💬 {example}
                </button>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Handle queries list
    if (formatted.type === 'queries') {
      return (
        <div className="mt-3 bg-green-50 p-3 rounded">
          <div style={{ display: 'grid', gap: '3px' }}>
            {formatted.list.map((query, i) => (
              <button
                key={i}
                onClick={() => useQuery(query)}
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#059669'
                }}
              >
                💡 {query}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Handle data sources
    if (formatted.type === 'data') {
      return (
        <div className="mt-3 bg-purple-50 p-3 rounded">
          {formatted.sources.map((source, i) => (
            <div key={i} style={{ fontSize: '12px', margin: '4px 0', color: '#7C3AED' }}>
              {source}
            </div>
          ))}
        </div>
      );
    }

    // Handle suggestions
    if (formatted.type === 'suggestions') {
      return (
        <div className="mt-3 bg-yellow-50 p-3 rounded">
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#D97706' }}>
            💡 Try these instead:
          </div>
          {formatted.list.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => useQuery(suggestion)}
              style={{
                display: 'block',
                background: 'white',
                border: '1px solid #FCD34D',
                padding: '4px 8px',
                margin: '2px 0',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#D97706'
              }}
            >
              🎯 {suggestion}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-3">
        {/* Chart for products */}
        {formatted.type === 'products' && formatted.chartData && (
          <div className="bg-blue-50 p-3 rounded mb-2">
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatted.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Details list */}
        {formatted.details && formatted.details.length > 0 && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs space-y-1">
              {formatted.details.map((detail, i) => (
                <div key={i} className="text-gray-700">{detail}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: '#3B82F6',
          color: 'white',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="AI Assistant"
      >
        <ChatBubbleLeftRightIcon style={{ width: '24px', height: '24px' }} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      width: '380px',
      height: '450px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: '600' }}>AI Assistant</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showGuide ? 'Hide' : 'Show'} Guide
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {/* Guide */}
      {showGuide && (
        <div style={{
          background: '#F8FAFC',
          padding: '12px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            🤖 AI Capabilities - Ask me anything!
          </div>
          
          <div style={{ display: 'grid', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280' }}>👥 User Analytics:</div>
            {quickQueries.slice(0, 2).map((query, index) => (
              <button
                key={index}
                onClick={() => useQuery(query)}
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#3B82F6'
                }}
              >
                💡 {query.length > 35 ? query.substring(0, 35) + '...' : query}
              </button>
            ))}
            
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', marginTop: '4px' }}>📊 Product Insights:</div>
            {quickQueries.slice(5, 7).map((query, index) => (
              <button
                key={index + 2}
                onClick={() => useQuery(query)}
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#10B981'
                }}
              >
                📈 {query.length > 35 ? query.substring(0, 35) + '...' : query}
              </button>
            ))}
            
            <div style={{ 
              fontSize: '11px', 
              color: '#6B7280', 
              fontStyle: 'italic',
              marginTop: '6px',
              padding: '4px 8px',
              background: '#FEF3C7',
              borderRadius: '4px'
            }}>
              💡 Try: "Generate weekly report", "Find security issues", "Show growth metrics", "Create custom alerts"
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '280px',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: message.type === 'user' 
                  ? '#3B82F6' 
                  : message.success === false 
                  ? '#FEF2F2' 
                  : '#F3F4F6',
                color: message.type === 'user' 
                  ? 'white' 
                  : message.success === false 
                  ? '#DC2626' 
                  : '#374151'
              }}
            >
              <div>{message.content}</div>
              {message.formatted && renderFormatted(message.formatted)}
              <div style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '8px'
              }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              backgroundColor: '#F3F4F6',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #3B82F6',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span>🧠 Analyzing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: 'white',
        borderRadius: '0 0 12px 12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            style={{
              flex: 1,
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              outline: 'none'
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 12px',
              cursor: 'pointer',
              opacity: (!input.trim() || loading) ? 0.5 : 1
            }}
          >
            <PaperAirplaneIcon style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIChatAssistant;