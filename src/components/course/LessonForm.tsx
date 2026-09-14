import React, { useState, useEffect } from 'react';
import {
  Video, FileText, Plus, Link as LinkIcon, Brain, ClipboardList, Activity,
  GripVertical, PlayCircle, Trophy, Zap, FileDown,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Modal from '../ui/modal';
import MediaPicker from './MediaPicker';
import DocSubtopicPicker from './DocSubtopicPicker';
import SimpleItemPicker from './SimpleItemPicker';
import Chip from './Chip';
import { Lesson, Quiz, Assignment, ClassActivity } from '../../types';
import { mediaAPI, docsAPI, quizAPI, assignmentAPI, classActivityAPI } from '../../utils/api';

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  lesson?: Lesson;
  sectionIndex: number;
  lessonIndex?: number;
  mode: 'add' | 'edit';
}

interface MediaItem {
  _id: string;
  title: string;
  type: 'video' | 'image' | 'document';
  thumbnailUrl?: string;
}

interface SubtopicItem {
  _id: string;         // real MongoDB subtopic _id — used everywhere (selection, contentOrder, API)
  topicTitle: string;
  subtopicName: string;
}

// A single draggable content step
interface ContentItem {
  uid: string;   // unique key for dnd-kit: 'media:abc', 'quiz:def', 'resource:https://...'
  type: string;  // 'media' | 'doc' | 'resource' | 'quiz' | 'assignment' | 'activity'
  id: string;    // actual ID: media._id | subtopic._id | URL | quiz._id | etc.
  label: string;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  media:      { label: 'Video/Media',  icon: PlayCircle,    color: 'text-purple-600 bg-purple-50 border-purple-200' },
  doc:        { label: 'Document',     icon: FileText,      color: 'text-blue-600 bg-blue-50 border-blue-200' },
  resource:   { label: 'Resource URL', icon: LinkIcon,      color: 'text-green-600 bg-green-50 border-green-200' },
  quiz:       { label: 'Quiz',         icon: Trophy,        color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  assignment: { label: 'Assignment',   icon: ClipboardList, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  activity:   { label: 'Activity',     icon: Zap,           color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
};

interface SortableStepProps {
  item: ContentItem;
  index: number;
  onRemove: (uid: string) => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ item, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.uid });
  const meta = TYPE_META[item.type] || TYPE_META.resource;
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-white ${isDragging ? 'shadow-lg opacity-80 z-10' : 'hover:bg-gray-50'} transition-colors`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Step number */}
      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>

      {/* Type badge + label */}
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium flex-shrink-0 ${meta.color}`}>
        <Icon className="w-3 h-3" />
        <span>{meta.label}</span>
      </div>

      {/* Item label */}
      <span className="flex-1 text-sm text-slate-700 truncate">{item.label}</span>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.uid)}
        className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Section header shared across the "content source" blocks below
interface SectionHeaderProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  onAdd: () => void;
  addLabel?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, label, count, onAdd, addLabel = 'Add' }) => (
  <div className="flex items-center justify-between mb-3">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
      <Icon className="w-4 h-4" /> {label}{typeof count === 'number' ? ` (${count})` : ''}
    </label>
    <Button type="button" variant="secondary" size="sm" onClick={onAdd}>
      <Plus className="w-4 h-4 mr-1" /> {addLabel}
    </Button>
  </div>
);

const LessonForm: React.FC<LessonFormProps> = ({ isOpen, onClose, onSubmit, lesson, mode }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 0,
    estimatedMinutes: 0,
    isPublished: false,
  });

  // Raw selection state (used for pickers)
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>([]); // real subtopic _ids
  const [resources, setResources] = useState<{ name: string; url: string }[]>([]);
  const [linkedQuizIds, setLinkedQuizIds] = useState<string[]>([]);
  const [linkedAssignmentIds, setLinkedAssignmentIds] = useState<string[]>([]);
  const [linkedActivityIds, setLinkedActivityIds] = useState<string[]>([]);

  // Resolved display items (for showing labels in the form sections)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [subtopicItems, setSubtopicItems] = useState<SubtopicItem[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [availableActivities, setAvailableActivities] = useState<ClassActivity[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);

  // THE master ordered list of content steps
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Resource name + URL inputs
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Picker modals
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [showQuizPicker, setShowQuizPicker] = useState(false);
  const [showAssignmentPicker, setShowAssignmentPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Helpers ─────────────────────────────────────────────────────────────

  const makeUid = (type: string, id: string) => `${type}:${id}`;

  const addToList = (newItems: ContentItem[]) => {
    setContentItems(prev => {
      const existingUids = new Set(prev.map(i => i.uid));
      return [...prev, ...newItems.filter(i => !existingUids.has(i.uid))];
    });
  };

  const removeFromList = (uid: string) => {
    setContentItems(prev => prev.filter(i => i.uid !== uid));
  };

  const removeAllOfType = (type: string, ids: string[]) => {
    const uids = new Set(ids.map(id => makeUid(type, id)));
    setContentItems(prev => prev.filter(i => !uids.has(i.uid)));
  };

  // Find a subtopic's topic/name by its real _id across all loaded topics
  const findSubtopic = (topics: any[], subtopicId: string): SubtopicItem | null => {
    for (const topic of topics) {
      for (const sub of (topic.subtopics || [])) {
        const subId = sub._id?.toString?.() ?? sub._id;
        if (subId === subtopicId) {
          return { _id: subtopicId, topicTitle: topic.title, subtopicName: sub.name };
        }
      }
    }
    return null;
  };

  // ── Init / Reset ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) loadLinkedItems();

    if (lesson && mode === 'edit') {
      setFormData({
        title: lesson.title,
        priority: lesson.priority || 0,
        estimatedMinutes: lesson.estimatedMinutes || 0,
        isPublished: lesson.isPublished,
      });

      const parseArr = <T = string>(field: any, extractId = false): T[] => {
        if (!field) return [];
        if (Array.isArray(field)) {
          return field.map((item: any) => {
            if (extractId && typeof item === 'object' && item?._id) return item._id;
            if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('"'))) {
              try {
                let p = item;
                while (typeof p === 'string' && (p.startsWith('[') || p.startsWith('"'))) p = JSON.parse(p);
                return Array.isArray(p) ? p : [p];
              } catch { return item; }
            }
            return item;
          }).flat();
        }
        return field;
      };

      const mediaIds = parseArr<string>((lesson as any).mediaIds || (lesson as any).media, true);
      const docIds = parseArr<string>((lesson as any).docSubtopicIds || (lesson as any).docSubtopics, true);
      const resItems = parseArr<{ name: string; url: string }>(lesson.resources).map((r: any) =>
        typeof r === 'string' ? { name: r, url: r } : { name: r?.name || r?.url || '', url: r?.url || '' },
      );
      const quizIds = parseArr<string>((lesson as any).linkedQuizIds || (lesson as any).linkedQuizzes, true);
      const assignIds = parseArr<string>((lesson as any).linkedAssignmentIds || (lesson as any).linkedAssignments, true);
      const actIds = parseArr<string>((lesson as any).linkedActivityIds || (lesson as any).linkedActivities, true);

      setSelectedMediaIds(mediaIds);
      setSelectedSubtopicIds(docIds);
      setResources(resItems);
      setLinkedQuizIds(quizIds);
      setLinkedAssignmentIds(assignIds);
      setLinkedActivityIds(actIds);

      // Resolve everything we can name synchronously (media titles, subtopic names)
      // BEFORE building the content-order list, so it renders with real labels on
      // the first paint instead of raw IDs that a later patch may or may not catch.
      (async () => {
        const [mediaData, resolvedSubtopics] = await Promise.all([
          mediaIds.length > 0 ? loadMediaDetails(mediaIds) : Promise.resolve([]),
          docIds.length > 0 ? resolveSubtopics(docIds) : Promise.resolve([]),
        ]);
        buildContentItemsFromOrder(
          lesson.contentOrder, mediaIds, resolvedSubtopics, resItems, quizIds, assignIds, actIds, mediaData,
        );
      })();
    } else {
      resetForm();
    }
  }, [lesson, mode, isOpen]);

  const resetForm = () => {
    setFormData({ title: '', priority: 0, estimatedMinutes: 0, isPublished: false });
    setSelectedMediaIds([]); setSelectedSubtopicIds([]); setMediaItems([]); setSubtopicItems([]);
    setResources([]); setLinkedQuizIds([]); setLinkedAssignmentIds([]); setLinkedActivityIds([]);
    setContentItems([]); setNewResourceName(''); setNewResourceUrl('');
  };

  // Build contentItems from a saved contentOrder array
  const buildContentItemsFromOrder = (
    savedOrder: Array<{ type: string; id: string }> | undefined,
    mediaIds: string[], subtopics: SubtopicItem[], resItems: { name: string; url: string }[],
    quizIds: string[], assignIds: string[], actIds: string[],
  ) => {
    if (!savedOrder || savedOrder.length === 0) {
      // No saved order: append all available items in default order
      const items: ContentItem[] = [
        ...mediaIds.map(id => ({ uid: makeUid('media', id), type: 'media', id, label: id })),
        ...subtopics.map(s => ({ uid: makeUid('doc', s._id), type: 'doc', id: s._id, label: s.subtopicName })),
        ...resItems.map(r => ({ uid: makeUid('resource', r.url), type: 'resource', id: r.url, label: r.name })),
        ...quizIds.map(id => ({ uid: makeUid('quiz', id), type: 'quiz', id, label: id })),
        ...assignIds.map(id => ({ uid: makeUid('assignment', id), type: 'assignment', id, label: id })),
        ...actIds.map(id => ({ uid: makeUid('activity', id), type: 'activity', id, label: id })),
      ];
      setContentItems(items);
      return;
    }

    // Use saved order as the template
    const items: ContentItem[] = savedOrder.map(entry => ({
      uid: makeUid(entry.type, entry.id),
      type: entry.type,
      id: entry.id,
      label: entry.id, // label will be updated once we resolve display names
    }));
    setContentItems(items);
  };

  // Update labels in contentItems once we have resolved item details
  const updateLabels = (updates: Array<{ uid: string; label: string }>) => {
    const map = new Map(updates.map(u => [u.uid, u.label]));
    setContentItems(prev => prev.map(item => map.has(item.uid) ? { ...item, label: map.get(item.uid)! } : item));
  };

  // ── API loaders ──────────────────────────────────────────────────────────

  const loadLinkedItems = async () => {
    try {
      const [quizzes, assignments, activities] = await Promise.all([
        quizAPI.getAllQuizzesAdmin(), assignmentAPI.getAllAssignmentsAdmin(), classActivityAPI.getAllClassActivitiesAdmin(),
      ]);
      const q = Array.isArray(quizzes) ? quizzes : [];
      const a = Array.isArray(assignments) ? assignments : [];
      const ac = Array.isArray(activities) ? activities : [];
      setAvailableQuizzes(q);
      setAvailableAssignments(a);
      setAvailableActivities(ac);

      // Update labels for quiz/assignment/activity items already in contentItems
      const labelUpdates: Array<{ uid: string; label: string }> = [
        ...q.map((item: any) => ({ uid: makeUid('quiz', item._id), label: item.title })),
        ...a.map((item: any) => ({ uid: makeUid('assignment', item._id), label: item.title })),
        ...ac.map((item: any) => ({ uid: makeUid('activity', item._id), label: item.title })),
      ];
      updateLabels(labelUpdates);
    } catch (err) {
      console.error('Failed to load linked items:', err);
    }
  };

  // Returns the resolved media list so callers don't rely on stale state from closures
  const loadMediaDetails = async (mediaIds: string[]): Promise<MediaItem[]> => {
    try {
      const data: MediaItem[] = await Promise.all(mediaIds.map(id => mediaAPI.getMediaById(id)));
      setMediaItems(data);
      updateLabels(data.map(m => ({ uid: makeUid('media', m._id), label: m.title })));
      return data;
    } catch (err) {
      console.error('Failed to load media:', err);
      return [];
    }
  };

  const loadSubtopicDetails = async (
    subtopicIds: string[],
    savedOrder?: Array<{ type: string; id: string }>,
    quizIds?: string[], assignIds?: string[], actIds?: string[],
    mediaIds?: string[], resItems?: { name: string; url: string }[],
  ) => {
    try {
      const topics = await docsAPI.getAllTopics();
      const topicList = Array.isArray(topics) ? topics : [];
      setAllTopics(topicList);

      const resolved = subtopicIds
        .map(id => findSubtopic(topicList, id))
        .filter((s): s is SubtopicItem => s !== null);

      setSubtopicItems(resolved);
      updateLabels(resolved.map(s => ({ uid: makeUid('doc', s._id), label: s.subtopicName })));

      // Now rebuild the full contentItems from saved order
      buildContentItemsFromOrder(
        savedOrder,
        mediaIds || [], resolved, resItems || [],
        quizIds || [], assignIds || [], actIds || [],
      );
    } catch (err) {
      console.error('Failed to load subtopics:', err);
    }
  };

  // ── Content addition handlers ─────────────────────────────────────────────

  const handleMediaSelect = (ids: string[]) => {
    // Find newly added IDs
    const newIds = ids.filter(id => !selectedMediaIds.includes(id));
    const removedIds = selectedMediaIds.filter(id => !ids.includes(id));

    setSelectedMediaIds(ids);
    loadMediaDetails(ids).then(data => {
      // Use the freshly-resolved data (not the stale `mediaItems` state) so new chips
      // show the real title instead of falling back to the raw ID.
      const newItems: ContentItem[] = newIds.map(id => {
        const media = data.find(m => m._id === id);
        return { uid: makeUid('media', id), type: 'media', id, label: media?.title || id };
      });
      addToList(newItems);
    });

    // Remove items that were deselected
    if (removedIds.length > 0) removeAllOfType('media', removedIds);
  };

  const removeMedia = (mediaId: string) => {
    setSelectedMediaIds(prev => prev.filter(id => id !== mediaId));
    setMediaItems(prev => prev.filter(m => m._id !== mediaId));
    removeFromList(makeUid('media', mediaId));
  };

  const handleSubtopicSelect = async (subtopicIds: string[]) => {
    const newIds = subtopicIds.filter(id => !selectedSubtopicIds.includes(id));
    const removedIds = selectedSubtopicIds.filter(id => !subtopicIds.includes(id));

    setSelectedSubtopicIds(subtopicIds);

    try {
      let topicList = allTopics;
      if (topicList.length === 0) {
        const topics = await docsAPI.getAllTopics();
        topicList = Array.isArray(topics) ? topics : [];
        setAllTopics(topicList);
      }

      if (newIds.length > 0) {
        const newSubtopics = newIds
          .map(id => findSubtopic(topicList, id))
          .filter((s): s is SubtopicItem => s !== null);

        setSubtopicItems(prev => [...prev, ...newSubtopics]);
        addToList(newSubtopics.map(s => ({ uid: makeUid('doc', s._id), type: 'doc', id: s._id, label: s.subtopicName })));
      }

      if (removedIds.length > 0) {
        setSubtopicItems(prev => prev.filter(s => !removedIds.includes(s._id)));
        removeAllOfType('doc', removedIds);
      }
    } catch (err) {
      console.error('Failed to resolve subtopics:', err);
    }
  };

  const removeSubtopic = (subtopicId: string) => {
    removeFromList(makeUid('doc', subtopicId));
    setSelectedSubtopicIds(prev => prev.filter(id => id !== subtopicId));
    setSubtopicItems(prev => prev.filter(s => s._id !== subtopicId));
  };

  const addResource = () => {
    const url = newResourceUrl.trim();
    if (!url) return;
    const name = newResourceName.trim() || url;
    if (resources.some(r => r.url === url)) return; // already added
    setResources(prev => [...prev, { name, url }]);
    addToList([{ uid: makeUid('resource', url), type: 'resource', id: url, label: name }]);
    setNewResourceName('');
    setNewResourceUrl('');
  };

  const removeResource = (url: string) => {
    setResources(prev => prev.filter(r => r.url !== url));
    removeFromList(makeUid('resource', url));
  };

  const handleQuizSelect = (ids: string[]) => {
    const newIds = ids.filter(id => !linkedQuizIds.includes(id));
    const removedIds = linkedQuizIds.filter(id => !ids.includes(id));
    setLinkedQuizIds(ids);
    if (newIds.length > 0) {
      addToList(newIds.map(id => {
        const quiz = availableQuizzes.find(q => q._id === id);
        return { uid: makeUid('quiz', id), type: 'quiz', id, label: quiz?.title || id };
      }));
    }
    if (removedIds.length > 0) removeAllOfType('quiz', removedIds);
  };

  const removeQuiz = (id: string) => {
    setLinkedQuizIds(prev => prev.filter(x => x !== id));
    removeFromList(makeUid('quiz', id));
  };

  const handleAssignmentSelect = (ids: string[]) => {
    const newIds = ids.filter(id => !linkedAssignmentIds.includes(id));
    const removedIds = linkedAssignmentIds.filter(id => !ids.includes(id));
    setLinkedAssignmentIds(ids);
    if (newIds.length > 0) {
      addToList(newIds.map(id => {
        const assignment = availableAssignments.find(a => a._id === id);
        return { uid: makeUid('assignment', id), type: 'assignment', id, label: assignment?.title || id };
      }));
    }
    if (removedIds.length > 0) removeAllOfType('assignment', removedIds);
  };

  const removeAssignment = (id: string) => {
    setLinkedAssignmentIds(prev => prev.filter(x => x !== id));
    removeFromList(makeUid('assignment', id));
  };

  const handleActivitySelect = (ids: string[]) => {
    const newIds = ids.filter(id => !linkedActivityIds.includes(id));
    const removedIds = linkedActivityIds.filter(id => !ids.includes(id));
    setLinkedActivityIds(ids);
    if (newIds.length > 0) {
      addToList(newIds.map(id => {
        const activity = availableActivities.find(a => a._id === id);
        return { uid: makeUid('activity', id), type: 'activity', id, label: activity?.title || id };
      }));
    }
    if (removedIds.length > 0) removeAllOfType('activity', removedIds);
  };

  const removeActivity = (id: string) => {
    setLinkedActivityIds(prev => prev.filter(x => x !== id));
    removeFromList(makeUid('activity', id));
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setContentItems(items => {
        const oldIdx = items.findIndex(i => i.uid === active.id);
        const newIdx = items.findIndex(i => i.uid === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  // Handle removal from the drag list (syncs back to type arrays)
  const handleRemoveFromList = (uid: string) => {
    const [type, ...rest] = uid.split(':');
    const id = rest.join(':');

    removeFromList(uid);

    if (type === 'media') {
      setSelectedMediaIds(prev => prev.filter(i => i !== id));
      setMediaItems(prev => prev.filter(m => m._id !== id));
    } else if (type === 'doc') {
      setSelectedSubtopicIds(prev => prev.filter(i => i !== id));
      setSubtopicItems(prev => prev.filter(s => s._id !== id));
    } else if (type === 'resource') {
      setResources(prev => prev.filter(r => r.url !== id));
    } else if (type === 'quiz') {
      setLinkedQuizIds(prev => prev.filter(i => i !== id));
    } else if (type === 'assignment') {
      setLinkedAssignmentIds(prev => prev.filter(i => i !== id));
    } else if (type === 'activity') {
      setLinkedActivityIds(prev => prev.filter(i => i !== id));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('priority', formData.priority.toString());
      fd.append('estimatedMinutes', formData.estimatedMinutes.toString());
      fd.append('isPublished', formData.isPublished.toString());

      if (selectedMediaIds.length > 0) fd.append('mediaIds', JSON.stringify(selectedMediaIds));
      if (selectedSubtopicIds.length > 0) fd.append('docSubtopicIds', JSON.stringify(selectedSubtopicIds));
      if (resources.length > 0) fd.append('resources', JSON.stringify(resources));
      if (linkedQuizIds.length > 0) fd.append('linkedQuizIds', JSON.stringify(linkedQuizIds));
      if (linkedAssignmentIds.length > 0) fd.append('linkedAssignmentIds', JSON.stringify(linkedAssignmentIds));
      if (linkedActivityIds.length > 0) fd.append('linkedActivityIds', JSON.stringify(linkedActivityIds));

      // contentOrder: array of {type, id} objects
      const orderPayload = contentItems.map(item => ({ type: item.type, id: item.id }));
      fd.append('contentOrder', JSON.stringify(orderPayload));

      await onSubmit(fd);
      onClose();
    } catch (err) {
      console.error('Error submitting lesson:', err);
      alert('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit Lesson' : 'Add New Lesson'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lesson Title *</label>
            <Input
              type="text" value={formData.title} required placeholder="e.g., Introduction to SQL"
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
              <Input type="number" min="0" value={formData.estimatedMinutes}
                onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Priority</label>
              <Input type="number" min="0" value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {/* ── Content Sources ── */}

          {/* Media */}
          <div className="border-t pt-4">
            <SectionHeader icon={Video} label="Media (Videos / Images)" onAdd={() => setShowMediaPicker(true)} />
            {mediaItems.length === 0
              ? <p className="text-xs text-slate-400 italic">No media selected</p>
              : (
                <div className="flex flex-wrap gap-2">
                  {mediaItems.map(m => (
                    <Chip key={m._id} icon={Video} label={m.title} colorClass={TYPE_META.media.color} onRemove={() => removeMedia(m._id)} />
                  ))}
                </div>
              )
            }
          </div>

          {/* Docs */}
          <div className="border-t pt-4">
            <SectionHeader icon={FileText} label="Documentation" onAdd={() => setShowDocPicker(true)} />
            {subtopicItems.length === 0
              ? <p className="text-xs text-slate-400 italic">No docs selected</p>
              : (
                <div className="flex flex-wrap gap-2">
                  {subtopicItems.map(s => (
                    <Chip key={s._id} icon={FileText} label={s.subtopicName} colorClass={TYPE_META.doc.color} onRemove={() => removeSubtopic(s._id)} />
                  ))}
                </div>
              )
            }
          </div>

          {/* Resources */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-3">
              <LinkIcon className="w-4 h-4" /> Resources
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <Input type="text" value={newResourceName} placeholder="Resource name (e.g. NPTEL Notes PDF)"
                onChange={e => setNewResourceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addResource())}
                className="sm:flex-1" />
              <Input type="url" value={newResourceUrl} placeholder="https://example.com"
                onChange={e => setNewResourceUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addResource())}
                className="sm:flex-1" />
              <Button type="button" size="sm" onClick={addResource} disabled={!newResourceUrl.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resources.map(r => (
                  <Chip key={r.url} icon={LinkIcon} label={r.name} colorClass={TYPE_META.resource.color} onRemove={() => removeResource(r.url)} />
                ))}
              </div>
            )}
          </div>

          {/* Quizzes */}
          <div className="border-t pt-4">
            <SectionHeader icon={Brain} label="Quizzes" count={linkedQuizIds.length} onAdd={() => setShowQuizPicker(true)} addLabel="Link" />
            {linkedQuizIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedQuizIds.map(id => {
                  const q = availableQuizzes.find(q => q._id === id);
                  return q ? (
                    <Chip key={id} icon={Trophy} label={q.title} colorClass={TYPE_META.quiz.color} onRemove={() => removeQuiz(id)} />
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="border-t pt-4">
            <SectionHeader icon={ClipboardList} label="Assignments" count={linkedAssignmentIds.length} onAdd={() => setShowAssignmentPicker(true)} addLabel="Link" />
            {linkedAssignmentIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedAssignmentIds.map(id => {
                  const a = availableAssignments.find(a => a._id === id);
                  return a ? (
                    <Chip key={id} icon={ClipboardList} label={a.title} colorClass={TYPE_META.assignment.color} onRemove={() => removeAssignment(id)} />
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="border-t pt-4">
            <SectionHeader icon={Activity} label="Activities" count={linkedActivityIds.length} onAdd={() => setShowActivityPicker(true)} addLabel="Link" />
            {linkedActivityIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedActivityIds.map(id => {
                  const a = availableActivities.find(a => a._id === id);
                  return a ? (
                    <Chip key={id} icon={Zap} label={a.title} colorClass={TYPE_META.activity.color} onRemove={() => removeActivity(id)} />
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* ── Content Order: Drag-and-drop list ── */}
          <div className="border-t pt-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-800">Content Order</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag steps to reorder how students experience this lesson. Add content above to populate the list.
              </p>
            </div>

            {contentItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <FileDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No content yet — add media, docs, quizzes, or other content above</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={contentItems.map(i => i.uid)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {contentItems.map((item, idx) => (
                      <SortableStep key={item.uid} item={item} index={idx} onRemove={handleRemoveFromList} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Published */}
          <div className="flex items-center gap-2 border-t pt-4">
            <input type="checkbox" id="isPublished" checked={formData.isPublished}
              onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
            <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">Published</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pickers */}
      <MediaPicker isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect} selectedIds={selectedMediaIds} multiple />

      <DocSubtopicPicker isOpen={showDocPicker} onClose={() => setShowDocPicker(false)}
        onSelect={handleSubtopicSelect} selectedIds={selectedSubtopicIds} multiple />

      <SimpleItemPicker
        isOpen={showQuizPicker}
        onClose={() => setShowQuizPicker(false)}
        onSelect={handleQuizSelect}
        selectedIds={linkedQuizIds}
        items={availableQuizzes.map(q => ({ _id: q._id, title: q.title, subtitle: q.description }))}
        title="Quizzes"
        icon={Trophy}
        emptyLabel="No quizzes available yet"
        selectedClass="border-indigo-500 bg-indigo-50"
        selectedIconClass="text-indigo-600"
        selectedDotClass="bg-indigo-600 border-indigo-600"
      />

      <SimpleItemPicker
        isOpen={showAssignmentPicker}
        onClose={() => setShowAssignmentPicker(false)}
        onSelect={handleAssignmentSelect}
        selectedIds={linkedAssignmentIds}
        items={availableAssignments.map(a => ({ _id: a._id, title: a.title, subtitle: a.description }))}
        title="Assignments"
        icon={ClipboardList}
        emptyLabel="No assignments available yet"
        selectedClass="border-orange-500 bg-orange-50"
        selectedIconClass="text-orange-600"
        selectedDotClass="bg-orange-600 border-orange-600"
      />

      <SimpleItemPicker
        isOpen={showActivityPicker}
        onClose={() => setShowActivityPicker(false)}
        onSelect={handleActivitySelect}
        selectedIds={linkedActivityIds}
        items={availableActivities.map(a => ({ _id: a._id, title: a.title, subtitle: a.description }))}
        title="Activities"
        icon={Zap}
        emptyLabel="No activities available yet"
        selectedClass="border-cyan-500 bg-cyan-50"
        selectedIconClass="text-cyan-600"
        selectedDotClass="bg-cyan-600 border-cyan-600"
      />
    </>
  );
};

export default LessonForm;
