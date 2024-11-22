// Button.jsx
import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, className, text }) => {
  return (
    <button className={`${styles.button} ${className}`} onClick={onClick}>
      {children}
      {text}
    </button>
  );
};

export default Button;

// Button.module.css
