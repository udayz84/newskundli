/**
 * JavaScript wrapper for the Python llm.py getResponse function
 */

// Function to fetch a response from the Python backend
export const getResponse = async (userQuery) => {
  try {
    // Make a call to the Python backend
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userQuery }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    
    // Fallback response in case of error
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}; 