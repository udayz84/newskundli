import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faNewspaper, faStar, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { fetchTopHeadlines, searchNews, formatNewsResponse } from '../services/newsApi';
import { getHoroscope, getBirthChart, getCompatibility, formatAstroResponse } from '../services/freeAstrologyApi';
import { extractIntent } from '../services/intentUtils';
import { getResponse } from '../services/llm.js';
import { getNews, getResponseNews } from '../services/news.js';

// Animated background elements
const FloatingElement = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.1)'};
  filter: blur(${props => props.blur || '15px'});
  opacity: ${props => props.opacity || '0.15'};
  pointer-events: none;
  z-index: 1;
`;

const ChatBotContainer = styled(motion.div)`
  width: 100%;
  height: 100vh;
  border-radius: 0;
  background: linear-gradient(135deg, 
    #0a0d14 0%, 
    #131a24 40%, 
    #1a1e2e 80%, 
    #151b29 100%
  );
  box-shadow: inset 0 2px 0 var(--border),
              inset 0 -2px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 70% 20%,
      rgba(99, 102, 241, 0.08) 0%,
      transparent 45%
    );
    pointer-events: none;
    z-index: 2;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    background: radial-gradient(
      circle at 30% 80%,
      rgba(16, 185, 129, 0.05) 0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: 2;
  }
`;

const ChatHeader = styled(motion.div)`
  padding: 22px;
  background: linear-gradient(90deg, #3b365c, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px var(--shadow);
  position: relative;
  z-index: 10;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
`;

const HeaderTitle = styled(motion.div)`
  h2 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    letter-spacing: 0.5px;
    background: linear-gradient(to right, #ffffff, #e2e8f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    margin: 6px 0 0;
    font-size: var(--font-size-sm);
    opacity: 0.9;
  }
`;

const MenuButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: var(--font-size-lg);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
`;

const OptionsTabs = styled(motion.div)`
  display: flex;
  padding: 0;
  background-color: #1a1e2a;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
`;

const Tab = styled(motion.button)`
  flex: 1;
  background: none;
  border: none;
  padding: var(--space-md) var(--space-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 6px;
    font-size: 0.85rem;
  }
  
  &.active {
    color: #fff;
    font-weight: 600;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 25%;
      width: 50%;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 3px 3px 0 0;
    }
  }
  
  &:hover:not(.active) {
    background-color: rgba(99, 102, 241, 0.15);
    color: var(--text-light);
  }
`;

const ChatMessages = styled(motion.div)`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background-color: rgba(26, 30, 45, 0.8);
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    padding: var(--space-md);
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--accent-muted);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.15);
  }
`;

const InputContainer = styled(motion.div)`
  display: flex;
  padding: var(--space-md);
  border-top: 1px solid var(--border);
  background-color: #1a1e2a;
  box-shadow: 0 -5px 15px var(--shadow);
  position: relative;
  z-index: 5;
  
  @media (max-width: 768px) {
    padding: var(--space-sm) var(--space-md);
  }
`;

const Input = styled(motion.input)`
  flex: 1;
  border: none;
  border-radius: 30px;
  padding: var(--space-md) 22px;
  font-size: var(--font-size-base);
  background-color: #151a28;
  color: var(--text-light);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4), inset 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: var(--space-sm) 16px;
    font-size: 14px;
  }
`;

const SendButton = styled(motion.button)`
  border: none;
  width: 50px;
  height: 50px;
  border-radius: var(--radius-round);
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  margin-left: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
  
  &:disabled {
    background: var(--background-light);
    opacity: 0.7;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    box-shadow: 0 5px 20px rgba(99, 102, 241, 0.6);
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    margin-left: 8px;
  }
`;

// Floating animation configs
const floatingElements = [
  {
    width: '180px',
    height: '180px',
    top: '10%',
    left: '5%',
    color: 'rgba(66, 65, 123, 0.2)',
    blur: '35px',
    duration: 25,
    delay: 0,
  },
  {
    width: '150px',
    height: '150px',
    bottom: '15%',
    right: '10%',
    color: 'rgba(16, 185, 129, 0.1)',
    blur: '30px',
    duration: 30,
    delay: 5,
  },
  {
    width: '100px',
    height: '100px',
    top: '40%',
    right: '5%',
    color: 'rgba(99, 102, 241, 0.15)',
    blur: '25px',
    duration: 18,
    delay: 10,
  },
  {
    width: '120px',
    height: '120px',
    bottom: '30%',
    left: '15%',
    color: 'rgba(196, 181, 253, 0.1)',
    blur: '20px',
    duration: 22,
    delay: 3,
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const tabsVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const tabItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const messageListVariants = {
  hidden: { opacity: 0.8 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    } 
  }
};

const inputFieldVariants = {
  focus: { 
    scale: 1.01,
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.4), inset 0 2px 5px rgba(0, 0, 0, 0.2)'
  },
  blur: { 
    scale: 1,
    boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.2)'
  }
};

const floatingAnimation = (duration, delay = 0) => ({
  x: ["0%", "2%", "-2%", "0%"],
  y: ["0%", "-2%", "2%", "0%"],
  transition: {
    x: {
      repeat: Infinity,
      duration: duration,
      ease: "easeInOut",
      delay: delay
    },
    y: {
      repeat: Infinity,
      duration: duration,
      ease: "easeInOut",
      delay: delay
    }
  }
});

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to NewsKundli AI! I can help you with news updates and astrological insights. What would you like to know today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [inputFocused, setInputFocused] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processNewsIntent = async (entities) => {
    try {
      // Use the query from entities or default to 'latest'
      const query = entities.query || (entities.category || 'latest');
      
      // Use getNews from news.py 
      const newsData = await getNews(query);
      
      if (newsData && typeof newsData === 'object' && newsData.articles) {
        // Format the news data into a readable message using the intro from LLM
        let formattedNews = `${newsData.intro}\n\n`;
        
        newsData.articles.forEach((article, index) => {
          formattedNews += `### ${index + 1}. ${article.title}\n`;
          formattedNews += `${article.description || 'No description available'}\n`;
          formattedNews += `[Read more](${article.url})\n`;
          formattedNews += `Published: ${new Date(article.publishedAt).toLocaleString()}\n\n`;
        });
        
        return formattedNews;
      } else {
        // Handle case where newsData is a string (error message)
        return typeof newsData === 'string' ? 
          newsData : 
          "I couldn't find any news articles matching your request. Could you try a different query?";
      }
    } catch (error) {
      console.error('Error processing news intent:', error);
      return "I'm having trouble accessing the news service right now. Please try again later.";
    }
  };

  const processHoroscopeIntent = async (entities) => {
    try {
      // Default to a common sign if none specified
      const sign = entities.sign || 'aries';
      const timeframe = entities.timeframe || 'daily';
      
      const response = await getHoroscope(sign, timeframe);
      return formatAstroResponse(response, 'horoscope');
    } catch (error) {
      console.error('Error processing horoscope intent:', error);
      return "I'm having trouble retrieving horoscope information right now. Please try again later.";
    }
  };

  const processCompatibilityIntent = async (entities) => {
    try {
      // Check if we have both signs
      if (!entities.sign1 || !entities.sign2) {
        return "To check compatibility, I need two zodiac signs. For example: 'What's the compatibility between Aries and Taurus?'";
      }
      
      const response = await getCompatibility(entities.sign1, entities.sign2);
      return formatAstroResponse(response, 'compatibility');
    } catch (error) {
      console.error('Error processing compatibility intent:', error);
      return "I'm having trouble retrieving compatibility information right now. Please try again later.";
    }
  };

  const processBirthChartIntent = async (entities) => {
    // For a real implementation, we would need to collect all required info
    // This is a simplified version assuming we have the data
    if (!entities.date || !entities.time) {
      setActiveConversation('birth_chart');
      return "To generate your birth chart, I'll need your date of birth (YYYY-MM-DD), time of birth (HH:MM), and location. Could you provide these details?";
    }
    
    // We would need to get latitude/longitude from location in a real implementation
    // Using default values for demo
    try {
      // Parse date and time information
      let dateString = entities.date;
      let timeString = entities.time;
      
      // If date is not in format YYYY-MM-DD, try to parse it
      if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Simple handling for common date formats
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj)) {
          dateString = dateObj.toISOString().split('T')[0];
        }
      }
      
      // Parse the date components
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      
      // Parse the time components
      let hours = 12, minutes = 0;
      if (timeString.includes(':')) {
        [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      }
      
      const birthDetails = {
        year,
        month,
        date: day,
        hours,
        minutes,
        latitude: entities.latitude || 28.6139, // Default to New Delhi
        longitude: entities.longitude || 77.2090,
        timezone: entities.timezone || 5.5 // Default to IST
      };
      
      const response = await getBirthChart(birthDetails);
      return formatAstroResponse(response, 'birthChart');
    } catch (error) {
      console.error('Error processing birth chart intent:', error);
      return "I'm having trouble generating your birth chart right now. Please try again later.";
    }
  };

  const processKundliRequest = async (query) => {
    try {
      // Process the kundli-related query
      const response = await getResponse(query);
      return response;
    } catch (error) {
      console.error('Error processing kundli request:', error);
      return "I'm having trouble processing your astrology request right now. Please try again later.";
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Show typing indicator immediately or with minimal delay
    setTimeout(() => {
      setIsLoading(true);
    }, 100);
    
    try {
      // If we're in an active conversation flow, handle it differently
      let botResponse;
      
      if (activeConversation === 'birth_chart') {
        // Process follow-up for birth chart
        // Get response from LLM instead of hardcoded text
        const responseText = await getResponse(input);
        botResponse = { 
          id: Date.now() + 1, 
          text: responseText, 
          isBot: true 
        };
        
        // End the active conversation
        setActiveConversation(null);
      } else if (activeTab === 'news') {
        // If we're in the news tab, use getResponseNews with user input
        const newsResponse = await getResponseNews(input);
        
        botResponse = { 
          id: Date.now() + 1, 
          text: newsResponse, 
          isBot: true 
        };
      } else if (activeTab === 'kundli') {
        // If we're in the kundli tab, use processKundliRequest
        const kundliResponse = await processKundliRequest(input);
        
        botResponse = {
          id: Date.now() + 1,
          text: kundliResponse,
          isBot: true
        };
      } else {
        // Extract intent from user input
        const { intent, entities } = extractIntent(input);
        
        // Process based on intent
        let responseText;
        console.log('Detected intent:', intent, 'with entities:', entities);
        
        // Use specialized API handlers for specific intents
        switch (intent) {
          case 'get_news':
            responseText = await processNewsIntent(entities);
            break;
          case 'get_horoscope':
            responseText = await processHoroscopeIntent(entities);
            break;
          case 'get_compatibility':
            responseText = await processCompatibilityIntent(entities);
            break;
          case 'get_birth_chart':
            responseText = await processBirthChartIntent(entities);
            break;
          case 'general_question':
          default:
            // For general conversation or unknown intents, use LLM API
            responseText = await getResponse(input);
            break;
        }
        
        botResponse = { 
          id: Date.now() + 1, 
          text: responseText, 
          isBot: true 
        };
      }
      
      // Reduced delay before adding the bot response
      setTimeout(() => {
        // Hide the typing indicator
        setIsLoading(false);
        
        // Add bot response immediately
        setMessages(prev => [...prev, botResponse]);
      }, 200);
      
    } catch (error) {
      console.error('Error handling message:', error);
      
      // Reduced delay for error message
      setTimeout(() => {
        setIsLoading(false);
        
        // Generic error response
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now() + 1, 
            text: "I'm sorry, I encountered an error while processing your request. Please try again.", 
            isBot: true 
          }
        ]);
      }, 200);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
    
    try {
      let response;
      
      if (tab === 'news') {
        // For news tab, set a simple welcome message first
        response = {
          id: Date.now(),
          text: "What news you want to know?",
          isBot: true
        };
        
        // Set message and stop loading indicator immediately
        setMessages([response]);
        setIsLoading(false);
        
        // No need to wait for API call for initial message
        return;
      } else if (tab === 'kundli') {
        // Display appropriate welcome message for kundli tab
        response = {
          id: Date.now(),
          text: "Welcome to the Astrology section! I can help you with daily horoscopes, zodiac compatibility, birth charts, and personalized predictions. What would you like to know about?",
          isBot: true
        };
      } else {
        // Default tab (chat) - Use LLM
        const responseText = await getResponse("Introduce yourself as an AI assistant that helps with both news and astrology information.");
        response = {
          id: Date.now(),
          text: responseText,
          isBot: true
        };
      }
      
      // Add response immediately without delay
      setMessages([response]);
      setIsLoading(false);
      
    } catch (error) {
      console.error(`Error handling tab change to ${tab}:`, error);
      
      setMessages([{ 
        id: Date.now(), 
        text: `I'm having trouble loading ${tab} information right now. Please try again later.`, 
        isBot: true 
      }]);
      setIsLoading(false);
    }
  };

  return (
    <ChatBotContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {floatingElements.map((element, index) => (
        <FloatingElement
          key={index}
          style={{ 
            width: element.width, 
            height: element.height,
            top: element.top,
            left: element.left,
            right: element.right, 
            bottom: element.bottom,
            blur: element.blur
          }}
          color={element.color}
          animate={floatingAnimation(element.duration, element.delay)}
        />
      ))}
      
      <ChatHeader
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <HeaderTitle
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        >
          <h2>NewsKundli AI</h2>
          <p>Your News & Astrology Assistant</p>
        </HeaderTitle>
        <MenuButton 
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faBars} />
        </MenuButton>
      </ChatHeader>
      
      <OptionsTabs
        variants={tabsVariants}
        initial="hidden"
        animate="visible"
      >
        <Tab 
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => handleTabChange('chat')}
          whileHover={{ backgroundColor: 'rgba(108, 92, 231, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          variants={tabItemVariants}
        >
          Chat
        </Tab>
        <Tab 
          className={activeTab === 'news' ? 'active' : ''}
          onClick={() => handleTabChange('news')}
          whileHover={{ backgroundColor: 'rgba(108, 92, 231, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          variants={tabItemVariants}
        >
          <FontAwesomeIcon icon={faNewspaper} /> News
        </Tab>
        <Tab 
          className={activeTab === 'kundli' ? 'active' : ''}
          onClick={() => handleTabChange('kundli')}
          whileHover={{ backgroundColor: 'rgba(108, 92, 231, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          variants={tabItemVariants}
        >
          <FontAwesomeIcon icon={faStar} /> Kundli
        </Tab>
      </OptionsTabs>
      
      <ChatMessages
        variants={messageListVariants}
        initial="hidden"
        animate="visible"
      >
        {messages.map((message) => (
          <Message 
            key={message.id} 
            text={message.text} 
            isBot={message.isBot}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </ChatMessages>
      
      <InputContainer
        variants={inputVariants}
        initial="hidden"
        animate="visible"
      >
        <Input 
          ref={inputRef}
          type="text"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          variants={inputFieldVariants}
          animate={inputFocused ? "focus" : "blur"}
          whileFocus="focus"
        />
        <SendButton 
          onClick={handleSend}
          disabled={input.trim() === ''}
          whileHover={{ scale: 1.05, boxShadow: '0 5px 20px rgba(79, 70, 229, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.6,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </SendButton>
      </InputContainer>
    </ChatBotContainer>
  );
};

export default ChatBot; 