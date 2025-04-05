import requests

# Replace with your actual API key
API_KEY = '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'

# Groq API URL - using the correct endpoint for chat completions
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

def getResponse(user_query):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    # Payload with the correct format for Groq Chat API
    data = {
        'model': 'llama-3.3-70b-specdec',  # Updated to use a model available in free tier
        'messages': [
            {'role': 'user', 'content': user_query}
        ],
        'max_tokens': 1024  # Adjust as needed
    }

    # Sending the request to the Groq API
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

def getNews(input_query):
    # Function to fetch news based on the input query
    # This implementation is placeholder - replace with actual news API integration
    try:
        # Example implementation - replace with actual news API
        # Could use NewsAPI, GDELT, or another news service
        NEWS_API_URL = "https://newsapi.org/v2/everything"
        NEWS_API_KEY = "0bbe7b7adfed4ba282d26545688c313e"  # Replace with actual API key
        
        params = {
            "q": input_query,
            "apiKey": NEWS_API_KEY,
            "pageSize": 5,
            "language": "en"
        }
        
        response = requests.get(NEWS_API_URL, params=params)
        
        if response.status_code == 200:
            news_data = response.json()
            
            # Format the news data into readable snippets
            snippets = ""
            for i, article in enumerate(news_data.get("articles", []), 1):
                title = article.get("title", "No title")
                description = article.get("description", "No description")
                url = article.get("url", "#")
                published_at = article.get("publishedAt", "Unknown date")
                
                snippet = f"""### {i}. {title}
{description}
[Read more]({url})
Published: {published_at}

"""
                snippets += snippet
            
            return snippets if snippets else "No news found for this query."
        else:
            return f"Error fetching news: {response.status_code}"
    except Exception as e:
        return f"An error occurred while fetching news: {str(e)}"

def getResponseNews(input_query):
    # First get the news based on the input query
    news_snippets = getNews(input_query)
    
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    prompt = f"""Analyze these news snippets and create a concise 5-line summary that starts with "As of...":

{news_snippets}

Your summary should highlight the key facts, trends, and developments mentioned in these articles. Keep it brief and informative."""

    # Payload for Groq Chat API
    data = {
        'model': 'llama-3.3-70b-specdec',
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 256
    }

    # Sending the request to the Groq API
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
    query = "tell about indian history"
    response = getResponse(query)
    print("Groq LLM Response:", response)
    
    # Modified to use input query for news
    news_query = "Tesla"
    news_summary = getResponseNews(news_query)
    print("\nGroq News Summary:", news_summary)
