import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const StarCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
`;

const StarBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    
    // Resize canvas to match window
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateStars();
    };
    
    // Generate stars
    const generateStars = () => {
      stars = [];
      const numberOfStars = Math.floor((canvas.width * canvas.height) / 3000);
      
      for (let i = 0; i < numberOfStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.1 + 0.05,
          blinkSpeed: Math.random() * 0.02,
          blinkDirection: Math.random() > 0.5 ? 1 : -1
        });
      }
    };
    
    // Draw stars
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Update star position (slight movement)
        star.x += star.speed;
        if (star.x > canvas.width) {
          star.x = 0;
        }
        
        // Make stars twinkle
        star.opacity += star.blinkSpeed * star.blinkDirection;
        if (star.opacity > 0.9 || star.opacity < 0.2) {
          star.blinkDirection *= -1;
        }
        
        // Draw the star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      
      // Add occasional shooting stars
      if (Math.random() < 0.008) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height / 3),
          length: Math.random() * 80 + 20,
          speed: Math.random() * 15 + 10,
          angle: Math.PI / 4 + (Math.random() * Math.PI / 8),
          opacity: 1
        };
        
        drawShootingStar(shootingStar);
      }
      
      animationFrameId = requestAnimationFrame(drawStars);
    };
    
    // Draw shooting star
    const drawShootingStar = (star) => {
      const endX = star.x + Math.cos(star.angle) * star.length;
      const endY = star.y + Math.sin(star.angle) * star.length;
      
      const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    drawStars();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <StarCanvas ref={canvasRef} />;
};

export default StarBackground; 