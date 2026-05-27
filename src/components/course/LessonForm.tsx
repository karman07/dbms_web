import React, { useState, useEffect } from 'react';
import {
  Video, FileText, Plus, Link as LinkIcon, Brain, ClipboardList, Activity, X,
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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Modal from '../ui/modal';
import MediaPicker from './MediaPicker';
import DocSubtopicPicker from './DocSubtopicPicker';
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
  id: string;        // 'topicId:subtopicName' — used internally in the form
  actualId: string;  // real MongoDB _id — used in contentOrder
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
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
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

  // URL input
  const [newResource, setNewResource] = useState('');

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

      const parseArr = (field: any, extractId = false): string[] => {
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

      const mediaIds = parseArr((lesson as any).mediaIds || (lesson as any).media, true);
      const docIds = parseArr((lesson as any).docSubtopicIds || (lesson as any).docSubtopics, true);
      const resUrls = parseArr(lesson.resources);
      const quizIds = parseArr((lesson as any).linkedQuizIds || (lesson as any).linkedQuizzes, true);
      const assignIds = parseArr((lesson as any).linkedAssignmentIds || (lesson as any).linkedAssignments, true);
      const actIds = parseArr((lesson as any).linkedActivityIds || (lesson as any).linkedActivities, true);

      setSelectedMediaIds(mediaIds);
      setSelectedSubtopicIds(docIds);
      setResources(resUrls);
      setLinkedQuizIds(quizIds);
      setLinkedAssignmentIds(assignIds);
      setLinkedActivityIds(actIds);

      if (mediaIds.length > 0) loadMediaDetails(mediaIds);
      if (docIds.length > 0) loadSubtopicDetails(docIds, lesson.contentOrder, quizIds, assignIds, actIds, mediaIds, resUrls);
      else {
        // Rebuild contentItems from saved contentOrder + available IDs (for non-doc types)
        buildContentItemsFromOrder(lesson.contentOrder, mediaIds, [], resUrls, quizIds, assignIds, actIds);
      }
    } else {
      resetForm();
    }
  }, [lesson, mode, isOpen]);

  const resetForm = () => {
    setFormData({ title: '', priority: 0, estimatedMinutes: 0, isPublished: false });
    setSelectedMediaIds([]); setSelectedSubtopicIds([]); setMediaItems([]); setSubtopicItems([]);
    setResources([]); setLinkedQuizIds([]); setLinkedAssignmentIds([]); setLinkedActivityIds([]);
    setContentItems([]); setNewResource('');
  };

  // Build contentItems from a saved contentOrder array
  const buildContentItemsFromOrder = (
    savedOrder: Array<{ type: string; id: string }> | undefined,
    mediaIds: string[], subtopicItems: SubtopicItem[], resUrls: string[],
    quizIds: string[], assignIds: string[], actIds: string[],
  ) => {
    if (!savedOrder || savedOrder.length === 0) {
      // No saved order: append all available items in default order
      const items: ContentItem[] = [
        ...mediaIds.map(id => ({ uid: makeUid('media', id), type: 'media', id, label: id })),
        ...subtopicItems.map(s => ({ uid: makeUid('doc', s.actualId), type: 'doc', id: s.actualId, label: s.subtopicName })),
        ...resUrls.map(url => ({ uid: makeUid('resource', url), type: 'resource', id: url, label: url })),
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

  const loadMediaDetails = async (mediaIds: string[]) => {
    try {
      const data: MediaItem[] = await Promise.all(mediaIds.map(id => mediaAPI.getMediaById(id)));
      setMediaItems(data);
      updateLabels(data.map(m => ({ uid: makeUid('media', m._id), label: m.title })));
    } catch (err) {
      console.error('Failed to load media:', err);
    }
  };

  const loadSubtopicDetails = async (
    subtopicIds: string[],
    savedOrder?: Array<{ type: string; id: string }>,
    quizIds?: string[], assignIds?: string[], actIds?: string[],
    mediaIds?: string[], resUrls?: string[],
  ) => {
    try {
      const topics = await docsAPI.getAllTopics();
      setAllTopics(Array.isArray(topics) ? topics : []);

      const resolved: SubtopicItem[] = [];

      for (const id of subtopicIds) {
        let topicId = '', subtopicName = '';

        if (id.includes(':')) {
          [topicId, subtopicName] = id.split(':');
        } else {
          // It's an actual MongoDB _id — find it across all topics
          if (Array.isArray(topics)) {
            outer: for (const topic of topics) {
              for (const sub of (topic.subtopics || [])) {
                if (sub._id === id || sub._id?.toString() === id) {
                  topicId = topic._id;
                  subtopicName = sub.name;
                  break outer;
                }
              }
            }
          }
        }

        if (!topicId || !subtopicName) continue;

        const topic = Array.isArray(topics) ? topics.find((t: any) => t._id === topicId) : null;
        if (!topic) continue;
        const sub = topic.subtopics?.find((s: any) => s.name === subtopicName);
        if (!sub) continue;

        const actualId = sub._id?.toString() || `${topicId}:${subtopicName}`;
        const compositeId = `${topicId}:${subtopicName}`;

        resolved.push({ id: compositeId, actualId, topicTitle: topic.title, subtopicName });
      }

      setSubtopicItems(resolved);

      // Update any existing doc labels in contentItems
      updateLabels(resolved.map(s => ({ uid: makeUid('doc', s.actualId), label: s.subtopicName })));

      // Now rebuild the full contentItems from saved order
      buildContentItemsFromOrder(
        savedOrder,
        mediaIds || [], resolved, resUrls || [],
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
    loadMediaDetails(ids).then(() => {
      // Add new items to the ordered list
      const newItems: ContentItem[] = newIds.map(id => {
        const media = mediaItems.find(m => m._id === id);
        return { uid: makeUid('media', id), type: 'media', id, label: media?.title || id };
      });
      addToList(newItems);
    });

    // Remove items that were deselected
    if (removedIds.length > 0) removeAllOfType('media', removedIds);
  };

  const handleSubtopicSelect = async (subtopicIds: string[]) => {
    const newIds = subtopicIds.filter(id => !selectedSubtopicIds.includes(id));
    const removedIds = selectedSubtopicIds.filter(id => !subtopicIds.includes(id));

    setSelectedSubtopicIds(subtopicIds);

    // Resolve actual IDs and add to list
    try {
      const topics = allTopics.length > 0 ? allTopics : await docsAPI.getAllTopics().then(t => { setAllTopics(t || []); return t || []; });

      for (const id of newIds) {
        let topicId = '', subtopicName = '';
        if (id.includes(':')) { [topicId, subtopicName] = id.split(':'); }

        const topic = topics.find((t: any) => t._id === topicId);
        const sub = topic?.subtopics?.find((s: any) => s.name === subtopicName);
        if (!sub) continue;

        const actualId = sub._id?.toString() || id;
        const newItem: ContentItem = { uid: makeUid('doc', actualId), type: 'doc', id: actualId, label: subtopicName };

        addToList([newItem]);
        setSubtopicItems(prev => {
          if (prev.find(s => s.id === id)) return prev;
          return [...prev, { id, actualId, topicTitle: topic.title, subtopicName }];
        });
      }

      // Remove deselected
      for (const id of removedIds) {
        const existing = subtopicItems.find(s => s.id === id);
        if (existing) removeFromList(makeUid('doc', existing.actualId));
        setSubtopicItems(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to resolve subtopics:', err);
    }
  };

  const addResource = () => {
    if (!newResource.trim()) return;
    const url = newResource.trim();
    setResources(prev => [...prev, url]);
    addToList([{ uid: makeUid('resource', url), type: 'resource', id: url, label: url }]);
    setNewResource('');
  };

  const removeMedia = (mediaId: string) => {
    setSelectedMediaIds(prev => prev.filter(id => id !== mediaId));
    setMediaItems(prev => prev.filter(m => m._id !== mediaId));
    removeFromList(makeUid('media', mediaId));
  };

  const removeSubtopic = (compositeId: string) => {
    const item = subtopicItems.find(s => s.id === compositeId);
    if (item) removeFromList(makeUid('doc', item.actualId));
    setSelectedSubtopicIds(prev => prev.filter(id => id !== compositeId));
    setSubtopicItems(prev => prev.filter(s => s.id !== compositeId));
  };

  const removeResource = (url: string) => {
    setResources(prev => prev.filter(r => r !== url));
    removeFromList(makeUid('resource', url));
  };

  const toggleQuiz = (quizId: string) => {
    const adding = !linkedQuizIds.includes(quizId);
    setLinkedQuizIds(prev => adding ? [...prev, quizId] : prev.filter(id => id !== quizId));
    const quiz = availableQuizzes.find(q => q._id === quizId);
    if (adding) addToList([{ uid: makeUid('quiz', quizId), type: 'quiz', id: quizId, label: quiz?.title || quizId }]);
    else removeFromList(makeUid('quiz', quizId));
  };

  const toggleAssignment = (assignId: string) => {
    const adding = !linkedAssignmentIds.includes(assignId);
    setLinkedAssignmentIds(prev => adding ? [...prev, assignId] : prev.filter(id => id !== assignId));
    const assignment = availableAssignments.find(a => a._id === assignId);
    if (adding) addToList([{ uid: makeUid('assignment', assignId), type: 'assignment', id: assignId, label: assignment?.title || assignId }]);
    else removeFromList(makeUid('assignment', assignId));
  };

  const toggleActivity = (actId: string) => {
    const adding = !linkedActivityIds.includes(actId);
    setLinkedActivityIds(prev => adding ? [...prev, actId] : prev.filter(id => id !== actId));
    const activity = availableActivities.find(a => a._id === actId);
    if (adding) addToList([{ uid: makeUid('activity', actId), type: 'activity', id: actId, label: activity?.title || actId }]);
    else removeFromList(makeUid('activity', actId));
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
      const item = subtopicItems.find(s => s.actualId === id);
      if (item) {
        setSelectedSubtopicIds(prev => prev.filter(i => i !== item.id));
        setSubtopicItems(prev => prev.filter(s => s.actualId !== id));
      }
    } else if (type === 'resource') {
      setResources(prev => prev.filter(r => r !== id));
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

      if (selectedSubtopicIds.length > 0) {
        // Convert topicId:subtopicName → actual MongoDB _id
        const actualIds: string[] = [];
        for (const selId of selectedSubtopicIds) {
          const found = subtopicItems.find(s => s.id === selId);
          if (found) actualIds.push(found.actualId);
        }
        fd.append('docSubtopicIds', JSON.stringify(actualIds));
      }

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
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Video className="w-4 h-4" /> Media (Videos / Images)
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowMediaPicker(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {mediaItems.length === 0
              ? <p className="text-xs text-slate-400 italic">No media selected</p>
              : (
                <div className="flex flex-wrap gap-2">
                  {mediaItems.map(m => (
                    <span key={m._id} className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                      <Video className="w-3 h-3" /> {m.title}
                      <button type="button" onClick={() => removeMedia(m._id)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )
            }
          </div>

          {/* Docs */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Documentation
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowDocPicker(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {subtopicItems.length === 0
              ? <p className="text-xs text-slate-400 italic">No docs selected</p>
              : (
                <div className="flex flex-wrap gap-2">
                  {subtopicItems.map(s => (
                    <span key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                      <FileText className="w-3 h-3" /> {s.subtopicName}
                      <button type="button" onClick={() => removeSubtopic(s.id)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )
            }
          </div>

          {/* Resources */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-3">
              <LinkIcon className="w-4 h-4" /> Resources (URLs)
            </label>
            <div className="flex gap-2 mb-2">
              <Input type="url" value={newResource} placeholder="https://example.com"
                onChange={e => setNewResource(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addResource())} />
              <Button type="button" size="sm" onClick={addResource}><Plus className="w-4 h-4" /></Button>
            </div>
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resources.map(url => (
                  <span key={url} className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium max-w-[220px]">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{url}</span>
                    <button type="button" onClick={() => removeResource(url)} className="hover:text-red-500 flex-shrink-0"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quizzes */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Quizzes ({linkedQuizIds.length})
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowQuizPicker(true)}>
                <Plus className="w-4 h-4 mr-1" /> Link
              </Button>
            </div>
            {linkedQuizIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedQuizIds.map(id => {
                  const q = availableQuizzes.find(q => q._id === id);
                  return q ? (
                    <Badge key={id} className="bg-indigo-100 text-indigo-700">
                      {q.title} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleQuiz(id)} />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" /> Assignments ({linkedAssignmentIds.length})
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAssignmentPicker(true)}>
                <Plus className="w-4 h-4 mr-1" /> Link
              </Button>
            </div>
            {linkedAssignmentIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedAssignmentIds.map(id => {
                  const a = availableAssignments.find(a => a._id === id);
                  return a ? (
                    <Badge key={id} className="bg-orange-100 text-orange-700">
                      {a.title} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleAssignment(id)} />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Activities ({linkedActivityIds.length})
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowActivityPicker(true)}>
                <Plus className="w-4 h-4 mr-1" /> Link
              </Button>
            </div>
            {linkedActivityIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedActivityIds.map(id => {
                  const a = availableActivities.find(a => a._id === id);
                  return a ? (
                    <Badge key={id} className="bg-cyan-100 text-cyan-700">
                      {a.title} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => toggleActivity(id)} />
                    </Badge>
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

      <Modal isOpen={showQuizPicker} onClose={() => setShowQuizPicker(false)} title="Select Quizzes" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableQuizzes.map(q => (
            <div key={q._id} onClick={() => toggleQuiz(q._id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${linkedQuizIds.includes(q._id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <p className="font-medium text-sm">{q.title}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showAssignmentPicker} onClose={() => setShowAssignmentPicker(false)} title="Select Assignments" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableAssignments.map(a => (
            <div key={a._id} onClick={() => toggleAssignment(a._id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${linkedAssignmentIds.includes(a._id) ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <p className="font-medium text-sm">{a.title}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showActivityPicker} onClose={() => setShowActivityPicker(false)} title="Select Activities" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableActivities.map(a => (
            <div key={a._id} onClick={() => toggleActivity(a._id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${linkedActivityIds.includes(a._id) ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <p className="font-medium text-sm">{a.title}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default LessonForm;
