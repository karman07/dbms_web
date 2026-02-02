# Changes Implemented — until 2026-02-02

Summary
-------
- Implemented bidirectional linking between course lessons and resources (quiz, assignment, class activity).
- Converted single lesson link fields to arrays to support multiple links per lesson.
- Ensured GET /courses (public & admin) returns full linked resources (not just IDs).
- Replaced embedded lesson content with a doc/subtopic association model and added a standalone `DocSubtopic` schema.
- Fixed DI and Mongoose VersionError issues by registering models where needed and using atomic updates.

Major design changes
--------------------
- Bidirectional linking
  - Resources (quiz/assignment/class-activity) now set a `lessonId` when linked.
  - The course lesson object now keeps arrays: `linkedQuizIds`, `linkedAssignmentIds`, `linkedActivityIds`.
  - Link/unlink operations update both sides atomically using Mongo update operators (`$addToSet` / `$pull` plus `arrayFilters`) to avoid VersionError.

- Multiple links per lesson
  - Lesson schemas changed from single ID fields to arrays to allow many resources attached to one lesson.

- Return full resource objects
  - `CoursesService` now populates `lesson.linkedQuizzes`, `lesson.linkedAssignments`, and `lesson.linkedActivities` with the full documents (via `.find(...).lean()`), so API consumers receive rich objects.

- Doc / Subtopic association
  - Introduced a standalone `DocSubtopic` schema to represent markdown subtopics.
  - Lessons reference doc content via `docSubtopicId` (and previously `docTopicId` was used in a transitional approach).
  - `CoursesService.populateLinkedResources()` attaches `lesson.doc` when a subtopic is referenced.

Files added
-----------
- [src/docs/schemas/doc-subtopic.schema.ts](src/docs/schemas/doc-subtopic.schema.ts)
- [CHANGES-UNTIL-2026-02-02.md](CHANGES-UNTIL-2026-02-02.md) (this file)

Files modified (high level)
-------------------------
- `src/courses/schemas/course.schema.ts` — lesson fields changed to include arrays (`linkedQuizIds`, `linkedAssignmentIds`, `linkedActivityIds`) and `docSubtopicId` reference.
- `src/quiz/quiz.service.ts` — `linkToLesson`/`unlinkFromLesson` updated to set `lessonId` and atomically update embedded lesson arrays; `findByLessonId` returns arrays.
- `src/assignment/assignment.service.ts` — same linking/unlinking changes.
- `src/class-activity/class-activity.service.ts` — same linking/unlinking changes.
- `src/courses/courses.service.ts` — `getPublishedCourse()` and `getCourseAdmin()` return plain objects; added `populateLinkedResources()` to attach full resources and doc subtopic content; uses `.lean()` for queries.
- `src/courses/courses.module.ts` — registered `DocSubtopic` model so `CoursesService` can inject it.
- Resource modules (quiz/assignment/class-activity) — registered `Course` model to resolve DI in resource services.

Schema changes (detailed)
-------------------------
- `Course` / Lesson embedded schema:
  - Replaced single-link fields with arrays:
    - `linkedQuizIds: Types.ObjectId[]` (was `quizId`)
    - `linkedAssignmentIds: Types.ObjectId[]` (was `assignmentId`)
    - `linkedActivityIds: Types.ObjectId[]` (was `activityId`)
  - Added `docSubtopicId: Types.ObjectId` to reference standalone `DocSubtopic` documents (lessons previously embedded `content` directly).
  - Lessons still include existing metadata (title, duration, etc.) but now support multiple linked resources.

- `DocSubtopic` (new standalone schema):
  - Fields: `name`, `filename`, `content` (markdown), timestamps.
  - Stored under `src/docs/schemas/doc-subtopic.schema.ts` and registered in `CoursesModule`.

- Resource schemas (Quiz / Assignment / ClassActivity):
  - Each resource now optionally stores `lessonId` (ObjectId) when linked to a lesson.
  - `findByLessonId()` methods in services return arrays of matching resources (0..n) rather than a single item.

Response changes (API shapes)
---------------------------
- `GET /courses` (public) and `GET /courses/admin` (admin):
  - Each `lesson` now includes runtime-attached arrays (when applicable):
    - `linkedQuizzes: Quiz[]` — full quiz documents attached to the lesson.
    - `linkedAssignments: Assignment[]` — full assignment documents.
    - `linkedActivities: ClassActivity[]` — full class-activity documents.
  - If a lesson references a doc subtopic (`docSubtopicId`), the service attaches `lesson.doc` containing the subtopic content and parent topic info (if available):
    - `lesson.doc = { _id, name, filename, content, topicId?, topic? }`
  - The course object returned is a plain JSON object (via `.lean()` or `.toObject()`), so consumers receive stable, serializable responses.

- Link / Unlink endpoints (quiz/assignment/class-activity):
  - Link/unlink operations modify both sides atomically:
    - Resource document: `lessonId` is set/cleared.
    - Course lesson embedded array: resource id is added/removed from the appropriate `linked*Ids` array.
  - Clients should not rely on a resource being unique per-lesson; a lesson may now have multiple quizzes/assignments/activities.


Technical details & rationale
---------------------------
- Avoid VersionError: Replaced read-modify-save of the Course document (which caused mongoose VersionError with concurrent updates) with atomic `findByIdAndUpdate` operations using `$addToSet` and `$pull` and `arrayFilters` to update embedded lesson arrays safely.
- Plain JSON responses: Using `.lean()` or `.toObject()` before attaching runtime fields avoids mixing mongoose document getters/setters and makes API responses safe to JSON-serialize.
- DI fixes: Some services required the `Course` model injected; modules were updated to include the missing model registrations to satisfy Nest DI.

Remaining work / migration notes
-------------------------------
- Controllers still create/update `lesson.content` directly in some admin endpoints. They should be updated to create `DocSubtopic` documents (or accept `docSubtopicId`) and set `lesson.docSubtopicId` instead.
- Tests and runtime validation: The changes were applied to code, but full end-to-end verification requires running the dev server and exercising linking/unlinking flows.
- API docs: Update public API documentation to reflect that lessons now include `linkedQuizzes`, `linkedAssignments`, `linkedActivities`, and `lesson.doc` when applicable.

How to test locally
-------------------
1. Start dev server:

```bash
npm run start:dev
```

2. Create or update lessons via admin endpoints; when creating lesson markdown, create a `DocSubtopic` (or pass `docSubtopicId`) and set it on the lesson.
3. Use resource link endpoints (quiz/assignment/class-activity) to link/unlink resources to lesson IDs and ensure both sides are updated.
4. Call GET /courses (public) and GET /courses/admin and verify each lesson has `linkedQuizzes`/`linkedAssignments`/`linkedActivities` arrays and `lesson.doc` when a subtopic is referenced.

Notes
-----
- If you want, I can update the admin controllers to create `DocSubtopic` entries from uploaded markdown and set `lesson.docSubtopicId` automatically. This is the high-priority next step.

— End of changelog
