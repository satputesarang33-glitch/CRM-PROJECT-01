import React from 'react';
import './Loader.css';

const Loader = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}) => {
  const content = (
    <div className={`loader-wrapper loader-${size}`}>
      <div className="loader-spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{content}</div>;
  }

  return content;
};

export default Loader;
