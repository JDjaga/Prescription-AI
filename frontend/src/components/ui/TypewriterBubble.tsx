import * as React from "react";

import ReactMarkdown from 'react-markdown'; // For rich text/markdown rendering of AI output

interface TypewriterBubbleProps {
  text: string;
  className?: string;
}

// This is now just a plain markdown bubble. No typewriter effect.
const TypewriterBubble: React.FC<TypewriterBubbleProps> = ({ text, className = '' }) => {
  return (
    <div className={className}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
};

export default TypewriterBubble;
