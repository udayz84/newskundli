/**
 * Extracts the intent and entities from a user message
 * @param {string} message - The user's message
 * @returns {Object} The extracted intent and entities
 */
export const extractIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  const result = {
    intent: 'general_question', // Default to general question for Groq LLM
    entities: {
      original_message: message // Store original message for context
    }
  };
  
  // News related intents - only if strongly indicated
  if (containsAny(lowerMessage, ['news about', 'headlines', 'latest news', 'news update', 'news report', 'news article'])) {
    result.intent = 'get_news';
    
    // Extract news category
    const categories = [
      'business', 'entertainment', 'general', 'health', 
      'science', 'sports', 'technology', 'politics', 'world'
    ];
    
    for (const category of categories) {
      if (lowerMessage.includes(category)) {
        result.entities.category = category;
        break;
      }
    }
    
    // Extract country if mentioned
    const countries = {
      'us': ['usa', 'united states', 'america'],
      'in': ['india', 'indian'],
      'gb': ['uk', 'united kingdom', 'britain', 'england'],
      'au': ['australia', 'australian'],
      'ca': ['canada', 'canadian'],
      'jp': ['japan', 'japanese']
    };
    
    for (const [code, names] of Object.entries(countries)) {
      if (containsAny(lowerMessage, names)) {
        result.entities.country = code;
        break;
      }
    }
    
    // Extract search terms - anything that might be specific
    const searchTerms = message.match(/"([^"]+)"|'([^']+)'|about\s+([a-zA-Z0-9\s]+)/);
    if (searchTerms) {
      const term = searchTerms[1] || searchTerms[2] || searchTerms[3];
      if (term && term.trim()) {
        result.entities.query = term.trim();
      }
    }
  }
  
  // Astrology related intents - only if strongly indicated
  else if (containsAny(lowerMessage, ['my horoscope', 'zodiac sign', 'astrology reading', 'kundli', 'birth chart', 'compatibility between'])) {
    // Check for compatibility intent
    if (lowerMessage.includes('compatibility') || lowerMessage.includes('compatible')) {
      result.intent = 'get_compatibility';
      
      // Try to extract two signs
      const signs = extractZodiacSigns(lowerMessage);
      if (signs.length >= 2) {
        result.entities.sign1 = signs[0];
        result.entities.sign2 = signs[1];
      }
    }
    // Check for birth chart intent
    else if (lowerMessage.includes('birth chart') || lowerMessage.includes('birth details') || 
             lowerMessage.includes('natal chart') || lowerMessage.includes('kundli')) {
      result.intent = 'get_birth_chart';
      
      // Extract date (simple pattern matching, would need more sophisticated parsing in production)
      const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/);
      if (dateMatch) {
        result.entities.date = dateMatch[1];
      }
      
      // Extract time
      const timeMatch = message.match(/\b(\d{1,2}:\d{2}(:\d{2})?(\s*[ap]m)?)\b/i);
      if (timeMatch) {
        result.entities.time = timeMatch[1];
      }
      
      // We'd need more sophisticated extraction for latitude/longitude
      // For simplicity, we're not implementing that here
    }
    // Default to horoscope intent
    else {
      result.intent = 'get_horoscope';
      
      // Extract sign
      const signs = extractZodiacSigns(lowerMessage);
      if (signs.length > 0) {
        result.entities.sign = signs[0];
      }
      
      // Extract timeframe
      if (lowerMessage.includes('daily') || lowerMessage.includes('today')) {
        result.entities.timeframe = 'daily';
      } else if (lowerMessage.includes('weekly') || lowerMessage.includes('week')) {
        result.entities.timeframe = 'weekly';
      } else if (lowerMessage.includes('monthly') || lowerMessage.includes('month')) {
        result.entities.timeframe = 'monthly';
      }
    }
  }
  
  // Math-related questions should go to Groq LLM
  else if (containsMathOperations(lowerMessage)) {
    result.intent = 'general_question';
    result.entities.is_math = true;
  }
  
  return result;
};

/**
 * Helper function to check if a string contains any of the given terms
 * @param {string} str - The string to check
 * @param {Array<string>} terms - The terms to look for
 * @returns {boolean} Whether the string contains any of the terms
 */
function containsAny(str, terms) {
  return terms.some(term => str.includes(term));
}

/**
 * Helper function to check if a string contains math operations
 * @param {string} str - The string to check
 * @returns {boolean} Whether the string contains math operations
 */
function containsMathOperations(str) {
  // Check for patterns like "2+2", "5 * 3", "what is 7 divided by 2", etc.
  return /[\d\s\+\-\*\/\=]/.test(str) || 
         /what is \d+[\s\+\-\*\/]\d+/.test(str) || 
         /calculate/.test(str) || 
         /\b\d+\s*(\+|\-|plus|minus|times|divided by)\s*\d+/.test(str);
}

/**
 * Extracts zodiac signs from a string
 * @param {string} str - The string to extract from
 * @returns {Array<string>} The extracted signs
 */
function extractZodiacSigns(str) {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return signs.filter(sign => str.includes(sign));
} 