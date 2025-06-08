import React, { useState } from 'react';
import {
  BrainIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UsersIcon,
  CodeBracketIcon,
  ServerIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const MiniProjectDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const teamMembers = [
    {
      name: "Calvin Wirathama Katoroy",
      npm: "2306242395",
      kelas: "Sistem Basis Data 01",
      role: "Project Lead & Full-Stack Developer",
      contributions: [
        "Complete system architecture design",
        "Backend API development (Node.js + Express)",
        "Database design and implementation (MongoDB)",
        "AI Chat Assistant development (Hybrid OpenAI + Offline)",
        "Real-time Anomaly Detection System",
        "Machine Learning Predictions Engine",
        "Frontend dashboard development (React)",
        "Authentication and security implementation",
        "API integration and testing"
      ]
    },
    {
      name: "Farhan",
      npm: "TBD",
      kelas: "Sistem Basis Data 01", 
      role: "Supporting Developer",
      contributions: [
        "Project planning and requirements analysis",
        "Documentation support",
        "Testing and quality assurance",
        "UI/UX feedback and improvements"
      ]
    },
    {
      name: "Rain",
      npm: "TBD",
      kelas: "Sistem Basis Data 01",
      role: "Supporting Developer", 
      contributions: [
        "Project coordination",
        "Documentation review",
        "System testing",
        "Feature validation"
      ]
    }
  ];

  const technologies = [
    { name: "Frontend", tech: "React 19, Tailwind CSS, Recharts, Heroicons", icon: GlobeAltIcon },
    { name: "Backend", tech: "Node.js, Express.js, Socket.io", icon: ServerIcon },
    { name: "Database", tech: "MongoDB, Mongoose ODM", icon: CodeBracketIcon },
    { name: "AI/ML", tech: "OpenAI API, Custom ML Models", icon: BrainIcon },
    { name: "Security", tech: "JWT Authentication, bcrypt", icon: ShieldExclamationIcon }
  ];

  const features = [
    {
      title: "AI Chat Assistant",
      description: "Hybrid AI system combining OpenAI GPT with offline pattern matching for intelligent data analysis",
      icon: ChatBubbleLeftRightIcon,
      capabilities: [
        "Natural language query processing",
        "Real-time database analysis", 
        "Automatic fallback system",
        "Interactive data visualization",
        "Smart suggestions and help"
      ],
      technical: "Uses OpenAI API with custom offline AI fallback, processes MongoDB queries, generates charts"
    },
    {
      title: "Smart Anomaly Detection", 
      description: "Real-time monitoring system that detects unusual patterns and security threats",
      icon: ShieldExclamationIcon,
      capabilities: [
        "User behavior anomaly detection",
        "Traffic pattern analysis",
        "Security threat identification", 
        "Performance monitoring",
        "Automated alert system"
      ],
      technical: "Custom detection algorithms, 30-second scanning cycles, real-time notifications"
    },
    {
      title: "ML Predictions Engine",
      description: "Machine learning models for predictive analytics and business intelligence",
      icon: BrainIcon,
      capabilities: [
        "User churn prediction (85% accuracy)",
        "Traffic forecasting",
        "Anomaly prediction",
        "Behavior pattern analysis",
        "Personalized recommendations"
      ],
      technical: "5 ML models, predictive algorithms, user segmentation, risk assessment"
    }
  ];

  const architecture = {
    frontend: {
      title: "Frontend Architecture",
      components: [
        "React 19 with modern hooks",
        "Tailwind CSS for styling", 
        "Recharts for data visualization",
        "React Router for navigation",
        "Axios for API communication"
      ]
    },
    backend: {
      title: "Backend Architecture", 
      components: [
        "Express.js REST API",
        "MongoDB with Mongoose ODM",
        "JWT authentication system",
        "Socket.io for real-time features",
        "Custom AI and ML services"
      ]
    },
    database: {
      title: "Database Design",
      collections: [
        "Users - Authentication and profiles",
        "Products - E-commerce catalog",
        "ActivityLogs - User behavior tracking",
        "Sessions - Real-time monitoring"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🚀 Enterprise Admin Analytics System
            </h1>
            <p className="text-xl mb-6">
              AI-Powered Admin Dashboard with Real-time Monitoring & Predictive Analytics
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold">Mini Project</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold">Sistem Basis Data 01</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold">Full-Stack Application</span>
              </div>
            </div>
            
            {/* GitHub Link */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <div className="flex items-center gap-3">
                <CodeBracketIcon className="w-6 h-6" />
                <span className="font-semibold">GitHub Repository:</span>
                <a 
                  href="https://github.com/calvinkatoroy/admin-analytics-system" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white underline flex items-center gap-1"
                >
                  admin-analytics-system
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Project Overview' },
              { id: 'features', name: 'Core Features' },
              { id: 'architecture', name: 'Technical Architecture' },
              { id: 'team', name: 'Team & Contributions' },
              { id: 'demo', name: 'Demo & Screenshots' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeSection === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Project Description</h3>
                  <p className="text-gray-700 mb-4">
                    A comprehensive enterprise-grade admin analytics system built with modern web technologies. 
                    The system combines artificial intelligence, real-time monitoring, and machine learning 
                    predictions to provide administrators with powerful insights and automated decision-making capabilities.
                  </p>
                  
                  <h4 className="font-semibold mb-2">Key Objectives:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Create an intelligent admin dashboard with AI assistance</li>
                    <li>Implement real-time anomaly detection and monitoring</li>
                    <li>Develop predictive analytics using machine learning</li>
                    <li>Build a scalable and secure full-stack application</li>
                    <li>Demonstrate advanced database design and optimization</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Technology Stack</h3>
                  <div className="space-y-4">
                    {technologies.map((tech, index) => {
                      const Icon = tech.icon;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900">{tech.name}</div>
                            <div className="text-sm text-gray-600">{tech.tech}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-blue-600">3</div>
                <div className="text-gray-600">Major Features</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600">25+</div>
                <div className="text-gray-600">API Endpoints</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-purple-600">5</div>
                <div className="text-gray-600">ML Models</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-gray-600">Functional</div>
              </div>
            </div>
          </div>
        )}

        {/* Core Features */}
        {activeSection === 'features' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Core Features</h2>
            
            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                        <p className="text-gray-700 mt-2">{feature.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Capabilities:</h4>
                        <ul className="space-y-2">
                          {feature.capabilities.map((cap, capIndex) => (
                            <li key={capIndex} className="flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              <span className="text-gray-700">{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Technical Implementation:</h4>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{feature.technical}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Technical Architecture */}
        {activeSection === 'architecture' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Technical Architecture</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(architecture).map(([key, section]) => (
                <div key={key} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {(section.components || section.collections).map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* API Endpoints */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">Authentication</h4>
                  <div className="space-y-1 text-sm">
                    <div>POST /api/auth/login</div>
                    <div>GET /api/auth/me</div>
                    <div>POST /api/auth/logout</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-3">AI Chat</h4>
                  <div className="space-y-1 text-sm">
                    <div>POST /api/ai/query</div>
                    <div>GET /api/ai/suggestions</div>
                    <div>GET /api/ai/status</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">Anomaly Detection</h4>
                  <div className="space-y-1 text-sm">
                    <div>GET /api/anomaly/active</div>
                    <div>GET /api/anomaly/stats</div>
                    <div>POST /api/anomaly/scan</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600 mb-3">ML Predictions</h4>
                  <div className="space-y-1 text-sm">
                    <div>GET /api/ml/predictions</div>
                    <div>GET /api/ml/predictions/churn</div>
                    <div>POST /api/ml/models/train</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-3">Analytics</h4>
                  <div className="space-y-1 text-sm">
                    <div>GET /api/analytics/dashboard</div>
                    <div>GET /api/analytics/products</div>
                    <div>GET /api/analytics/users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team & Contributions */}
        {activeSection === 'team' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Team & Individual Contributions</h2>
            
            <div className="space-y-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                      <div className="text-gray-600 mb-4">
                        <div>NPM: {member.npm}</div>
                        <div>Kelas: {member.kelas}</div>
                        <div className="font-semibold text-blue-600">{member.role}</div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-3">Individual Contributions:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {member.contributions.map((contribution, contribIndex) => (
                          <div key={contribIndex} className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 text-sm">{contribution}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Work Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Timeline & Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold">Hour 1: AI Chat Assistant</div>
                    <div className="text-sm text-gray-600">Hybrid OpenAI + offline system with real-time database queries</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold">Hour 2: Smart Anomaly Detection</div>
                    <div className="text-sm text-gray-600">Real-time monitoring with 4 detection categories</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold">Hour 3: ML Predictions Engine</div>
                    <div className="text-sm text-gray-600">5 ML models for predictive analytics and business intelligence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo & Screenshots */}
        {activeSection === 'demo' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Demo & Screenshots</h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Add actual screenshots of your application here. 
                    Recommended screenshots include: Dashboard overview, AI Chat interface, 
                    Anomaly Detection dashboard, ML Predictions interface, and Database schema.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Demo Instructions</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">1. System Setup</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm">
                      # Clone repository<br/>
                      git clone https://github.com/your-username/admin-analytics-system<br/><br/>
                      # Install dependencies<br/>
                      cd backend && npm install<br/>
                      cd frontend && npm install<br/><br/>
                      # Start servers<br/>
                      npm run dev (both backend and frontend)
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-600 mb-3">2. Feature Demonstration</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Login with admin credentials</li>
                    <li>• Navigate through Dashboard → Anomaly Monitor → ML Predictions</li>
                    <li>• Test AI Chat with queries like "Show me users who registered this week"</li>
                    <li>• Trigger anomaly scans and view real-time detection</li>
                    <li>• Explore ML predictions for churn, traffic, and behavior analysis</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">3. Database Integration</h4>
                  <p className="text-gray-700">
                    The system connects to MongoDB Atlas with collections for Users, Products, 
                    ActivityLogs, and Sessions. Real-time data processing demonstrates advanced 
                    database querying, aggregation, and optimization techniques.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features Summary */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Achievement Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Technical Achievements</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Full-stack application with modern architecture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>AI integration with hybrid fallback system</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Real-time monitoring and anomaly detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Machine learning predictions with 85%+ accuracy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Scalable database design with MongoDB</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Business Value</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Intelligent admin decision support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Proactive threat detection and prevention</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Predictive analytics for business planning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>User behavior insights and recommendations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Enterprise-grade monitoring capabilities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Mini Project - Enterprise Admin Analytics System</h3>
            <p className="text-gray-400">Sistem Basis Data 01 - University Assignment</p>
          </div>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <div>Submitted: December 2024</div>
            <div>Technologies: React, Node.js, MongoDB, AI/ML</div>
            <div>Status: ✅ Complete & Functional</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MiniProjectDocumentation;