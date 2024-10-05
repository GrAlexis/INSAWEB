import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ hours }) => {
  const totalSeconds = hours * 3600;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  const getColorClass = () => {
    const halfway = totalSeconds / 2;
    if (timeLeft > halfway) {
      return 'timer-black';
    } else if (timeLeft > 10) {
      return 'timer-orange';
    } else {
      return 'timer-red smooth-blink'; 
    }
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    if (days > 0) {
      return `${days}j  ${hours}h  ${minutes}m`;
    } else {
      return `${hours}h : ${minutes}m  ${sec < 10 ? `0${sec}` : sec}s`;
    }
  };

  return (
    <div className="timer-container">
      <div className={`timer-display ${getColorClass()}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default Timer;
