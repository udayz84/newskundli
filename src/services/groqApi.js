import axios from 'axios';
import { getKnowledgeBaseAnswer } from './knowledgeBase';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

console.log('Groq API Key present:', GROQ_API_KEY ? '✓' : '✗');
console.log('Groq API Key placeholder check:', GROQ_API_KEY === 'your_groq_api_key_here' ? 'Is placeholder' : 'Not placeholder');

// Create axios instance with default config
const groqApi = axios.create({
  baseURL: GROQ_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`
  }
});

/**
 * Generates a conversational response using Groq LLM API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options
 * @returns {Promise<string>} LLM generated response
 */
export const generateResponse = async (messages, options = {}) => {
  try {
    console.log('Starting generateResponse with message:', messages[messages.length - 1]?.content);
    
    // Get the user's message
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Check knowledge base first for factual questions
    const knowledgeBaseAnswer = getKnowledgeBaseAnswer(userMessage);
    if (knowledgeBaseAnswer) {
      console.log('Found answer in knowledge base:', knowledgeBaseAnswer.substring(0, 50) + '...');
      return knowledgeBaseAnswer;
    }
    
    // Check if the message is a simple math question that we can handle without calling the API
    if (isMathQuestion(userMessage)) {
      console.log('Message identified as math question');
      const mathResult = attemptToSolveMath(userMessage);
      if (mathResult !== null) {
        console.log('Solved math question locally:', mathResult);
        return mathResult;
      }
    }

    // Check if API key is available
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      console.log('Using mock response instead of Groq API - key missing or placeholder');
      return generateMockResponse(userMessage);
    }
    
    console.log('Valid Groq API key detected, proceeding with API call');
    
    // Use mixtral model which is more stable
    const requestData = {
      model: options.model || 'llama3-8b-8192',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 800,
      top_p: options.top_p || 1,
      stream: false
    };
    
    console.log('Sending request to Groq API with model:', requestData.model);
    console.log('Messages being sent:', JSON.stringify(messages));
    
    try {
      console.log('Making POST request to Groq API');
      const response = await groqApi.post('', requestData);
      console.log('Groq API response received:', response.status);
      
      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0 && 
          response.data.choices[0].message) {
        
        const responseText = response.data.choices[0].message.content;
        console.log('Received valid response from Groq API:', responseText.substring(0, 50) + '...');
        return responseText;
      } else {
        console.error('Invalid response format from Groq API:', JSON.stringify(response.data));
        throw new Error('Invalid response format from Groq API');
      }
    } catch (apiError) {
      console.error('API call to Groq failed:', apiError.message);
      if (apiError.response) {
        console.error('Error details:', apiError.response.data);
        console.error('Status code:', apiError.response.status);
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating response with Groq API:', error.message);
    // If there's an error with Groq API, fall back to mock response
    console.log('Falling back to mock response due to error');
    return generateMockResponse(messages[messages.length - 1]?.content || '');
  }
};

/**
 * Checks if a message is a simple math question
 * @param {string} message - The message to check
 * @returns {boolean} Whether the message is a math question
 */
function isMathQuestion(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common math question patterns
  return /what is \d+\s*[\+\-\*\/]\s*\d+/.test(lowerMessage) ||
         /\b\d+\s*[\+\-\*\/]\s*\d+\b/.test(lowerMessage) ||
         /calculate \d+\s*[\+\-\*\/]\s*\d+/.test(lowerMessage) ||
         /\b\d+\s*(plus|minus|times|divided by)\s*\d+\b/.test(lowerMessage);
}

/**
 * Attempts to solve a simple math question
 * @param {string} message - The math question
 * @returns {string|null} The answer or null if couldn't solve
 */
function attemptToSolveMath(message) {
  const lowerMessage = message.toLowerCase();
  
  // Extract numbers and operation
  let matchResult = lowerMessage.match(/(\d+)\s*\+\s*(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) + parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s*\-\s*(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) - parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s*\*\s*(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) * parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s*\/\s*(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) / parseInt(matchResult[2])}`;
  }
  
  // Handle word-based operations
  matchResult = lowerMessage.match(/(\d+)\s+plus\s+(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) + parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s+minus\s+(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) - parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s+times\s+(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) * parseInt(matchResult[2])}`;
  }
  
  matchResult = lowerMessage.match(/(\d+)\s+divided\s+by\s+(\d+)/);
  if (matchResult) {
    return `${parseInt(matchResult[1]) / parseInt(matchResult[2])}`;
  }
  
  // Specific pattern for "what is X+Y" questions
  matchResult = lowerMessage.match(/what is (\d+)\s*[\+\-\*\/]\s*(\d+)/);
  if (matchResult) {
    const num1 = parseInt(matchResult[1]);
    const num2 = parseInt(matchResult[2]);
    const operation = lowerMessage.includes('+') ? '+' : 
                        lowerMessage.includes('-') ? '-' : 
                        lowerMessage.includes('*') ? '*' : '/';
    
    switch(operation) {
      case '+': return `${num1 + num2}`;
      case '-': return `${num1 - num2}`;
      case '*': return `${num1 * num2}`;
      case '/': return `${num1 / num2}`;
    }
  }
  
  return null;
}

/**
 * Generates a mock response when Groq API is unavailable
 * @param {string} userMessage - The last user message
 * @returns {string} A mock response
 */
function generateMockResponse(userMessage) {
  // Simple keyword-based response system
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Try to solve math problems first
  if (isMathQuestion(lowerCaseMessage)) {
    const mathResult = attemptToSolveMath(lowerCaseMessage);
    if (mathResult !== null) {
      return mathResult;
    }
  }
  
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
    return "Hello! I'm your AI assistant. How can I help you today?";
  } else if (lowerCaseMessage.includes('help')) {
    return "I can help you with news updates, horoscopes, and birth chart readings. What would you like to know?";
  } else if (lowerCaseMessage.includes('thank')) {
    return "You're welcome! Feel free to ask if you need anything else.";
  } else if (lowerCaseMessage.includes('news')) {
    return "I can provide you with the latest news updates. Which category interests you? Technology, business, sports, entertainment, or general news?";
  } else if (lowerCaseMessage.includes('horoscope')) {
    return "I'd be happy to give you a horoscope reading. Which zodiac sign would you like to know about?";
  } else if (lowerCaseMessage.includes('birth chart') || lowerCaseMessage.includes('kundli')) {
    return "For a personalized birth chart reading, I'll need your birth date, time, and location. Could you provide these details?";
  } else if (lowerCaseMessage.includes('2+2') || lowerCaseMessage.match(/what is 2\s*\+\s*2/)) {
    return "4";
  } else if (lowerCaseMessage.includes('weather')) {
    return "I don't have access to real-time weather data, but I can help you with news and astrology information!";
  } else if (lowerCaseMessage.includes('time')) {
    return "I don't have access to the current time, but I'm here to help with news updates and astrological insights.";
  } else {
    return "I understand you're asking about something, but I'm not sure what specific information you need. Could you please provide more details or clarify your question?";
  }
}

/**
 * Formats a query for the Groq API based on user input and context
 * @param {string} userMessage - User's message
 * @param {Array} chatHistory - Previous messages in the conversation
 * @returns {Array} Formatted messages for Groq API
 */
export const formatGroqQuery = (userMessage, chatHistory = []) => {
  // Start with system message that establishes the AI's role
  const systemMessage = {
    role: "system",
    content: `You are NewsKundli AI, a helpful chatbot that provides information about news and astrology.
You must keep responses friendly, concise, and helpful. When asked about news, mention that you can provide 
the latest headlines. When asked about astrology, mention that you can provide horoscopes, compatibility 
readings, and birth chart analysis. Maintain a balanced, informative tone. You must avoid generating random
characters or nonsensical text. Always provide meaningful responses.`
  };
  
  // Format the chat history
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.isBot ? "assistant" : "user",
    content: msg.text
  }));
  
  // Add the current user message
  const currentUserMessage = {
    role: "user",
    content: userMessage
  };
  
  // Combine all messages
  return [systemMessage, ...formattedHistory, currentUserMessage];
}; 