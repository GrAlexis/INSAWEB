import React from 'react';
import config from '../config';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: "100vh"
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: "-100vh"
  }
};

const pageTransition = {
  type: "tween",
  duration: 0.5
};

const Animation = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default Animation;
