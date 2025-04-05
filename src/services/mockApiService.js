/**
 * Mock API service for testing without real API keys
 * This can be used when the real APIs are not available or for development purposes
 */

// Mock news data
const mockNewsArticles = [
  {
    title: "Global Markets Rally as Economic Outlook Improves",
    description: "Stock markets worldwide showed strong gains as new economic data suggests a robust recovery in major economies.",
    url: "https://example.com/news/1",
    publishedAt: new Date().toISOString()
  },
  {
    title: "New Climate Agreement Signed by 45 Nations",
    description: "In a historic summit, 45 countries agreed to reduce carbon emissions by 40% before 2030, marking a significant step in climate action.",
    url: "https://example.com/news/2",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Breakthrough in Renewable Energy Technology",
    description: "Scientists have developed a new solar panel technology that increases efficiency by 34%, potentially revolutionizing renewable energy.",
    url: "https://example.com/news/3",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Major Sports Championship Reaches Exciting Final Stage",
    description: "After weeks of competition, the championship final will feature two unexpected teams following dramatic semifinal matches.",
    url: "https://example.com/news/4",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Health Researchers Report Promising Treatment Results",
    description: "Clinical trials for a new treatment show 78% efficacy in early tests, giving hope for patients with previously untreatable conditions.",
    url: "https://example.com/news/5",
    publishedAt: new Date().toISOString()
  }
];

// Mock horoscope data
const mockHoroscopes = {
  aries: {
    sign: "Aries",
    date: new Date().toLocaleDateString(),
    horoscope: "Today brings exciting opportunities for growth in your career. Mars, your ruling planet, gives you extra energy to tackle challenges. Be confident in your decisions.",
    lucky_number: "7",
    mood: "Energetic"
  },
  taurus: {
    sign: "Taurus",
    date: new Date().toLocaleDateString(),
    horoscope: "Financial matters take a positive turn today. Venus influences stability in your life, making this a good time for long-term planning and investments.",
    lucky_number: "6",
    mood: "Determined"
  },
  gemini: {
    sign: "Gemini",
    date: new Date().toLocaleDateString(),
    horoscope: "Your communication skills are at their peak. Mercury's position makes this an excellent day for important conversations, presentations, or networking events.",
    lucky_number: "3",
    mood: "Expressive"
  },
  // Add other signs as needed
};

// Mock compatibility data
const mockCompatibility = {
  aries: {
    taurus: {
      compatibility: {
        sign1: "Aries",
        sign2: "Taurus",
        overall: 65,
        emotional: 60,
        intellectual: 70,
        physical: 80,
        description: "Aries and Taurus create an interesting dynamic of fire and earth. While Aries brings passion and spontaneity, Taurus offers stability and reliability. They can balance each other well if they respect their different approaches to life."
      }
    },
    gemini: {
      compatibility: {
        sign1: "Aries",
        sign2: "Gemini",
        overall: 85,
        emotional: 75,
        intellectual: 90,
        physical: 85,
        description: "Aries and Gemini share a vibrant, energetic connection. Both signs value independence and have a zest for life. Their relationship is marked by excitement, intellectual stimulation, and constant activity."
      }
    }
    // Add other combinations as needed
  }
};

// Mock API calls
export const mockNewsApi = {
  fetchTopHeadlines: async (params = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter by category if provided
    let articles = [...mockNewsArticles];
    if (params.category) {
      // Just return all for mock, but in real we would filter
    }
    
    return {
      status: "ok",
      totalResults: articles.length,
      articles
    };
  },
  
  searchNews: async (query, params = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock filtering by query
    const articles = mockNewsArticles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) || 
      article.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      status: "ok",
      totalResults: articles.length,
      articles
    };
  }
};

export const mockAstroApi = {
  getHoroscope: async (sign, timeframe = 'daily') => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return horoscope for given sign or default to Aries
    return mockHoroscopes[sign.toLowerCase()] || mockHoroscopes.aries;
  },
  
  getCompatibility: async (sign1, sign2) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Normalize signs to lowercase
    const s1 = sign1.toLowerCase();
    const s2 = sign2.toLowerCase();
    
    // Try to find the compatibility data
    if (mockCompatibility[s1] && mockCompatibility[s1][s2]) {
      return mockCompatibility[s1][s2];
    } else if (mockCompatibility[s2] && mockCompatibility[s2][s1]) {
      return mockCompatibility[s2][s1];
    }
    
    // Return default data if not found
    return {
      compatibility: {
        sign1: sign1,
        sign2: sign2,
        overall: 75,
        emotional: 70,
        intellectual: 80,
        physical: 75,
        description: "These signs generally have good compatibility. They share some key values and can build a strong relationship with understanding and communication."
      }
    };
  },
  
  getBirthChart: async (birthDetails) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock birth chart data
    return {
      planets: {
        sun: { sign: "Gemini", house: 10 },
        moon: { sign: "Cancer", house: 11 },
        mercury: { sign: "Taurus", house: 9 },
        venus: { sign: "Cancer", house: 11 },
        mars: { sign: "Leo", house: 12 },
        jupiter: { sign: "Virgo", house: 1 },
        saturn: { sign: "Aquarius", house: 6 }
      },
      houses: {
        "1": { sign: "Virgo" },
        "2": { sign: "Libra" },
        "3": { sign: "Scorpio" },
        "4": { sign: "Sagittarius" },
        "5": { sign: "Capricorn" },
        "6": { sign: "Aquarius" },
        "7": { sign: "Pisces" },
        "8": { sign: "Aries" },
        "9": { sign: "Taurus" },
        "10": { sign: "Gemini" },
        "11": { sign: "Cancer" },
        "12": { sign: "Leo" }
      }
    };
  }
};

// Helper function to decide whether to use real or mock APIs
export const isUsingMockApis = () => {
  // If environment variable is set to explicitly use mock APIs, honor that
  const forceMockApis = import.meta.env.VITE_USE_MOCK_APIS === 'true';
  if (forceMockApis) {
    return true;
  }
  
  // Check if the API keys are missing or equal to the placeholder values
  const newsApiKey = import.meta.env.VITE_NEWS_API_KEY;
  const astroApiKey = import.meta.env.VITE_ASTRO_DATA_API_KEY;
  
  return !newsApiKey || 
         !astroApiKey || 
         newsApiKey === 'your_newsapi_key_here' || 
         astroApiKey === 'your_astrodataapi_key_here';
}; 