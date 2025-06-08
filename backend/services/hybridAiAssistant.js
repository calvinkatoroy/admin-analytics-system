// backend/services/hybridAiAssistant.js
// Combines OpenAI with offline fallback

const offlineAI = require('./offlineAiAssistant');

// Try to load OpenAI, but continue without it if unavailable
let OpenAI = null;
let openai = null;

try {
  OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI loaded successfully');
} catch (error) {
  console.log('⚠️ OpenAI not available:', error.message);
}

class HybridAIAssistant {
  constructor() {
    this.openaiAvailable = !!openai;
    this.fallbackCount = 0;
    this.successCount = 0;
  }

  async processQuery(question) {
    // First, try offline patterns for simple queries (faster)
    const quickResult = await this.tryQuickPatterns(question);
    if (quickResult) {
      console.log('🎯 Quick pattern match success');
      quickResult.mode = 'pattern_match';
      return quickResult;
    }

    // For complex queries, try OpenAI first
    if (this.openaiAvailable) {
      try {
        console.log('🤖 Trying OpenAI for complex query...');
        const openaiResult = await this.tryOpenAI(question);
        this.successCount++;
        openaiResult.mode = 'openai';
        return openaiResult;
      } catch (error) {
        console.log('❌ OpenAI failed:', error.message);
        
        // Check if it's a quota/rate limit error
        if (this.isQuotaError(error)) {
          console.log('💡 OpenAI quota exceeded, falling back to offline AI');
          this.fallbackCount++;
          
          const fallbackResult = await offlineAI.processQuery(question);
          fallbackResult.mode = 'offline_fallback';
          fallbackResult.explanation = `🧠 Offline AI: ${fallbackResult.explanation || fallbackResult.message}`;
          fallbackResult.note = 'OpenAI quota exceeded - using intelligent offline analysis';
          return fallbackResult;
        } else {
          console.log('🔄 OpenAI error, trying offline AI...');
          const fallbackResult = await offlineAI.processQuery(question);
          fallbackResult.mode = 'offline_backup';
          return fallbackResult;
        }
      }
    } else {
      // OpenAI not available, use offline
      console.log('🧠 Using offline AI (OpenAI not configured)');
      const result = await offlineAI.processQuery(question);
      result.mode = 'offline_only';
      return result;
    }
  }

  async tryQuickPatterns(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Quick patterns that don't need OpenAI
    const quickPatterns = [
      {
        keywords: ['help', 'what can you do', 'commands', 'how to use'],
        handler: this.getHelp.bind(this)
      },
      {
        keywords: ['status', 'health', 'working', 'online'],
        handler: this.getStatus.bind(this)
      }
    ];

    for (const pattern of quickPatterns) {
      const hasKeywords = pattern.keywords.some(keyword => 
        lowerQuestion.includes(keyword)
      );
      
      if (hasKeywords) {
        return await pattern.handler(question);
      }
    }

    return null; // No quick pattern match
  }

  async tryOpenAI(question) {
    const prompt = `
You are an AI assistant for an admin analytics dashboard. Convert this natural language question into actionable insights.

Database Collections Available:
- users: {email, username, role, isActive, lastLogin, loginCount, createdAt}
- activitylogs: {userId, action, resource, timestamp, success}
- products: {name, category, price, viewCount, purchaseCount, rating}

Question: "${question}"

Respond with a JSON object containing:
{
  "queryType": "aggregation",
  "collection": "collection_name", 
  "explanation": "Clear explanation of what you found",
  "insights": ["key insight 1", "key insight 2"],
  "recommendations": ["actionable recommendation"]
}

If you cannot determine a specific database query, provide general analytical guidance.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    });

    const aiResponse = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      // If OpenAI provided a database query, execute it
      if (parsedResponse.queryType && parsedResponse.collection) {
        const queryResult = await this.executeOpenAIQuery(parsedResponse);
        return {
          success: true,
          explanation: parsedResponse.explanation,
          data: queryResult,
          insights: parsedResponse.insights,
          recommendations: parsedResponse.recommendations,
          source: 'openai_query'
        };
      } else {
        // OpenAI provided general guidance
        return {
          success: true,
          explanation: parsedResponse.explanation || aiResponse,
          insights: parsedResponse.insights || [],
          recommendations: parsedResponse.recommendations || [],
          source: 'openai_guidance'
        };
      }
    } catch (parseError) {
      // If JSON parsing fails, return raw response
      return {
        success: true,
        explanation: aiResponse,
        source: 'openai_raw'
      };
    }
  }

  async executeOpenAIQuery(queryData) {
    // This would implement the actual database query execution
    // For now, fall back to offline AI for data retrieval
    console.log('📊 Executing OpenAI-generated query via offline AI');
    return await offlineAI.processQuery(queryData.explanation);
  }

  isQuotaError(error) {
    return (
      error.code === 'insufficient_quota' ||
      error.status === 429 ||
      (error.message && error.message.includes('quota')) ||
      (error.message && error.message.includes('rate limit'))
    );
  }

  async getHelp(question) {
    return {
      success: true,
      message: "🤖 AI Assistant Help Center",
      explanation: "Here's everything I can help you with:",
      data: {
        capabilities: [
          "👥 User Analytics - Registration trends, activity patterns, churn analysis",
          "📊 Product Insights - Trending items, category performance, conversion rates", 
          "📈 Business Intelligence - Growth metrics, KPIs, executive reports",
          "🔍 Custom Analysis - Natural language queries about your data",
          "⚠️ Smart Alerts - Anomaly detection and performance monitoring"
        ],
        examples: [
          "Show me users who registered this week but haven't logged in",
          "Which products are trending among new users?",
          "Generate a weekly executive report",
          "Find users at risk of churning",
          "What's our user growth rate this month?"
        ],
        modes: [
          this.openaiAvailable ? "🚀 OpenAI Mode: Advanced natural language understanding" : "❌ OpenAI: Not available",
          "🧠 Offline Mode: Fast pattern-based analysis",
          "🔄 Hybrid Mode: Best of both worlds with automatic fallback"
        ]
      }
    };
  }

  async getStatus(question) {
    return {
      success: true,
      message: "🟢 AI Assistant Status: Fully Operational",
      explanation: "All systems running smoothly with hybrid intelligence.",
      data: {
        openai: {
          available: this.openaiAvailable,
          success_rate: this.successCount + this.fallbackCount > 0 ? 
            Math.round((this.successCount / (this.successCount + this.fallbackCount)) * 100) : 100,
          status: this.openaiAvailable ? 'Connected' : 'Not configured'
        },
        offline: {
          available: true,
          status: 'Always ready',
          capabilities: 'Full analytics suite'
        },
        stats: {
          openai_queries: this.successCount,
          offline_fallbacks: this.fallbackCount,
          total_queries: this.successCount + this.fallbackCount
        }
      }
    };
  }

  // Direct access to offline AI for specific use cases
  async forceOfflineMode(question) {
    const result = await offlineAI.processQuery(question);
    result.mode = 'forced_offline';
    return result;
  }

  // Get system statistics
  getStats() {
    return {
      openai_available: this.openaiAvailable,
      openai_success: this.successCount,
      offline_fallbacks: this.fallbackCount,
      total_queries: this.successCount + this.fallbackCount,
      fallback_rate: this.successCount + this.fallbackCount > 0 ? 
        Math.round((this.fallbackCount / (this.successCount + this.fallbackCount)) * 100) : 0
    };
  }
}

module.exports = new HybridAIAssistant();