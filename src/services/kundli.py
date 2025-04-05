import requests
import json
from datetime import datetime
import pytz
import re

# Define your API keys and URLs
ASTROLOGY_API_KEY = 'zaVlYhqoy265wQW8q04mC4IDAa0gjgCo2sq1X2SD'
ASTROLOGY_API_URL = 'https://json.astrologyapi.com/v1/kundli'

GROQ_API_KEY = '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'
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'


# Function to generate Kundli data
def getKundliData(birth_date, birth_time, location):
    # Prepare the API request
    params = {
        'day': birth_date.day,
        'month': birth_date.month,
        'year': birth_date.year,
        'hour': birth_time.hour,
        'min': birth_time.minute,
        'lat': location['latitude'],
        'lon': location['longitude'],
        'tzone': location['timezone'],
    }

    headers = {
        'Authorization': f'Basic {ASTROLOGY_API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(ASTROLOGY_API_URL, json=params, headers=headers)
        response.raise_for_status()

        return response.json()  # Return the Kundli data in JSON format
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}


# Function to generate a concise Kundli summary using Groq API
def getResponseKundli(kundli_data):
    # Extract relevant information from the Kundli response
    # This extraction will depend on the actual structure of the API response
    # Adjust these extractions based on the actual API response structure
    try:
        planets_data = {}
        if 'planets' in kundli_data:
            planets_data = kundli_data['planets']
        
        sun_sign = next((planet['sign'] for planet in planets_data if planet['name'] == 'Sun'), 'Unknown')
        moon_sign = next((planet['sign'] for planet in planets_data if planet['name'] == 'Moon'), 'Unknown')
        ascendant = kundli_data.get('ascendant', {}).get('sign', 'Unknown')
        
        # Get moon nakshatra if available
        moon_nakshatra = next((planet.get('nakshatra', 'Unknown') for planet in planets_data if planet['name'] == 'Moon'), 'Unknown')
        
        # Construct a detailed prompt for Groq API
        query = f"""
        I need a concise but comprehensive Kundli (Hindu birth chart) analysis based on the following details:
        
        Sun Sign: {sun_sign}
        Moon Sign: {moon_sign}
        Ascendant (Lagna): {ascendant}
        Moon Nakshatra: {moon_nakshatra}
        
        Please provide:
        1. A brief explanation of what these placements mean for the person's personality and life path
        2. Key strengths and challenges based on these positions
        3. Any significant indications for career, relationships, or health
        4. A short prediction for the next 6-12 months
        
        Keep the tone positive and informative. Limit the response to a few paragraphs.5-6 lines.
        """

        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }

        data = {
            'model': 'llama-3.3-70b-specdec',
            'messages': [
                {'role': 'user', 'content': query}
            ],
            'max_tokens': 1024
        }

        # Send the request to Groq API to get the concise summary
        response = requests.post(GROQ_API_URL, headers=headers, json=data)
        response.raise_for_status()

        # Extract the response content from Groq
        response_data = response.json()
        return response_data.get('choices', [{}])[0].get('message', {}).get('content', 'No response generated.')

    except Exception as e:
        return f"Error generating Kundli summary: {e}"


# Function to parse birth details from user input using LLM
def parse_birth_details(user_input):
    # Use Groq LLM to extract structured birth details from user input
    headers = {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    prompt = f"""
    Extract birth details from the following user query in a structured JSON format:
    "{user_input}"
    
    Return only a valid JSON with these fields:
    - date: in DD-MM-YYYY format
    - time: in HH:MM format (24-hour)
    - location: city name
    - latitude: numerical latitude of the location
    - longitude: numerical longitude of the location
    - timezone: timezone offset from UTC

    Example response:
    {{
        "date": "12-01-2000",
        "time": "10:30",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "timezone": 5.5
    }}
    """

    data = {
        'model': 'llama-3.3-70b-specdec',
        'messages': [
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 500,
        'response_format': {'type': 'json_object'}
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=data)
        response.raise_for_status()
        
        llm_response = response.json()
        parsed_content = llm_response['choices'][0]['message']['content']
        
        # Parse the JSON response
        birth_details = json.loads(parsed_content)
        
        # Convert to appropriate format
        date_parts = birth_details['date'].split('-')
        birth_date = datetime(int(date_parts[2]), int(date_parts[1]), int(date_parts[0]))
        
        time_parts = birth_details['time'].split(':')
        birth_time = datetime.strptime(birth_details['time'], "%H:%M").time()
        
        location = {
            "latitude": birth_details['latitude'],
            "longitude": birth_details['longitude'],
            "timezone": birth_details['timezone']
        }
        
        return {
            "birth_date": birth_date,
            "birth_time": birth_time,
            "location": location,
            "location_name": birth_details['location']
        }
        
    except Exception as e:
        return {"error": f"Error parsing birth details: {str(e)}"}


# Function to process user query and generate Kundli response
def process_kundli_request(user_query):
    # Step 1: Parse the user's birth details from their query
    birth_details = parse_birth_details(user_query)
    
    if "error" in birth_details:
        return birth_details["error"]
    
    # Step 2: Get Kundli data from astrology API
    kundli_data = getKundliData(birth_details["birth_date"], birth_details["birth_time"], birth_details["location"])
    
    if "error" in kundli_data:
        return f"Error fetching Kundli data: {kundli_data['error']}"
    
    # Step 3: Generate a concise summary using Groq API
    summary = getResponseKundli(kundli_data)
    
    # Step 4: Format and return the response
    response = f"Kundli Analysis for birth on {birth_details['birth_date'].strftime('%d %b %Y')} at {birth_details['birth_time'].strftime('%H:%M')} in {birth_details['location_name']}:\n\n{summary}"
    
    return response


# Example usage

if __name__ == "__main__":
    import sys
    
    # Check if a command line argument was provided
    if len(sys.argv) > 1:
        # Join all command line arguments to form the query
        user_query = " ".join(sys.argv[1:])
    else:
        # If no arguments, ask for input
        print("Please enter your birth details (e.g., 'Generate my Kundli. My birth details: 12 Jan 2000, 10:30 AM, Mumbai.')")
        user_query = input("> ")
    
    print("Processing your Kundli request...")
    
    # Process the user query and generate Kundli response
    response = process_kundli_request(user_query)
    
    # Print the response
    print("\n" + response)
