import React from 'react';
import { FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

const SentimentIndicator = ({ sentiment, size = 20 }) => {
  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <FiSmile className="text-green-500" size={size} />;
      case 'neutral':
        return <FiMeh className="text-yellow-500" size={size} />;
      case 'negative':
        return <FiFrown className="text-red-500" size={size} />;
      default:
        return <FiMeh className="text-gray-400" size={size} />;
    }
  };

  const getTooltipText = () => {
    switch (sentiment) {
      case 'positive':
        return 'Positive feedback';
      case 'neutral':
        return 'Neutral feedback';
      case 'negative':
        return 'Constructive feedback';
      default:
        return 'No sentiment data';
    }
  };

  return (
    <div className="relative group inline-flex">
      {getSentimentIcon()}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {getTooltipText()}
      </span>
    </div>
  );
};

export default SentimentIndicator;