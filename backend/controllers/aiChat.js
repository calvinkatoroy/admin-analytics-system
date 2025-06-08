// backend/controllers/aiChat.js
// Updated to use hybrid AI system

const hybridAI = require('../services/hybridAiAssistant');

exports.processQuery = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question to analyze.",
        explanation: "I need a question to help you with your analytics."
      });
    }

    console.log(`🤖 Processing query: "${question}"`);
    
    // Use hybrid AI - it will automatically try OpenAI first, then fallback to offline
    const result = await hybridAI.processQuery(question);
    
    // Add some metadata about the response
    result.timestamp = new Date().toISOString();
    result.query = question;
    
    // Log the mode used for debugging
    console.log(`✅ Query processed using: ${result.mode}`);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ AI Controller Error:', error);
    
    // Even if everything fails, provide a helpful response
    res.status(500).json({
      success: false,
      message: "I'm experiencing technical difficulties, but I'm still here to help!",
      explanation: "There was a temporary issue with my analysis systems. Please try rephrasing your question or ask something simpler.",
      data: {
        error: "system_temporarily_unavailable",
        suggestions: [
          "Try asking about user registration trends",
          "Ask about product performance",
          "Request a simple analytics query",
          "Type 'help' to see what I can do"
        ]
      },
      mode: 'error_recovery'
    });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    // Get system stats to show in suggestions
    const stats = hybridAI.getStats();
    
    const suggestions = [
      "Show me users who registered this week but haven't logged in",
      "Which products are trending among new users?", 
      "How many users were active today?",
      "What's the most popular product category?",
      "Find inactive users who need re-engagement",
      "Generate a weekly performance report",
      "Show me growth metrics for this month",
      "Create an executive dashboard summary",
      "Help me understand my user behavior patterns",
      "What should I focus on to improve engagement?"
    ];

    res.json({ 
      suggestions,
      system: {
        mode: 'hybrid',
        openai_available: stats.openai_available,
        total_queries: stats.total_queries,
        fallback_rate: stats.fallback_rate,
        status: 'All systems operational'
      },
      help: {
        basic_queries: suggestions.slice(0, 5),
        advanced_queries: suggestions.slice(5),
        meta_commands: [
          "help - Show detailed capabilities",
          "status - Check system status",
          "what can you do - List all features"
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Suggestions Error:', error);
    
    // Fallback suggestions even if system check fails
    res.json({
      suggestions: [
        "Show me users who registered this week",
        "Which products are trending?",
        "How many users were active today?",
        "Help me analyze my data"
      ],
      system: {
        mode: 'basic',
        status: 'Limited functionality'
      }
    });
  }
};

// New endpoint to check AI system status
exports.getStatus = async (req, res) => {
  try {
    const stats = hybridAI.getStats();
    const statusResult = await hybridAI.processQuery('status');
    
    res.json({
      ...statusResult,
      stats,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Status check failed",
      error: error.message
    });
  }
};

// Endpoint to force offline mode (for testing)
exports.forceOffline = async (req, res) => {
  try {
    const { question } = req.body;
    const result = await hybridAI.forceOfflineMode(question);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Offline mode failed",
      error: error.message
    });
  }
};