import React from 'react';
import { X } from 'lucide-react';

interface ChipProps {
  icon: React.ElementType;
  label: string;
  onRemove: () => void;
  /** Tailwind classes for background/text/border, e.g. "bg-purple-50 text-purple-700 border-purple-200" */
  colorClass: string;
}

const Chip: React.FC<ChipProps> = ({ icon: Icon, label, onRemove, colorClass }) => (
  <span
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border max-w-[240px] ${colorClass}`}
  >
    <Icon className="w-3 h-3 flex-shrink-0" />
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="flex-shrink-0 hover:text-red-500 transition-colors"
      aria-label={`Remove ${label}`}
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default Chip;
