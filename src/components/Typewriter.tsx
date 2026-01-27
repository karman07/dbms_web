import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export const Typewriter = ({ text, delay = 0, speed = 50, className = '' }: TypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
    }
  }, [inView, hasStarted]);

  useEffect(() => {
    if (hasStarted && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? delay : speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, speed, text, hasStarted]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};