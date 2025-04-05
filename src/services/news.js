/**
 * JavaScript wrapper for the Python news.py getNews function
 */

// Function to fetch news from the Python backend
export const getNews = async (query) => {
  try {
    // Make a call to the Python backend
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error calling News API:', error);
    
    // Fallback response in case of error
    return "I'm having trouble accessing the news service right now. Please try again later.";
  }
};

// Function to fetch news summary using LLM from the Python backend
export const getResponseNews = async (query) => {
  try {
    // Make a call to the Python backend
    const response = await fetch('/api/news-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error calling News Summary API:', error);
    
    // Fallback response in case of error
    return "I'm having trouble generating a news summary right now. Please try again later.";
  }
}; 