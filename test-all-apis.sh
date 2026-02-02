#!/bin/bash

# API Test Script - Complete Platform Testing
# This script tests all API endpoints with sample data

BASE_URL="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzhiMDQ0YmVkYWU4Yjg4N2YzMGM4NCIsImVtYWlsIjoiYWRtaW5AY291cnNlYXBwLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MDAwMzE2NiwiZXhwIjoxNzcwMDg5NTY2fQ.kDXLHpT_zXPwrjHi2I0S3YUpyrFQnLbGTMjwi4-mBgc"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables to store IDs
COURSE_ID=""
SECTION_ID=""
LESSON_ID=""
QUIZ_ID=""
ASSIGNMENT_ID=""
ACTIVITY_ID=""
TOPIC_ID=""
NOTE_ID=""
USER_ID=""

echo "========================================="
echo "API Testing Script - Complete Platform"
echo "========================================="
echo ""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Function to extract ID from JSON response
extract_id() {
    echo "$1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4
}

echo "========================================="
echo "1. AUTHENTICATION & USERS"
echo "========================================="

# Test 1: Get My Profile
echo -n "Testing: Get My Profile... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get My Profile" || print_result 1 "Get My Profile (HTTP $HTTP_CODE)"

# Test 2: Get All Users
echo -n "Testing: Get All Users... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Users" || print_result 1 "Get All Users (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "2. COURSES MODULE"
echo "========================================="

# Test 3: Create Course
echo -n "Testing: Create Course... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/courses/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test DBMS Course",
    "description": "Complete database management course for testing",
    "isPublished": true,
    "tags": ["database", "sql", "test"]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
COURSE_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Course (ID: $COURSE_ID)" || print_result 1 "Create Course (HTTP $HTTP_CODE)"

# Test 4: Get Course (Admin)
echo -n "Testing: Get Course (Admin)... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/courses/admin" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get Course Admin" || print_result 1 "Get Course Admin (HTTP $HTTP_CODE)"

# Test 5: Add Section
echo -n "Testing: Add Section... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/courses/admin/section" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to DBMS",
    "description": "Learn database fundamentals",
    "order": 0
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
SECTION_ID=$(echo "$BODY" | grep -o '"sections":\[{"_id":"[^"]*"' | cut -d'"' -f6)
[ "$HTTP_CODE" = "201" ] && print_result 0 "Add Section (ID: $SECTION_ID)" || print_result 1 "Add Section (HTTP $HTTP_CODE)"

# Test 6: Add Lesson
echo -n "Testing: Add Lesson... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/courses/admin/section/0/lesson" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=DBMS Tutorial" \
  -F "content=# Introduction\n\nLearn DBMS basics..." \
  -F "order=0" \
  -F "videoUrl=https://youtube.com/watch?v=test" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
LESSON_ID=$(echo "$BODY" | grep -o '"_id":"[a-f0-9]*"' | head -1 | cut -d'"' -f4)
if [ -z "$LESSON_ID" ]; then
    LESSON_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['sections'][0]['lessons'][0]['_id'])" 2>/dev/null || echo "")
fi
[ "$HTTP_CODE" = "201" ] && print_result 0 "Add Lesson (ID: $LESSON_ID)" || print_result 1 "Add Lesson (HTTP $HTTP_CODE)"

# Test 7: Get Published Course
echo -n "Testing: Get Published Course... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/courses")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get Published Course" || print_result 1 "Get Published Course (HTTP $HTTP_CODE)"

# Test 8: Enroll in Course
echo -n "Testing: Enroll in Course... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/courses/enroll" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "201" ] && print_result 0 "Enroll in Course" || print_result 1 "Enroll in Course (HTTP $HTTP_CODE)"

# Test 9: Get My Progress
echo -n "Testing: Get My Progress... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/courses/my-progress" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get My Progress" || print_result 1 "Get My Progress (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "3. QUIZ MODULE"
echo "========================================="

# Test 10: Create Quiz
echo -n "Testing: Create Quiz... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/quiz/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"DBMS Fundamentals Quiz\",
    \"description\": \"Test your knowledge\",
    \"lessonId\": \"$LESSON_ID\",
    \"questions\": [
      {
        \"question\": \"What is DBMS?\",
        \"options\": [
          {\"text\": \"Database Management System\", \"isCorrect\": true},
          {\"text\": \"Data Binary Management\", \"isCorrect\": false}
        ],
        \"explanation\": \"DBMS stands for Database Management System\"
      }
    ]
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
QUIZ_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Quiz (ID: $QUIZ_ID)" || print_result 1 "Create Quiz (HTTP $HTTP_CODE)"

# Test 11: Get All Quizzes
echo -n "Testing: Get All Quizzes... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/quiz/admin" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Quizzes" || print_result 1 "Get All Quizzes (HTTP $HTTP_CODE)"

# Test 12: Get Quiz by Lesson
if [ ! -z "$LESSON_ID" ]; then
    echo -n "Testing: Get Quiz by Lesson... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/quiz/lesson/$LESSON_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "200" ] && print_result 0 "Get Quiz by Lesson" || print_result 1 "Get Quiz by Lesson (HTTP $HTTP_CODE)"
else
    echo -e "${YELLOW}⊘ SKIP${NC}: Get Quiz by Lesson (No LESSON_ID)"
fi

# Test 13: Submit Quiz
if [ ! -z "$QUIZ_ID" ] && [ ! -z "$LESSON_ID" ]; then
    echo -n "Testing: Submit Quiz... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/quiz/submit" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"quizId\":\"$QUIZ_ID\",\"lessonId\":\"$LESSON_ID\",\"answers\":[{\"questionIndex\":0,\"selectedOptionIndex\":0}]}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "201" ] && print_result 0 "Submit Quiz" || print_result 1 "Submit Quiz (HTTP $HTTP_CODE)"
else
    echo -e "${YELLOW}⊘ SKIP${NC}: Submit Quiz (Missing QUIZ_ID or LESSON_ID)"
fi

echo ""
echo "========================================="
echo "4. ASSIGNMENT MODULE"
echo "========================================="

# Test 14: Create Assignment
echo -n "Testing: Create Assignment... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/assignment/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Normalization Assignment" \
  -F "description=Complete all exercises" \
  -F "content=# Assignment\n\n## Exercise 1\nNormalize the given table..." \
  -F "lessonId=$LESSON_ID" \
  -F "maxScore=100")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
ASSIGNMENT_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Assignment (ID: $ASSIGNMENT_ID)" || print_result 1 "Create Assignment (HTTP $HTTP_CODE)"

# Test 15: Get All Assignments
echo -n "Testing: Get All Assignments... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/assignment/admin" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Assignments" || print_result 1 "Get All Assignments (HTTP $HTTP_CODE)"

# Test 16: Get Assignment by Lesson
if [ ! -z "$LESSON_ID" ]; then
    echo -n "Testing: Get Assignment by Lesson... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/assignment/lesson/$LESSON_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "200" ] && print_result 0 "Get Assignment by Lesson" || print_result 1 "Get Assignment by Lesson (HTTP $HTTP_CODE)"
else
    echo -e "${YELLOW}⊘ SKIP${NC}: Get Assignment by Lesson (No LESSON_ID)"
fi

echo ""
echo "========================================="
echo "5. CLASS ACTIVITY MODULE"
echo "========================================="

# Test 17: Create Class Activity
echo -n "Testing: Create Class Activity... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/class-activity/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=SQL Practice Session" \
  -F "description=Hands-on SQL queries" \
  -F "content=# Activity\n\n## Task 1\nWrite SELECT queries..." \
  -F "lessonId=$LESSON_ID" \
  -F "duration=60")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
ACTIVITY_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Class Activity (ID: $ACTIVITY_ID)" || print_result 1 "Create Class Activity (HTTP $HTTP_CODE)"

# Test 18: Get All Activities
echo -n "Testing: Get All Activities... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/class-activity/admin" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Activities" || print_result 1 "Get All Activities (HTTP $HTTP_CODE)"

# Test 19: Get Activity by Lesson
if [ ! -z "$LESSON_ID" ]; then
    echo -n "Testing: Get Activity by Lesson... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/class-activity/lesson/$LESSON_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "200" ] && print_result 0 "Get Activity by Lesson" || print_result 1 "Get Activity by Lesson (HTTP $HTTP_CODE)"
else
    echo -e "${YELLOW}⊘ SKIP${NC}: Get Activity by Lesson (No LESSON_ID)"
fi

echo ""
echo "========================================="
echo "6. NOTES MODULE"
echo "========================================="

# Test 20: Create Note
echo -n "Testing: Create Note... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ACID Properties",
    "content": "Atomicity, Consistency, Isolation, Durability",
    "source": "Lecture Notes",
    "tags": ["database", "transactions"]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
NOTE_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Note (ID: $NOTE_ID)" || print_result 1 "Create Note (HTTP $HTTP_CODE)"

# Test 21: Get All Notes
echo -n "Testing: Get All Notes... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Notes" || print_result 1 "Get All Notes (HTTP $HTTP_CODE)"

# Test 22: Toggle Bookmark
if [ ! -z "$NOTE_ID" ]; then
    echo -n "Testing: Toggle Bookmark... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/bookmark" \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [[ "$HTTP_CODE" =~ ^(200|201)$ ]] && print_result 0 "Toggle Bookmark" || print_result 1 "Toggle Bookmark (HTTP $HTTP_CODE)"
fi

# Test 23: Toggle Like
if [ ! -z "$NOTE_ID" ]; then
    echo -n "Testing: Toggle Like... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/like" \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [[ "$HTTP_CODE" =~ ^(200|201)$ ]] && print_result 0 "Toggle Like" || print_result 1 "Toggle Like (HTTP $HTTP_CODE)"
fi

echo ""
echo "========================================="
echo "7. DOCUMENTATION MODULE"
echo "========================================="

# Test 24: Get All Topics
echo -n "Testing: Get All Topics... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/docs")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Topics" || print_result 1 "Get All Topics (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo "All tests completed!"
echo "Check results above for pass/fail status."
echo ""n" || print_result 1 "Get Assignment by Lesson (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "5. CLASS ACTIVITY MODULE"
echo "========================================="

# Test 17: Create Class Activity
echo -n "Testing: Create Class Activity... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/class-activity/admin" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Group Discussion" \
  -F "description=Discuss normalization concepts" \
  -F "content=# Discussion Topics\n\n1. First Normal Form\n2. Second Normal Form" \
  -F "lessonId=$LESSON_ID" \
  -F "duration=30")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
ACTIVITY_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Class Activity (ID: $ACTIVITY_ID)" || print_result 1 "Create Class Activity (HTTP $HTTP_CODE)"

# Test 18: Get All Activities
echo -n "Testing: Get All Activities... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/class-activity/admin" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Activities" || print_result 1 "Get All Activities (HTTP $HTTP_CODE)"

# Test 19: Get Activity by Lesson
echo -n "Testing: Get Activity by Lesson... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/class-activity/lesson/$LESSON_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get Activity by Lesson" || print_result 1 "Get Activity by Lesson (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "6. NOTES MODULE"
echo "========================================="

# Test 20: Create Note
echo -n "Testing: Create Note... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "DBMS Important Notes",
    "content": "Key concepts to remember...",
    "source": "personal",
    "tags": ["database", "important"]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
NOTE_ID=$(extract_id "$BODY")
[ "$HTTP_CODE" = "201" ] && print_result 0 "Create Note (ID: $NOTE_ID)" || print_result 1 "Create Note (HTTP $HTTP_CODE)"

# Test 21: Get All Notes
echo -n "Testing: Get All Notes... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/notes" \
  -H "Authorization: Bearer $TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Notes" || print_result 1 "Get All Notes (HTTP $HTTP_CODE)"

# Test 22: Toggle Bookmark
if [ ! -z "$NOTE_ID" ]; then
    echo -n "Testing: Toggle Bookmark... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/bookmark" \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "200" ] && print_result 0 "Toggle Bookmark" || print_result 1 "Toggle Bookmark (HTTP $HTTP_CODE)"
fi

# Test 23: Toggle Like
if [ ! -z "$NOTE_ID" ]; then
    echo -n "Testing: Toggle Like... "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/notes/$NOTE_ID/like" \
      -H "Authorization: Bearer $TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" = "200" ] && print_result 0 "Toggle Like" || print_result 1 "Toggle Like (HTTP $HTTP_CODE)"
fi

echo ""
echo "========================================="
echo "7. DOCUMENTATION MODULE"
echo "========================================="

# Test 24: Get All Topics
echo -n "Testing: Get All Topics... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/docs/topics")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" = "200" ] && print_result 0 "Get All Topics" || print_result 1 "Get All Topics (HTTP $HTTP_CODE)"

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo ""
echo "Created Resources:"
echo "  Course ID: $COURSE_ID"
echo "  Section ID: $SECTION_ID"
echo "  Lesson ID: $LESSON_ID"
echo "  Quiz ID: $QUIZ_ID"
echo "  Assignment ID: $ASSIGNMENT_ID"
echo "  Activity ID: $ACTIVITY_ID"
echo "  Note ID: $NOTE_ID"
echo ""
echo "========================================="
echo "Testing Complete!"
echo "========================================="
