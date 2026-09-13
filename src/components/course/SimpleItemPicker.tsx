import React, { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Modal from '../ui/modal';

export interface PickerItem {
  _id: string;
  title: string;
  subtitle?: string;
}

interface SimpleItemPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ids: string[]) => void;
  items: PickerItem[];
  selectedIds: string[];
  title: string;
  icon?: React.ElementType;
  emptyLabel?: string;
  /** Tailwind classes for a selected row, e.g. "border-indigo-500 bg-indigo-50" */
  selectedClass?: string;
  /** Tailwind classes for the selected-icon color, e.g. "text-indigo-600" */
  selectedIconClass?: string;
  /** Tailwind classes for the selection dot, e.g. "bg-indigo-600 border-indigo-600" */
  selectedDotClass?: string;
  multiple?: boolean;
}

const SimpleItemPicker: React.FC<SimpleItemPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  items,
  selectedIds,
  title,
  icon: Icon,
  emptyLabel = 'No items found',
  selectedClass = 'border-blue-500 bg-blue-50',
  selectedIconClass = 'text-blue-600',
  selectedDotClass = 'bg-blue-600 border-blue-600',
  multiple = true,
}) => {
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    if (multiple) {
      setTempSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    } else {
      setTempSelected([id]);
    }
  };

  const confirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select ${title} ${multiple ? '(Multiple)' : ''}`} size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />}
            <p>{emptyLabel}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No matches for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filtered.map((item) => {
              const isSelected = tempSelected.includes(item._id);
              return (
                <div
                  key={item._id}
                  onClick={() => toggle(item._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? selectedClass : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? selectedIconClass : 'text-slate-400'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      isSelected ? selectedDotClass : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tempSelected.length > 0 && (
          <div className="text-sm text-slate-600">
            {tempSelected.length} item{tempSelected.length > 1 ? 's' : ''} selected
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm}>Confirm Selection</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SimpleItemPicker;
