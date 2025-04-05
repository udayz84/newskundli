import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TypingContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  align-self: flex-start;
  background-color: #16202e;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  margin-top: 5px;
  margin-bottom: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      rgba(255, 255, 255, 0) 100%
    );
  }
`;

const Dot = styled(motion.div)`
  width: 6px;
  height: 6px;
  background-color: #a78bfa;
  border-radius: var(--radius-round);
  margin: 0 3px;
  filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.5));
`;

const dotVariants = {
  initial: {
    y: 0,
    opacity: 0.4
  },
  animate: custom => ({
    y: [-4, 0, -4],
    opacity: [0.4, 0.8, 0.4],
    scale: [0.8, 1.1, 0.8],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: custom * 0.15
    }
  })
};

const containerVariants = {
  hidden: { 
    opacity: 0, 
    y: 5,
    scale: 0.95,
    x: -3
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 350, 
      damping: 30,
      mass: 0.6
    } 
  },
  exit: { 
    opacity: 0, 
    y: -3, 
    scale: 0.95,
    transition: { 
      duration: 0.15, 
      ease: "easeOut"
    } 
  }
};

const TypingIndicator = () => {
  return (
    <TypingContainer
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      layout
    >
      {[0, 1, 2].map((i) => (
        <Dot 
          key={i}
          custom={i}
          variants={dotVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </TypingContainer>
  );
};

export default TypingIndicator; 