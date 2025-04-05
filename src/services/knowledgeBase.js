/**
 * Simple knowledge base for common factual questions
 * This provides quick responses to frequently asked questions
 * without needing to call the LLM API
 */

const knowledgeBase = {
  // People and founders
  'who is the founder of google': 'Google was founded by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in 1998.',
  'who founded google': 'Google was founded by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in 1998.',
  'who created google': 'Google was created by Larry Page and Sergey Brin in 1998.',
  'who made google': 'Google was created by Larry Page and Sergey Brin in 1998.',
  
  'who is the founder of apple': 'Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976.',
  'who founded apple': 'Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976.',
  
  'who is the founder of microsoft': 'Microsoft was founded by Bill Gates and Paul Allen in 1975.',
  'who founded microsoft': 'Microsoft was founded by Bill Gates and Paul Allen in 1975.',
  
  'who is the founder of amazon': 'Amazon was founded by Jeff Bezos in 1994.',
  'who founded amazon': 'Amazon was founded by Jeff Bezos in 1994.',
  
  'who is the founder of facebook': 'Facebook (now Meta) was founded by Mark Zuckerberg along with Eduardo Saverin, Andrew McCollum, Dustin Moskovitz, and Chris Hughes in 2004.',
  'who founded facebook': 'Facebook (now Meta) was founded by Mark Zuckerberg along with Eduardo Saverin, Andrew McCollum, Dustin Moskovitz, and Chris Hughes in 2004.',
  
  'who is the founder of tesla': 'Tesla was founded by Martin Eberhard and Marc Tarpenning in 2003. Elon Musk joined in 2004 as an investor and later became CEO.',
  'who founded tesla': 'Tesla was founded by Martin Eberhard and Marc Tarpenning in 2003. Elon Musk joined in 2004 as an investor and later became CEO.',
  
  // Countries and capitals
  'capital of usa': 'The capital of the United States is Washington, D.C.',
  'capital of united states': 'The capital of the United States is Washington, D.C.',
  'what is the capital of usa': 'The capital of the United States is Washington, D.C.',
  
  'capital of india': 'The capital of India is New Delhi.',
  'what is the capital of india': 'The capital of India is New Delhi.',
  
  'capital of uk': 'The capital of the United Kingdom is London.',
  'capital of united kingdom': 'The capital of the United Kingdom is London.',
  'what is the capital of uk': 'The capital of the United Kingdom is London.',
  
  // Basic science facts
  'water boiling point': 'The boiling point of water is 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure.',
  'what is the boiling point of water': 'The boiling point of water is 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure.',
  
  'distance from earth to moon': 'The average distance from Earth to the Moon is about 384,400 kilometers (238,855 miles).',
  'how far is the moon': 'The average distance from Earth to the Moon is about 384,400 kilometers (238,855 miles).',
  
  // Tech terms
  'what is ai': 'AI (Artificial Intelligence) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.',
  'what is artificial intelligence': 'Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.',
  
  'what is machine learning': 'Machine Learning is a subset of AI that enables a system to learn from data rather than through explicit programming.',
  
  'what is deep learning': 'Deep Learning is a subset of machine learning that uses neural networks with many layers (hence "deep") to analyze various factors of data.',
};

/**
 * Checks if there's a direct knowledge base answer for a query
 * @param {string} query - The query to check
 * @returns {string|null} The answer or null if not found
 */
export const getKnowledgeBaseAnswer = (query) => {
  if (!query) return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (knowledgeBase[normalizedQuery]) {
    return knowledgeBase[normalizedQuery];
  }
  
  // Check for partial matches (simple contains)
  for (const [key, value] of Object.entries(knowledgeBase)) {
    // If the key is contained in the query or vice versa
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return value;
    }
  }
  
  return null;
};

export default {
  getKnowledgeBaseAnswer
}; 