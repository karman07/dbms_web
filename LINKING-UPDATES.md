# Linking Updates — Multiple Links & Bidirectional Sync

Summary
- Lessons now support multiple linked quizzes, assignments, and class activities.
- Linking/unlinking a quiz/assignment/activity updates both sides:
  - The resource document (`Quiz`, `Assignment`, `ClassActivity`) stores `lessonId`.
  - The corresponding lesson in the course stores arrays of linked IDs (`linkedQuizIds`, `linkedAssignmentIds`, `linkedActivityIds`).
- Course GET endpoints populate full resource objects on each lesson as `linkedQuizzes`, `linkedAssignments`, and `linkedActivities`.

Files changed
- `src/courses/schemas/course.schema.ts`
  - Replaced single linked IDs with arrays: `linkedQuizIds`, `linkedAssignmentIds`, `linkedActivityIds`.

- `src/quiz/quiz.service.ts`
  - `linkToLesson` now sets `quiz.lessonId` and pushes the quiz _id into the lesson's `linkedQuizIds` array (no duplicates).
  - `unlinkFromLesson` clears `quiz.lessonId` and removes the quiz _id from the lesson's `linkedQuizIds` array.
  - `findByLessonId` now returns all quizzes for a lesson (array), not a single item.

- `src/assignment/assignment.service.ts`
  - `linkToLesson` now sets `assignment.lessonId` and pushes the assignment _id into `linkedAssignmentIds`.
  - `unlinkFromLesson` clears `assignment.lessonId` and removes the id from `linkedAssignmentIds`.
  - `findByLessonId` now returns an array of assignments for a lesson.

- `src/class-activity/class-activity.service.ts`
  - `linkToLesson` now sets `activity.lessonId` and pushes the activity _id into `linkedActivityIds`.
  - `unlinkFromLesson` clears `activity.lessonId` and removes the id from `linkedActivityIds`.
  - `findByLessonId` now returns an array of activities for a lesson.

- `src/courses/courses.service.ts`
  - Injected `Quiz`, `Assignment`, and `ClassActivity` models.
  - `getPublishedCourse()` and `getCourseAdmin()` now call `populateLinkedResources(course)` before returning.
  - `populateLinkedResources(course)` attaches the arrays `linkedQuizzes`, `linkedAssignments`, and `linkedActivities` to each lesson.

Behavior / Notes
- Multiple linking allowed: you can link the same lesson to multiple quizzes/assignments/activities.
- Linking is idempotent: linking an already-linked resource won't duplicate the id in the lesson arrays.
- Unlinking removes only the specified resource id from the lesson arrays.
- GET `/courses` (published) and GET `/courses/admin` (admin) will now include full linked resource objects on each lesson under the keys:
  - `lesson.linkedQuizzes` (array)
  - `lesson.linkedAssignments` (array)
  - `lesson.linkedActivities` (array)

Controller endpoints affected (no route changes)
- `POST /quiz/admin/:quizId/link-lesson/:lessonId` — now updates lesson arrays
- `DELETE /quiz/admin/:quizId/unlink-lesson` — now removes id from lesson arrays
- Same pattern for `assignment` and `class-activity` link/unlink routes
- `GET /quiz/lesson/:lessonId`, `GET /assignment/lesson/:lessonId`, `GET /class-activity/lesson/:lessonId`
  - These now return arrays of resources (all items linked to the lesson)

Testing checklist
1. Link multiple quizzes to the same lesson:
   - `POST /quiz/admin/:quizId/link-lesson/:lessonId` for two different `quizId`s.
   - `GET /courses` and confirm `lesson.linkedQuizzes` has both quizzes.
2. Unlink one quiz:
   - `DELETE /quiz/admin/:quizId/unlink-lesson`
   - `GET /courses` confirm only remaining quiz present.
3. Repeat for assignments and activities.
4. Verify `GET /quiz/lesson/:lessonId` (and corresponding assignment/activity endpoints) returns all linked items.
5. Ensure no duplicate IDs are added when re-linking the same resource.

Potential follow-ups / improvements
- Add database-level references/populate to return resources via `populate()` instead of manual queries.
- Add unit/e2e tests for linking/unlinking flows and `populateLinkedResources`.
- Add validation to ensure `lessonId` exists before linking (currently handled implicitly; could add explicit checks).

If you want I can:
- Run the dev server and fix any type errors now.
- Add tests for the linking flows.
- Update API docs (`ALL-MODULES-API-DOCUMENTATION.md`) to note that lesson objects include `linked*` arrays.


## Schema Changes (Detailed)

Below are the exact schema-level changes made and runtime additions for lessons.

- File: `src/courses/schemas/course.schema.ts`

  Before (single-link fields):

  ```ts
  @Prop({ type: Types.ObjectId, ref: 'Quiz' })
  linkedQuizId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assignment' })
  linkedAssignmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClassActivity' })
  linkedActivityId?: Types.ObjectId;
  ```

  After (support multiple links - arrays):

  ```ts
  @Prop({ type: [Types.ObjectId], ref: 'Quiz', default: [] })
  linkedQuizIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Assignment', default: [] })
  linkedAssignmentIds?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'ClassActivity', default: [] })
  linkedActivityIds?: Types.ObjectId[];
  ```

Also: replace embedded lesson `content` with a doc association (references into `DocTopic` subtopics):

Before:

```ts
@Prop({ required: true })
content: string; // Markdown content or HTML
```

After:

```ts
@Prop({ type: Types.ObjectId, ref: 'DocTopic' })
docTopicId?: Types.ObjectId;

@Prop()
docSubtopicId?: Types.ObjectId;
```

- File: `src/quiz/schemas/quiz.schema.ts`

  - No schema field added for linking beyond the existing `lessonId?: Types.ObjectId;` — this remains the canonical pointer from a Quiz to its lesson.

- File: `src/assignment/schemas/assignment.schema.ts`

  - No schema field added beyond the existing `lessonId?: Types.ObjectId;`.

- File: `src/class-activity/schemas/class-activity.schema.ts`

  - No schema field added beyond the existing `lessonId?: Types.ObjectId;`.

Runtime additions (populated fields returned by course GET endpoints)

- `src/courses/courses.service.ts` now attaches the following properties to each lesson object before returning a Course:
  - `lesson.linkedQuizzes` — array of full `Quiz` documents linked to that lesson
  - `lesson.linkedAssignments` — array of full `Assignment` documents linked to that lesson
  - `lesson.linkedActivities` — array of full `ClassActivity` documents linked to that lesson

Additional note: GET endpoints return full objects
- `getPublishedCourse()` now uses `findOne().lean()` and `populateLinkedResources()` so the API returns plain JSON with the attached `linkedQuizzes`, `linkedAssignments`, and `linkedActivities` arrays (full documents) rather than only ids.
- `getCourseAdmin()` converts the mongoose doc to a plain object and attaches the same runtime fields before returning.

Notes
- The arrays on the lesson (`linkedQuizIds`, etc.) are persisted in the Course document and reflect the current linked resource _ids.
- The `linkedQuizzes` / `linkedAssignments` / `linkedActivities` fields are attached at runtime by `populateLinkedResources()` and are not schema properties on the `Lesson` class; they are convenience properties returned to API clients.

