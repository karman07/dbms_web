// Colors
export const COLORS = {
  primary: '#4D7BEB',
  primaryLight: '#6B8EF5',
  primaryDark: '#3A5FD9',
  textPrimary2: '#0f172a',
  accent: '#4EA8DE',
} as const;

// Gradient styles
export const GRADIENTS = {
  primary: {
    background: `linear-gradient(135deg, #4D7BEB 0%, #4EA8DE 50%, #6B8EF5 100%)`
  },
  gradientPrimary: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  gradientAccent: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  gradientText: 'bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent',
  gradientVibrant: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
  gradientTitle: 'bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent',
  gradientBold: 'bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent'
} as const;

// Professional Button Styles (shadcn-inspired)
export const BUTTON_STYLES = {
  gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0',
  secondary: 'bg-white hover:bg-gray-50 text-[#4D7BEB] border-2 border-[#4D7BEB] hover:border-[#3A5FD9] shadow-md hover:shadow-lg transition-all duration-200',
  outline: 'border-2 border-[#4D7BEB] text-[#4D7BEB] hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white bg-transparent shadow-sm hover:shadow-md transition-all duration-200',
  ghost: 'text-[#4D7BEB] hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-600/10 bg-transparent border-0 shadow-none hover:shadow-sm transition-all duration-200'
} as const;

// Animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const slideIn = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};