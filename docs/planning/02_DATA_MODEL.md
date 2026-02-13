# Data Model Definition

## 1. Core Entities

### 1.1 Student (生徒)
- **ID**: UUID
- **Name**: String (Encrypted/Anonymized in export)
- **Grade**: String (e.g., "J2" for Chugaku 2-nen)
- **SchoolType**: Enum ("JuniorHigh", "HighSchool", "Elementary")
- **Goals**: Array<Goal>
- **Subjects**: Array<SubjectConfig>

### 1.2 Goal (目標)
- **Type**: Enum ("Exam", "RegularTest", "OvercomingWeakness", "Advanced")
- **TargetDate**: Date (ISO8601)
- **TargetScore**: Number (Optional)
- **Description**: String

### 1.3 Unit / Curriculum Item (単元)
- **ID**: UUID
- **Subject**: String (e.g., "Math")
- **Name**: String
- **Order**: Number
- **EstimatedSessions**: Number (Default: 1)
- **Weight**: Number (Percentage or relative weight)
- **Status**: Enum ("NotStarted", "Introduced", "Practicing", "WaitingConfirmation", "Completed", "NeedsReview", "OnHold")
- **CompletionDate**: Date (Optional)
- **ReviewDueDate**: Date (Optional)

### 1.4 ClassRecord (授業記録)
- **ID**: UUID
- **StudentID**: UUID
- **Date**: Date (ISO8601)
- **UnitsCovered**: Array<UnitID>
- **Understanding**: Number (1-5)
- **StudentMood**: String (Free text)
- **HomeworkAssigned**: String
- **NextClassPlan**: String (Unit Name or ID)

## 2. JSON Schema (Draft)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Student": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "studentId": { "type": "string", "description": "Display ID e.g. S001" },
        "grade": { "type": "string" },
        "schoolType": { "type": "string", "enum": ["Elementary", "JuniorHigh", "HighSchool"] },
        "goals": { "type": "array", "items": { "$ref": "#/definitions/Goal" } },
        "subjects": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["id", "studentId", "grade"]
    },
    "Unit": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "subject": { "type": "string" },
        "status": { 
          "type": "string", 
          "enum": ["NotStarted", "Introduced", "Practicing", "WaitingConfirmation", "Completed", "NeedsReview", "OnHold"] 
        },
        "order": { "type": "integer" },
        "estimatedSessions": { "type": "integer" }
      },
      "required": ["id", "name", "subject", "status"]
    }
  }
}
```

## 3. Relationships
- One **Student** has many **Units** (Personalized Curriculum).
- One **Student** has many **ClassRecords**.
- One **ClassRecord** links to many **Units** (Many-to-Many via ID).
