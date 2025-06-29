import React from 'react';
import { FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

const SentimentIndicator = ({ sentiment }) => {
  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <FiSmile className="text-green-500 text-xl" />;
      case 'neutral':
        return <FiMeh className="text-yellow-500 text-xl" />;
      case 'negative':
        return <FiFrown className="text-red-500 text-xl" />;
      default:
        return <FiMeh className="text-gray-500 text-xl" />;
    }
  };

  return (
    <div className="flex items-center">
      {getSentimentIcon()}
      <span className="ml-1 text-sm capitalize">{sentiment}</span>
    </div>
  );
};

export default SentimentIndicator;