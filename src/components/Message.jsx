import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const MessageContainer = styled(motion.div)`
  display: flex;
  flex-direction: ${({ isBot }) => (isBot ? 'row' : 'row-reverse')};
  align-items: flex-start;
  margin-bottom: 14px;
  width: 100%;
`;

const Avatar = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isBot }) => 
    isBot 
      ? `linear-gradient(135deg, #3b365c, #4f46e5)` 
      : `linear-gradient(135deg, #0a614c, #0f9e7a)`};
  margin: ${({ isBot }) => (isBot ? `0 var(--space-md) 0 0` : `0 0 0 var(--space-md)`)};
  font-weight: bold;
  color: white;
  font-size: var(--font-size-sm);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
`;

const MessageBubble = styled(motion.div)`
  width: auto;
  max-width: 70%;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  background-color: ${({ isBot }) => (isBot ? '#16202e' : '#3b365c')};
  color: ${({ isBot }) => (isBot ? 'var(--text-light)' : 'white')};
  font-size: var(--font-size-base);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(255, 255, 255, 0.08) 0%, 
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: inherit;
  }
  
  @media (max-width: 768px) {
    max-width: 80%;
    padding: var(--space-sm) var(--space-md);
  }
  
  @media (max-width: 480px) {
    max-width: 85%;
  }
`;

const Text = styled.div`
  word-break: break-word;
  overflow-wrap: break-word;
  position: relative;
  white-space: pre-wrap;
  hyphens: auto;
  min-height: 20px;
  
  /* Ensure links are displayed properly */
  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  
  /* Add styles for markdown-like content */
  p {
    margin-bottom: 0.75rem;
  }
  
  /* Style for headings in news content */
  h3, strong {
    font-weight: 600;
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
  }
  
  /* Prevent overflowing content */
  img, video, iframe {
    max-width: 100%;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: ${({ isBot }) => (isBot ? 'var(--text-light)' : 'white')};
  margin-left: 2px;
  vertical-align: middle;
  opacity: 0.7;
  animation: blink 0.8s infinite;
  
  @keyframes blink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

// Simplified variants
const simpleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Natural typing patterns
const getRandomTypingDelay = () => {
  // Random variation to simulate human typing (faster)
  return Math.random() * 15 + 5; // Between 5ms and 20ms (was 15-45ms)
};

// Should we pause based on character and context
const shouldPause = (char, nextChar, prevChar) => {
  // Pause after punctuation
  if (['.', '!', '?', ',', ';', ':'].includes(char)) {
    return true;
  }

  // Pause at the end of a sentence
  if (['.', '!', '?'].includes(prevChar) && nextChar === ' ') {
    return true;
  }

  // Occasionally pause at spaces
  if (char === ' ' && Math.random() < 0.1) {
    return true;
  }

  return false;
};

// Get pause duration based on character
const getPauseDuration = (char) => {
  if (['.', '!', '?'].includes(char)) {
    return 150 + Math.random() * 100; // Shorter pause for end of sentences (was 300-500ms)
  }
  if ([',', ';', ':'].includes(char)) {
    return 80 + Math.random() * 50; // Shorter pause for mid-sentence breaks (was 150-250ms)
  }
  return 20 + Math.random() * 30; // Shorter random pause (was 40-100ms)
};

const Message = ({ text, isBot }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(isBot);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    if (!isBot) {
      // User messages appear instantly
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }
    
    // Bot messages type character by character
    setDisplayedText('');
    setIsTyping(true);
    
    // Calculate base typing speed - faster for longer messages
    const baseTypingSpeed = Math.max(8, 20 - (text.length / 100)); // Faster base speed (was 15, 40)
    
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (currentIndex >= text.length) {
        setIsTyping(false);
        return;
      }
      
      // Process multiple characters at once for very long messages
      const charsToProcess = text.length > 300 ? 2 : 1;
      let charsAdded = 0;
      let nextText = '';
      
      while (currentIndex < text.length && charsAdded < charsToProcess) {
        nextText += text[currentIndex];
        currentIndex++;
        charsAdded++;
      }
      
      setDisplayedText(prev => prev + nextText);
      
      const char = text[currentIndex - 1];
      const nextChar = currentIndex < text.length ? text[currentIndex] : '';
      const prevChar = currentIndex > 1 ? text[currentIndex - 2] : '';
      
      // Determine if we should pause and for how long
      if (shouldPause(char, nextChar, prevChar)) {
        const pauseDuration = getPauseDuration(char);
        timeoutRef.current = setTimeout(typeNextCharacter, pauseDuration);
      } else {
        // Vary typing speed slightly to feel more natural
        const delay = getRandomTypingDelay();
        timeoutRef.current = setTimeout(typeNextCharacter, baseTypingSpeed + delay);
      }
    };
    
    // Start typing with smaller initial delay
    timeoutRef.current = setTimeout(typeNextCharacter, 50); // Shorter initial delay (was 100ms)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isBot]);
  
  return (
    <MessageContainer
      isBot={isBot}
      variants={simpleVariants}
      initial="hidden"
      animate="visible"
    >
      <Avatar isBot={isBot}>
        {isBot ? 'AI' : 'You'}
      </Avatar>
      <MessageBubble isBot={isBot}>
        <Text>
          {displayedText}
          {isTyping && <Cursor isBot={isBot} />}
        </Text>
      </MessageBubble>
    </MessageContainer>
  );
};

export default Message; 