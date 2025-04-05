import axios from 'axios';
import { mockNewsApi, isUsingMockApis } from './mockApiService';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Create axios instance with default config
const newsApi = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: NEWS_API_KEY
  }
});

/**
 * Fetches top headlines based on optional parameters
 * @param {Object} params - Query parameters
 * @param {string} params.country - Country code (default: 'us')
 * @param {string} params.category - Category (business, entertainment, health, science, sports, technology)
 * @param {string} params.q - Search query term
 * @returns {Promise<Object>} News data response
 */
export const fetchTopHeadlines = async (params = {}) => {
  try {
    // Use mock API if real API key is not available
    if (isUsingMockApis()) {
      console.log('Using mock News API');
      return await mockNewsApi.fetchTopHeadlines(params);
    }
    
    const defaultParams = {
      country: 'us',
      pageSize: 5,
      ...params
    };
    
    const response = await newsApi.get('/top-headlines', {
      params: defaultParams
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock News API');
      return await mockNewsApi.fetchTopHeadlines(params);
    }
    
    throw error;
  }
};

/**
 * Searches for news based on query
 * @param {string} query - Search query term
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} News data response
 */
export const searchNews = async (query, params = {}) => {
  try {
    // Use mock API if real API key is not available
    if (isUsingMockApis()) {
      console.log('Using mock News API for search');
      return await mockNewsApi.searchNews(query, params);
    }
    
    const defaultParams = {
      pageSize: 5,
      sortBy: 'publishedAt',
      language: 'en',
      ...params,
      q: query
    };
    
    const response = await newsApi.get('/everything', {
      params: defaultParams
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock News API for search');
      return await mockNewsApi.searchNews(query, params);
    }
    
    throw error;
  }
};

/**
 * Formats news articles into a readable message
 * @param {Array} articles - News articles
 * @returns {string} Formatted news message
 */
export const formatNewsResponse = (articles) => {
  if (!articles || articles.length === 0) {
    return "Sorry, I couldn't find any news articles matching your request.";
  }
  
  let formattedResponse = "Here are the latest headlines:\n\n";
  
  articles.forEach((article, index) => {
    formattedResponse += `${index + 1}) ${article.title}\n`;
    if (article.description) {
      formattedResponse += `${article.description.slice(0, 100)}...\n`;
    }
    if (index < articles.length - 1) {
      formattedResponse += '\n';
    }
  });
  
  return formattedResponse;
}; 