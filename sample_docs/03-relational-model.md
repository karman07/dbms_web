# Relational Model

## What is the Relational Model?
The Relational Model, introduced by Edgar F. Codd in 1970, represents the database as a collection of relations (tables). It is the foundation of modern relational database systems like MySQL, PostgreSQL, and Oracle.

## Core Concepts

### 1. Relation (Table)
A relation is a two-dimensional table with rows and columns.

**Example: Students Table**
| StudentID | Name | Age | Major |
|-----------|------|-----|-------|
| 101 | Alice | 20 | CS |
| 102 | Bob | 22 | Math |

### 2. Tuple (Row)
Each row in a table represents a single record.

**Example:**
```
(101, 'Alice', 20, 'CS')
```

### 3. Attribute (Column)
Each column represents a specific property of the relation.

**Example:**
```
StudentID, Name, Age, Major
```

### 4. Domain
The set of allowed values for an attribute.

**Example:**
- Age: integers from 15 to 100
- Major: strings like 'CS', 'Math', 'Physics'

## Keys in Relational Model

### Primary Key
A unique identifier for each tuple in a relation.

**Example:**
```
StudentID is the primary key for Students table
```

### Foreign Key
An attribute that references the primary key of another relation, establishing relationships.

**Example:**
```
Students (StudentID, Name, DepartmentID)
Departments (DepartmentID, DepartmentName)

DepartmentID in Students is a foreign key referencing Departments
```

### Candidate Key
A minimal set of attributes that can uniquely identify a tuple.

### Super Key
Any set of attributes that can uniquely identify a tuple (may include extra attributes).

## Relational Integrity Constraints

### 1. Entity Integrity
No primary key value can be NULL.

### 2. Referential Integrity
Foreign key values must either match a primary key value in the referenced table or be NULL.

### 3. Domain Constraints
Attribute values must be from the specified domain.

## Relational Algebra Operations

### 1. Selection (σ)
Select rows that satisfy a condition.
```
σ(Age > 20)(Students)
```

### 2. Projection (π)
Select specific columns.
```
π(Name, Major)(Students)
```

### 3. Join (⋈)
Combine tables based on a related column.
```
Students ⋈ Departments
```

### 4. Union (∪)
Combine tuples from two relations.

### 5. Set Difference (−)
Tuples in one relation but not in another.

## Advantages of Relational Model
1. **Simplicity**: Easy to understand table structure
2. **Data Independence**: Changes to schema don't affect applications
3. **Flexibility**: Support for ad-hoc queries
4. **ACID Compliance**: Ensures data consistency
5. **Scalability**: Handles large datasets efficiently

## Example: University Database

**Students Table**
| StudentID | Name | DepartmentID |
|-----------|------|--------------|
| 101 | Alice | 1 |
| 102 | Bob | 2 |

**Departments Table**
| DepartmentID | DepartmentName |
|--------------|----------------|
| 1 | Computer Science |
| 2 | Mathematics |

**Enrollments Table**
| StudentID | CourseID | Grade |
|-----------|----------|-------|
| 101 | CS101 | A |
| 102 | MATH201 | B |

The Relational Model provides a solid mathematical foundation for organizing and querying data efficiently.
