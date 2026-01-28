import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { GRADIENTS } from "@/constants";

interface Subtopic {
  _id: string;
  name: string;
  filename: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface Slide {
  title: string;
  content: string;
  level: number;
}

interface DocsSlidesViewProps {
  selectedSubtopic: Subtopic | null;
}

export const DocsSlidesView = ({ selectedSubtopic }: DocsSlidesViewProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    if (selectedSubtopic?.content) {
      parseContentIntoSlides(selectedSubtopic.content);
      setCurrentSlide(0);
    }
  }, [selectedSubtopic]);

  const parseContentIntoSlides = (content: string) => {
    const lines = content.split('\n');
    const parsedSlides: Slide[] = [];
    let currentSlideContent: string[] = [];
    let currentTitle = '';
    let currentLevel = 0;

    const saveSlide = () => {
      if (currentTitle && currentSlideContent.length > 0) {
        parsedSlides.push({
          title: currentTitle,
          content: currentSlideContent.join('\n'),
          level: currentLevel,
        });
      }
    };

    for (const line of lines) {
      // Check for headings
      if (line.startsWith('# ')) {
        saveSlide();
        currentTitle = line.substring(2).trim();
        currentLevel = 1;
        currentSlideContent = [];
      } else if (line.startsWith('## ')) {
        saveSlide();
        currentTitle = line.substring(3).trim();
        currentLevel = 2;
        currentSlideContent = [];
      } else if (line.startsWith('### ')) {
        saveSlide();
        currentTitle = line.substring(4).trim();
        currentLevel = 3;
        currentSlideContent = [];
      } else if (line.startsWith('#### ')) {
        saveSlide();
        currentTitle = line.substring(5).trim();
        currentLevel = 4;
        currentSlideContent = [];
      } else {
        // Add content to current slide
        if (currentTitle) {
          currentSlideContent.push(line);
        }
      }
    }

    // Save the last slide
    saveSlide();

    setSlides(parsedSlides);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  if (!selectedSubtopic) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center">
        <BookOpen className="w-20 h-20 text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Select a Topic</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a subtopic from the sidebar to view slides
        </p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-gray-600 dark:text-gray-400">No slides available</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'relative'}`}>
      {/* Slide Content */}
      <div className={`${isFullscreen ? 'h-screen' : 'min-h-[600px]'} flex flex-col`}>
        {/* Header */}
        <div className={`${GRADIENTS.gradientPrimary} px-8 py-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-medium opacity-90 mb-1">
                {selectedSubtopic.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-xs opacity-75">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
                <div className="flex-1 bg-white/20 rounded-full h-1 max-w-xs">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Slide Title */}
                <h1
                  className={`font-extrabold mb-8 ${
                    currentSlideData.level === 1
                      ? `text-5xl md:text-6xl ${GRADIENTS.gradientTitle}`
                      : currentSlideData.level === 2
                      ? `text-4xl md:text-5xl ${GRADIENTS.gradientBold}`
                      : currentSlideData.level === 3
                      ? 'text-3xl md:text-4xl text-gray-900 dark:text-white'
                      : `text-2xl md:text-3xl ${GRADIENTS.gradientText}`
                  }`}
                >
                  {currentSlideData.title}
                </h1>

                {/* Slide Content */}
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={currentSlideData.content} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>

            {/* Slide Indicators */}
            <div className="flex items-center space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="px-8 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Use ← → arrow keys to navigate • Press F for fullscreen
          </p>
        </div>
      </div>
    </div>
  );
};
