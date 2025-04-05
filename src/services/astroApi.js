import axios from 'axios';
import { mockAstroApi, isUsingMockApis } from './mockApiService';

const ASTRO_API_KEY = import.meta.env.VITE_ASTRO_DATA_API_KEY;
const ASTRO_API_USER_ID = import.meta.env.VITE_ASTRO_DATA_API_USER_ID;
const BASE_URL = 'https://astrodataapi.com/api/v1';

// Create axios instance with default config
const astroApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ASTRO_API_KEY}`,
    'User-ID': ASTRO_API_USER_ID,
    'Content-Type': 'application/json'
  }
});

/**
 * Gets the horoscope for a specific zodiac sign
 * @param {string} sign - Zodiac sign (e.g., 'aries', 'taurus')
 * @param {string} timeframe - Time period ('daily', 'weekly', 'monthly')
 * @returns {Promise<Object>} Horoscope data
 */
export const getHoroscope = async (sign, timeframe = 'daily') => {
  try {
    // Use mock API if real API key is not available
    if (isUsingMockApis()) {
      console.log('Using mock Astro API for horoscope');
      return await mockAstroApi.getHoroscope(sign, timeframe);
    }
    
    const response = await astroApi.get(`/horoscope/${timeframe}/${sign}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock Astro API for horoscope');
      return await mockAstroApi.getHoroscope(sign, timeframe);
    }
    
    throw error;
  }
};

/**
 * Gets birth chart data based on birth details
 * @param {Object} birthDetails - Birth details
 * @param {string} birthDetails.date - Birth date (YYYY-MM-DD)
 * @param {string} birthDetails.time - Birth time (HH:MM)
 * @param {number} birthDetails.latitude - Latitude of birth place
 * @param {number} birthDetails.longitude - Longitude of birth place
 * @returns {Promise<Object>} Birth chart data
 */
export const getBirthChart = async (birthDetails) => {
  try {
    // Use mock API if real API key is not available
    if (isUsingMockApis()) {
      console.log('Using mock Astro API for birth chart');
      return await mockAstroApi.getBirthChart(birthDetails);
    }
    
    const response = await astroApi.post('/birth-chart', birthDetails);
    return response.data;
  } catch (error) {
    console.error('Error fetching birth chart:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock Astro API for birth chart');
      return await mockAstroApi.getBirthChart(birthDetails);
    }
    
    throw error;
  }
};

/**
 * Gets compatibility between two zodiac signs
 * @param {string} sign1 - First zodiac sign
 * @param {string} sign2 - Second zodiac sign
 * @returns {Promise<Object>} Compatibility data
 */
export const getCompatibility = async (sign1, sign2) => {
  try {
    // Use mock API if real API key is not available
    if (isUsingMockApis()) {
      console.log('Using mock Astro API for compatibility');
      return await mockAstroApi.getCompatibility(sign1, sign2);
    }
    
    const response = await astroApi.get(`/compatibility/${sign1}/${sign2}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching compatibility:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock Astro API for compatibility');
      return await mockAstroApi.getCompatibility(sign1, sign2);
    }
    
    throw error;
  }
};

/**
 * Formats astrological data into a readable message
 * @param {Object} data - Astrological data
 * @param {string} type - Type of data ('horoscope', 'birthChart', 'compatibility')
 * @returns {string} Formatted message
 */
export const formatAstroResponse = (data, type) => {
  if (!data) {
    return "Sorry, I couldn't retrieve the astrological information you requested.";
  }
  
  switch (type) {
    case 'horoscope':
      return `${data.sign} - ${data.date || 'Today'}\n\n${data.horoscope}\n\nLucky Number: ${data.lucky_number}\nMood: ${data.mood}`;
      
    case 'birthChart':
      let chartResponse = "Here's your birth chart analysis:\n\n";
      
      // Format planets
      if (data.planets && Object.keys(data.planets).length > 0) {
        chartResponse += "Planetary Positions:\n";
        Object.entries(data.planets).forEach(([planet, info]) => {
          chartResponse += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${info.sign} ${info.house ? `(House ${info.house})` : ''}\n`;
        });
      }
      
      // Format houses
      if (data.houses && Object.keys(data.houses).length > 0) {
        chartResponse += "\nHouses:\n";
        Object.entries(data.houses).slice(0, 4).forEach(([house, info]) => {
          chartResponse += `• House ${house}: ${info.sign}\n`;
        });
        chartResponse += "...and more";
      }
      
      return chartResponse;
      
    case 'compatibility':
      return `Compatibility between ${data.compatibility.sign1} and ${data.compatibility.sign2}:\n\n` +
             `Overall: ${data.compatibility.overall}%\n` +
             `Emotional: ${data.compatibility.emotional}%\n` +
             `Intellectual: ${data.compatibility.intellectual}%\n` +
             `Physical: ${data.compatibility.physical}%\n\n` +
             `${data.compatibility.description}`;
      
    default:
      return JSON.stringify(data, null, 2);
  }
}; 