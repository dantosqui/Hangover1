import React from 'react';
import './ContextMenu.css'

const ContextMenu = ({ options, position, onClose }) => {
  return (
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x }}
      onClick={onClose}
    >
      {options.map((option, index) => (
        <div key={index} onClick={option.action}>
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
