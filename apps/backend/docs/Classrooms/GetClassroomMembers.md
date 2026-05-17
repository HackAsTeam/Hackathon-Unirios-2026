# GET /classrooms/{id}/members

**Feature:** `src/HackathonUnirios2026.Application/Features/Classrooms/Queries/GetClassroomMembersQuery.cs`

## Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Classroom ID from the route. |

## Response `200`

| Field | Type | Description |
|-------|------|-------------|
| userId | string | User ID of the classroom member. |
| displayName | string | Display name of the member. |
| avatarUrl | string | Avatar URL of the member. |
| role | string | Role of the member (`teacher` or `student`). |

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid bearer token. |
| 404 | Classroom does not exist or the authenticated user does not belong to it. |

## Example

```http
GET /classrooms/9b076d3e-f7c5-4208-8ab3-3b09cb7bbdc2/members
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "userId": "teacher-user-id",
    "displayName": "Teacher Name",
    "avatarUrl": "https://example.com/avatar-teacher.jpg",
    "role": "teacher"
  },
  {
    "userId": "student-user-id-1",
    "displayName": "Student One",
    "avatarUrl": "https://example.com/avatar-student1.jpg",
    "role": "student"
  },
  {
    "userId": "student-user-id-2",
    "displayName": "Student Two",
    "avatarUrl": "https://example.com/avatar-student2.jpg",
    "role": "student"
  }
]
```
