import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GRADIENTS } from "@/constants";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const lines = content.split('\n');
  const renderedContent: JSX.Element[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent: string[] = [];
  let codeBlockIndex = 0;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderTextWithFormatting = (text: string) => {
    if (!text) return null;
    
    const elements: (string | JSX.Element)[] = [];
    let currentText = text;
    let key = 0;

    while (currentText.length > 0) {
      const boldMatch = currentText.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        elements.push(
          <strong key={key++} className="font-bold text-gray-900 dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        currentText = currentText.slice(boldMatch[0].length);
        continue;
      }

      const codeMatch = currentText.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <code key={key++} className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded font-mono text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {codeMatch[1]}
          </code>
        );
        currentText = currentText.slice(codeMatch[0].length);
        continue;
      }

      const nextSpecial = currentText.search(/[*`]/);
      if (nextSpecial === -1) {
        elements.push(currentText);
        break;
      } else if (nextSpecial > 0) {
        elements.push(currentText.slice(0, nextSpecial));
        currentText = currentText.slice(nextSpecial);
      } else {
        elements.push(currentText[0]);
        currentText = currentText.slice(1);
      }
    }

    return <>{elements}</>;
  };

  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const currentIndex = codeBlockIndex;
        const codeText = codeBlockContent.join('\n');
        renderedContent.push(
          <motion.div 
            key={i} 
            className="my-6 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`${GRADIENTS.gradientPrimary} rounded-t-lg px-4 py-2.5 flex items-center justify-between shadow-md`}>
              <span className="text-white text-sm font-semibold uppercase tracking-wide">{codeBlockLanguage || 'code'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="bg-white/20 hover:bg-white/30 transition-all text-white h-8 px-3 rounded-md font-medium"
              >
                {copiedCode === currentIndex ? (
                  <><Check className="w-4 h-4 mr-1.5" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1.5" /> Copy Code</>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto border-2 border-gray-800">
              <code className="text-sm font-mono leading-relaxed">{codeText}</code>
            </pre>
          </motion.div>
        );
        inCodeBlock = false;
        codeBlockLanguage = '';
        codeBlockContent = [];
      } else {
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
        codeBlockIndex++;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
    } else {
      if (line.startsWith('# ')) {
        renderedContent.push(
          <motion.div
            key={i} 
            className="mb-8 mt-8 first:mt-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
              {line.substring(2)}
            </h1>
            <div className={`h-1 w-32 ${GRADIENTS.gradientPrimary} rounded-full`} />
          </motion.div>
        );
      } else if (line.startsWith('## ')) {
        renderedContent.push(
          <motion.h2 
            key={i} 
            className={`text-3xl md:text-4xl font-bold mb-6 mt-8 pb-4 ${GRADIENTS.gradientBold}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {line.substring(3)}
          </motion.h2>
        );
      } else if (line.startsWith('### ')) {
        renderedContent.push(
          <motion.h3 
            key={i} 
            className="text-2xl md:text-3xl font-semibold mb-4 mt-6 text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {line.substring(4)}
          </motion.h3>
        );
      } else if (line.startsWith('#### ')) {
        renderedContent.push(
          <motion.h4 
            key={i} 
            className={`text-xl md:text-2xl font-semibold mb-3 mt-5 ${GRADIENTS.gradientText}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {line.substring(5)}
          </motion.h4>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const number = line.match(/^(\d+)\./)?.[1];
        const text = line.replace(/^\d+\.\s/, '');
        renderedContent.push(
          <motion.div 
            key={i} 
            className="flex mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          >
            <span className={`font-bold ${GRADIENTS.gradientText} mr-4 min-w-[2rem] text-xl`}>{number}.</span>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{renderTextWithFormatting(text)}</div>
          </motion.div>
        );
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        const text = line.startsWith('- ') ? line.substring(2) : line.substring(2);
        renderedContent.push(
          <motion.div 
            key={i} 
            className="flex items-start mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          >
            <span className={`mr-4 mt-1.5 font-bold text-2xl ${GRADIENTS.gradientText}`}>•</span>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{renderTextWithFormatting(text)}</div>
          </motion.div>
        );
      } else if (line.startsWith('---')) {
        renderedContent.push(
          <hr key={i} className="my-8 border-gray-300 dark:border-gray-600" />
        );
      } else if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').filter(cell => cell.trim());
        const isHeaderSeparator = cells.every(cell => cell.trim().match(/^-+$/));
        
        if (!isHeaderSeparator) {
          renderedContent.push(
            <div key={i} className="flex border-b border-gray-300 dark:border-gray-600">
              {cells.map((cell, cellIdx) => (
                <div key={cellIdx} className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300">
                  {renderTextWithFormatting(cell.trim())}
                </div>
              ))}
            </div>
          );
        }
      } else if (line.trim()) {
        renderedContent.push(
          <motion.p 
            key={i} 
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderTextWithFormatting(line)}
          </motion.p>
        );
      }
    }
    i++;
  }

  return <div className="prose dark:prose-invert max-w-none">{renderedContent}</div>;
};
