import requests

# Define the News API URL and API key
NEWS_API_KEY = '0bbe7b7adfed4ba282d26545688c313e'
NEWS_API_URL = 'https://newsapi.org/v2/everything'

# Groq API URL - using the correct endpoint for chat completions
GROQ_API_KEY = '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'
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'


# Function to fetch news from the News API
def getNews(query):
    # Prepare the parameters for the API request
    params = {
        'q': query,            # Query parameter for the search term (input)
        'apiKey': NEWS_API_KEY, # API key for authorization
        'language': 'en',       # Optional: You can specify language (default is English)
        'pageSize': 5,          # Optional: Number of results to return (limit to 5 articles)
    }

    try:
        response = requests.get(NEWS_API_URL, params=params)
        response.raise_for_status()  # Raise an exception for any HTTP errors

        # Parse the JSON response
        data = response.json()

        # Check if there are articles in the response
        if data.get('status') == 'ok' and data.get('articles'):
            articles = data['articles']
            news_data = []
            
            # Extract relevant information from each article
            for article in articles:
                news_data.append({
                    'description': article['description'],
                    'publishedAt': article['publishedAt'],
                })

            return news_data
        else:
            return "No articles found for the given query."
    except requests.exceptions.RequestException as e:
        return f"An error occurred while fetching the news: {e}"


# Function to generate a response from the Groq LLM API
def getResponseNews(user_query):
    headers = {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    # Prepare the prompt to send to the LLM
    prompt = f"Here is the latest news about '{user_query}':\n\n"

    # Fetch the news data
    news_data = getNews(user_query)
    
    if isinstance(news_data, list):  # If the result is a list of articles
        for idx, article in enumerate(news_data, 1):
            prompt += f"Article {idx}:\n"
            prompt += f"Description: {article['description']}\n"
            prompt += f"Published At: {article['publishedAt']}\n\n"
    else:
        return news_data  # Return the error message if no news was found

    # Add a directive for the model to focus on summaries (ignoring URLs) and provide a concise response
    prompt += "\nBased on the news above, provide a concise 5-line summary (ignore URLs). Focus on descriptions and dates.generate a summary of the news in a concise manner."

    # Payload for the Groq API
    data = {
        'model': 'llama-3.3-70b-specdec',  # Model used for the response generation
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 1024  # Adjust as needed
    }

    # Send the request to the Groq API
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=data)
        
        # Check if the response status is OK (200)
        if response.status_code == 200:
            response_data = response.json()
            return response_data.get('choices', [{}])[0].get('message', {}).get('content', 'No response data received.')
        else:
            return f"Error: {response.status_code}, {response.text}"
    except Exception as e:
        return f"An error occurred: {str(e)}"


# Example usage
if __name__ == "__main__":
    query = input("Enter a topic to get news and insights: ")
    response = getResponseNews(query)
    print(response)
