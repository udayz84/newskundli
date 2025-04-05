# NewsKundli AI Chatbot

A responsive chatbot front-end that provides real-time news updates and personalized kundli readings, enhanced with Groq LLM capabilities.

## Features

- **AI-Powered Conversations**: Natural language understanding and generation using Groq's LLM API
- **News Updates**: Get the latest news headlines using NewsAPI
- **Kundli Readings**: Receive personalized astrological insights using the Free Astrology API
- **Birth Chart Analysis**: Detailed planetary positions and houses using accurate astronomical calculations
- **Modern UI**: Responsive design with smooth animations and subtle dark theme
- **Interactive Experience**: Real-time typing animations and intuitive conversation flow

## Technologies Used

- React (v19)
- Styled Components
- Framer Motion
- FontAwesome Icons
- Axios
- Groq LLM API (Llama 3)
- Flask (Python backend)

## API Integrations

- [Groq](https://groq.com/) - For AI-powered conversational responses
- [NewsAPI](https://newsapi.org/) - For fetching latest news
- [Free Astrology API](https://freeastrologyapi.com/) - For detailed planetary positions and birth charts
- [Astro-Data API](https://astrodataapi.com/) - Alternative for astrological data (fallback)

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_NEWS_API_KEY=your_newsapi_key_here
   VITE_FREE_ASTROLOGY_API_KEY=your_astrology_api_key_here
   VITE_ASTRO_DATA_API_KEY=your_astrodataapi_key_here
   VITE_ASTRO_DATA_API_USER_ID=your_astrodataapi_user_id_here
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
5. Start the Python backend server:
   ```
   python server.py
   ```
6. In a separate terminal, start the development server:
   ```
   npm run dev
   ```

## Getting API Keys

### Groq
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for an account
3. Generate an API key from your dashboard

### NewsAPI
1. Visit [NewsAPI](https://newsapi.org/)
2. Sign up for a free account
3. Generate an API key from your dashboard

### Free Astrology API
1. Visit [Free Astrology API](https://freeastrologyapi.com/)
2. Sign up for an account
3. Get your API key from your dashboard

### Astro-Data API (Alternative)
1. Visit [Astro-Data API](https://astrodataapi.com/)
2. Sign up for an account
3. Get your API key and User ID from your dashboard

## Usage

The chatbot supports various types of queries:

- **General conversation**: The chatbot uses Groq's LLM API to provide natural, contextual responses to general queries
- **News queries**: "Show me the latest news", "What's happening in technology?", "Tell me about sports news"
- **Horoscope queries**: "What's my Taurus horoscope today?", "Show me monthly horoscope for Libra"
- **Compatibility queries**: "Are Aries and Leo compatible?", "Show me compatibility between Gemini and Aquarius"
- **Birth chart queries**: "Generate my birth chart for June 15, 1990 at 14:30 in New Delhi"

## AI Architecture

The chatbot employs a hybrid AI architecture:
- **Intent recognition** is used to identify specific requests like news, horoscopes, or birth charts
- **Specialized APIs** handle domain-specific tasks (news retrieval, astrological calculations)
- **Groq LLM API** handles general conversation, welcome messages, and responses when no specific intent is detected

This hybrid approach provides the benefits of specialized tools for domain-specific tasks while leveraging LLM capabilities for natural conversation.

## Mock API Support

The application includes mock API implementations that activate automatically when:
- API keys are not provided in the `.env` file
- The real API services are unavailable
- `VITE_USE_MOCK_APIS=true` is set in the `.env` file

This ensures you can develop and test the application without active API credentials.

## License

MIT
