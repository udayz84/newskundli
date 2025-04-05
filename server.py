from flask import Flask, request, jsonify
from flask_cors import CORS
from src.services.llm import getResponse
from src.services.news import getNews, getResponseNews

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/llm', methods=['POST'])
def llm_response():
    data = request.json
    user_query = data.get('query', '')
    
    if not user_query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        response = getResponse(user_query)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news', methods=['POST'])
def news_response():
    data = request.json
    query = data.get('query', 'latest')
    
    if not query:
        query = 'latest'  # Default to latest news if no query provided
    
    try:
        articles = getNews(query)
        return jsonify({'articles': articles})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news-summary', methods=['POST'])
def news_summary_response():
    data = request.json
    query = data.get('query', 'latest')
    
    if not query:
        query = 'latest'  # Default to latest news if no query provided
    
    try:
        summary = getResponseNews(query)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 