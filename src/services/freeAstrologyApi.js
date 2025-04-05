import axios from 'axios';
import { mockAstroApi, isUsingMockApis } from './mockApiService';

const FREE_ASTROLOGY_API_KEY = import.meta.env.VITE_FREE_ASTROLOGY_API_KEY;
const BASE_URL = 'https://json.freeastrologyapi.com';

// Create axios instance with default config
const astrologyApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': FREE_ASTROLOGY_API_KEY
  }
});

/**
 * Gets planetary positions for a specific date and time
 * @param {Object} birthDetails - Birth details
 * @param {number} birthDetails.year - Year of birth
 * @param {number} birthDetails.month - Month of birth
 * @param {number} birthDetails.date - Date of birth
 * @param {number} birthDetails.hours - Hour of birth
 * @param {number} birthDetails.minutes - Minutes of birth
 * @param {number} birthDetails.latitude - Latitude of birth place
 * @param {number} birthDetails.longitude - Longitude of birth place
 * @returns {Promise<Object>} Planetary positions
 */
export const getPlanetaryPositions = async (birthDetails) => {
  try {
    // Use mock API if real API key is not available or is a placeholder
    if (isUsingMockApis() || FREE_ASTROLOGY_API_KEY === 'your_astrology_api_key_here') {
      console.log('Using mock Astrology API for planetary positions');
      return await mockAstroApi.getBirthChart(birthDetails);
    }
    
    const { 
      year, month, date, hours, minutes, 
      latitude, longitude, seconds = 0, timezone = 5.5 
    } = birthDetails;
    
    const requestData = {
      year: parseInt(year),
      month: parseInt(month),
      date: parseInt(date),
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      seconds: parseInt(seconds),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone),
      settings: {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
    };
    
    const response = await astrologyApi.post('/planets', requestData);
    return response.data;
  } catch (error) {
    console.error('Error fetching planetary positions:', error);
    
    // Fallback to mock API if real API fails
    if (!isUsingMockApis()) {
      console.log('Falling back to mock Astrology API');
      return await mockAstroApi.getBirthChart(birthDetails);
    }
    
    throw error;
  }
};

/**
 * Gets birth chart data based on birth details
 * @param {Object} birthDetails - Birth details
 * @returns {Promise<Object>} Birth chart data
 */
export const getBirthChart = async (birthDetails) => {
  try {
    // Convert date format if necessary (YYYY-MM-DD to year, month, day)
    let formattedDetails = { ...birthDetails };
    
    // If date is in YYYY-MM-DD format, convert it
    if (birthDetails.date && typeof birthDetails.date === 'string' && birthDetails.date.includes('-')) {
      const [year, month, day] = birthDetails.date.split('-').map(num => parseInt(num));
      formattedDetails = {
        ...formattedDetails,
        year,
        month,
        date: day
      };
    }
    
    // If time is in HH:MM format, convert it
    if (birthDetails.time && typeof birthDetails.time === 'string' && birthDetails.time.includes(':')) {
      const [hours, minutes] = birthDetails.time.split(':').map(num => parseInt(num));
      formattedDetails = {
        ...formattedDetails,
        hours,
        minutes
      };
    }
    
    // Get planetary positions
    const planetaryData = await getPlanetaryPositions(formattedDetails);
    
    // Transform data to more user-friendly format
    return transformPlanetaryData(planetaryData);
  } catch (error) {
    console.error('Error generating birth chart:', error);
    throw error;
  }
};

/**
 * Transforms raw planetary data into a more usable format
 * @param {Object} data - Raw planetary data
 * @returns {Object} Transformed data
 */
function transformPlanetaryData(data) {
  if (!data || !data.planets) {
    return {
      planets: {},
      houses: {}
    };
  }
  
  const planets = {};
  const houses = {};
  
  // Process planets
  Object.entries(data.planets).forEach(([planet, info]) => {
    const planetName = planet.toLowerCase();
    const houseNumber = info.house || 1;
    
    planets[planetName] = {
      sign: getZodiacSign(info.longitude),
      house: houseNumber,
      longitude: info.longitude,
      retrograde: info.is_retrograde
    };
    
    // We can also construct houses based on planets
    if (!houses[houseNumber]) {
      houses[houseNumber] = {
        sign: getZodiacSign(info.longitude)
      };
    }
  });
  
  return {
    planets,
    houses
  };
}

/**
 * Gets zodiac sign based on longitude
 * @param {number} longitude - Longitude in degrees
 * @returns {string} Zodiac sign
 */
function getZodiacSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Each sign takes up 30 degrees of the 360-degree zodiac
  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
}

/**
 * Gets horoscope for a specific zodiac sign
 * We'll use mock data since the Free Astrology API doesn't offer daily horoscopes
 * @param {string} sign - Zodiac sign
 * @param {string} timeframe - Time period
 * @returns {Promise<Object>} Horoscope data
 */
export const getHoroscope = async (sign, timeframe = 'daily') => {
  try {
    console.log('Using mock data for horoscope');
    return await mockAstroApi.getHoroscope(sign, timeframe);
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    throw error;
  }
};

/**
 * Gets compatibility between two zodiac signs
 * We'll use mock data since the Free Astrology API doesn't offer compatibility
 * @param {string} sign1 - First zodiac sign
 * @param {string} sign2 - Second zodiac sign
 * @returns {Promise<Object>} Compatibility data
 */
export const getCompatibility = async (sign1, sign2) => {
  try {
    console.log('Using mock data for compatibility');
    return await mockAstroApi.getCompatibility(sign1, sign2);
  } catch (error) {
    console.error('Error fetching compatibility:', error);
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
          const retrograde = info.retrograde ? " (Retrograde)" : "";
          chartResponse += `• ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${info.sign} ${info.house ? `(House ${info.house})${retrograde}` : ''}\n`;
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