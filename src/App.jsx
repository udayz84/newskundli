import { useState, useEffect } from 'react'
import './App.css'
import ChatBot from './components/ChatBot'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const AppContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, var(--background-darkest), var(--background-dark));
`;

function App() {
  return (
    <AppContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ChatBot />
    </AppContainer>
  )
}

export default App
