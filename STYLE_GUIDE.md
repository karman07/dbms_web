# 🎨 Visual Style Guide - Course Management UI

## Color Palette Reference

### Primary Colors (Blue Theme)
```css
/* Backgrounds */
bg-blue-50          /* Very light blue - headers, stats */
bg-blue-100         /* Light blue - badges, icon containers */
bg-blue-600         /* Primary buttons */
bg-blue-700         /* Primary button hover */

/* Text & Borders */
text-blue-600       /* Primary text, secondary buttons */
text-blue-700       /* Badge text */
border-blue-200     /* Secondary button borders */
border-blue-500     /* Card accent borders */
```

### Semantic Colors
```css
/* Success/Published */
bg-green-100 text-green-700

/* Warning/Resources */
bg-orange-100 text-orange-700

/* Info/Video */
bg-purple-100 text-purple-600

/* Danger/Delete */
text-red-600 border-red-200 hover:bg-red-50
```

---

## Component Styles

### 1. Cards

#### Main Course Card
```tsx
<Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
    {/* Content */}
  </CardHeader>
</Card>
```

#### Section Card
```tsx
<Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
  <CardHeader className="bg-gradient-to-r from-blue-50/30 to-transparent">
    {/* Content */}
  </CardHeader>
</Card>
```

#### Lesson Card
```tsx
<div className="p-4 bg-white hover:bg-blue-50/50 rounded-lg transition-all 
                border border-gray-200 hover:border-blue-300 hover:shadow-md">
  {/* Content */}
</div>
```

---

### 2. Buttons

#### Primary Action
```tsx
<Button className="bg-blue-600 hover:bg-blue-700">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>
```

#### Secondary Action
```tsx
<Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
  <Icon className="h-4 w-4 mr-2" />
  Action Text
</Button>
```

#### Danger Action
```tsx
<Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

### 3. Badges

#### Info Badge (Default)
```tsx
<Badge className="bg-blue-100 text-blue-700">
  {count} items
</Badge>
```

#### Success Badge
```tsx
<Badge className="bg-green-100 text-green-700">
  ✓ Published
</Badge>
```

#### Warning Badge
```tsx
<Badge className="bg-orange-100 text-orange-700">
  {count} resources
</Badge>
```

---

### 4. Icon Containers

```tsx
{/* Blue Container */}
<div className="p-2 bg-blue-100 rounded-lg">
  <FileText className="h-5 w-5 text-blue-600" />
</div>

{/* Purple Container (for videos) */}
<div className="p-2 bg-purple-100 rounded-lg">
  <Video className="h-5 w-5 text-purple-600" />
</div>

{/* Indigo Container */}
<div className="p-2 bg-indigo-100 rounded-lg">
  <BookOpen className="h-4 w-4 text-indigo-600" />
</div>
```

---

### 5. Preview Modals

```tsx
{/* Modal Container */}
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
    
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Icon className="h-6 w-6" />
        Preview Title
      </h3>
    </div>
    
    {/* Content */}
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
      {/* Content here */}
    </div>
  </div>
</div>
```

---

### 6. Empty States

```tsx
<div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-200">
  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
    <Icon className="h-10 w-10 text-blue-600" />
  </div>
  <p className="text-gray-600 mb-3 font-medium">Empty state message</p>
  <Button className="bg-blue-600 hover:bg-blue-700">
    <Plus className="h-4 w-4 mr-2" />
    Add Item
  </Button>
</div>
```

---

### 7. Stats Section

```tsx
<div className="flex items-center gap-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-lg">
  <div className="flex items-center gap-2">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Users className="h-4 w-4 text-blue-600" />
    </div>
    <span className="font-medium">{count} enrolled</span>
  </div>
  {/* More stats */}
</div>
```

---

## Gradient Patterns

### Headers
```css
bg-gradient-to-r from-blue-50 to-indigo-50       /* Light gradient */
bg-gradient-to-r from-blue-50/30 to-transparent  /* Subtle fade */
bg-gradient-to-r from-blue-600 to-indigo-600     /* Modal headers */
```

### Backgrounds
```css
bg-gradient-to-r from-blue-50 to-indigo-50       /* Content preview box */
bg-gradient-to-br from-gray-50/50 to-blue-50/30  /* Card content areas */
```

---

## Hover Effects

### Cards
```css
hover:shadow-lg transition-shadow           /* Section cards */
hover:bg-blue-50/50 hover:border-blue-300  /* Lesson items */
hover:shadow-md transition-all              /* All transitions */
```

### Buttons
```css
hover:bg-blue-700                          /* Primary buttons */
hover:bg-blue-50                           /* Secondary buttons */
hover:bg-red-50                            /* Delete buttons */
```

### Icons
```css
hover:text-blue-700 transition-colors      /* Interactive icons */
hover:bg-blue-100 rounded                  /* Icon buttons */
```

---

## Spacing & Layout

### Card Spacing
```css
space-y-6    /* Between main sections */
space-y-4    /* Between section cards */
space-y-3    /* Between lesson items */
space-y-2    /* Compact lists */
```

### Padding
```css
p-6          /* Card content */
p-4          /* Lesson items, headers */
p-3          /* Icon containers */
p-2          /* Small containers */
px-6 py-4    /* Modal headers */
```

### Gaps
```css
gap-6        /* Stats, large spacing */
gap-4        /* Medium spacing */
gap-3        /* Default spacing */
gap-2        /* Small spacing */
```

---

## Typography

### Headings
```css
text-3xl text-gray-900              /* Main course title */
text-2xl text-gray-900              /* Modal titles */
text-xl text-gray-900               /* Section titles */
font-semibold text-gray-900         /* Lesson titles */
```

### Body Text
```css
text-base                           /* Descriptions */
text-sm text-gray-600               /* Meta info */
text-xs                             /* Badges, hints */
```

---

## Borders

### Accent Borders
```css
border-l-4 border-l-blue-500       /* Primary cards */
border-l-4 border-l-blue-400       /* Secondary cards */
```

### Regular Borders
```css
border border-gray-200              /* Default borders */
border-2 border-blue-200            /* Content preview */
border-2 border-dashed border-blue-200  /* Empty states */
```

---

## Shadow Levels

```css
shadow-lg                          /* Cards at rest */
hover:shadow-xl                    /* Cards on hover */
shadow-xl                          /* Modals */
hover:shadow-md                    /* Interactive items */
```

---

## Icon Sizes

```css
h-12 w-12        /* Large empty state icons */
h-10 w-10        /* Empty state icons */
h-8 w-8          /* Header icons */
h-6 w-6          /* Modal title icons */
h-5 w-5          /* Lesson type icons */
h-4 w-4          /* Button icons, stats */
h-3 w-3          /* Inline meta icons */
```

---

## Quick Reference: Common Patterns

### Preview Button
```tsx
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => setShowPreview(true)}
  className="text-xs"
>
  👁️ Preview: {item.title}
</Button>
```

### Status Badge
```tsx
<Badge className={item.isPublished 
  ? 'bg-green-100 text-green-700' 
  : 'bg-gray-100 text-gray-600'
}>
  {item.isPublished ? '✓ Published' : 'Draft'}
</Badge>
```

### Action Button Group
```tsx
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" 
          className="border-blue-200 text-blue-600 hover:bg-blue-50">
    <Edit className="h-4 w-4" />
  </Button>
  <Button variant="outline" size="sm"
          className="text-red-600 hover:bg-red-50 border-red-200">
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

---

## ✨ Design Principles

1. **Consistency**: Always use blue as primary color
2. **Hierarchy**: Gradients and borders guide attention
3. **Feedback**: Hover states on all interactive elements
4. **Semantics**: Green = success, Orange = info, Red = danger
5. **Spacing**: Generous padding, consistent gaps
6. **Icons**: Always pair with text or in containers
7. **Shadows**: Subtle at rest, pronounced on hover
8. **Transitions**: Smooth `transition-all` or `transition-colors`

This creates a cohesive, professional admin interface! 🎨
