# Entity-Relationship (ER) Model

## What is the ER Model?
The Entity-Relationship (ER) model is a high-level conceptual data model used to visually describe the structure of a database. It was introduced by Peter Chen in 1976 and remains one of the most popular tools for database design.

## Core Components

### 1. Entity
An entity is an object or thing in the real world with an independent existence.

**Types of Entities:**
- **Strong Entity**: Has a primary key and can exist independently (e.g., Student, Course)
- **Weak Entity**: Depends on a strong entity for its existence (e.g., Dependent of an Employee)

**Example:**
```
Student (StudentID, Name, Age, Major)
Course (CourseID, Title, Credits)
```

### 2. Attribute
An attribute is a property or characteristic of an entity.

**Types of Attributes:**
- **Simple**: Cannot be divided further (e.g., Age)
- **Composite**: Can be divided into sub-parts (e.g., Name → FirstName, LastName)
- **Single-valued**: One value per entity (e.g., StudentID)
- **Multi-valued**: Multiple values possible (e.g., PhoneNumbers)
- **Derived**: Calculated from other attributes (e.g., Age from DateOfBirth)

### 3. Relationship
A relationship is an association among two or more entities.

**Types of Relationships:**
- **One-to-One (1:1)**: One entity instance relates to one instance of another (e.g., Person ↔ Passport)
- **One-to-Many (1:N)**: One entity instance relates to many instances (e.g., Department ↔ Employees)
- **Many-to-Many (M:N)**: Many instances relate to many instances (e.g., Students ↔ Courses)

## ER Diagram Notations
- **Rectangle**: Represents an entity
- **Ellipse**: Represents an attribute
- **Diamond**: Represents a relationship
- **Lines**: Connect entities to relationships and attributes

## Example: University Database
```
Entities:
- Student (StudentID, Name, Email, Major)
- Course (CourseID, Title, Credits)
- Professor (ProfessorID, Name, Department)

Relationships:
- Student ENROLLS_IN Course (M:N)
- Professor TEACHES Course (1:N)
```

## Benefits of ER Modeling
1. **Visual Representation**: Easy to understand database structure
2. **Communication Tool**: Bridges gap between technical and non-technical stakeholders
3. **Design Validation**: Identify issues before implementation
4. **Documentation**: Serves as reference for future maintenance

The ER model is the foundation of relational database design, translating real-world scenarios into structured data models.
