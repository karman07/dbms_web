# SQL Basics
SQL (Structured Query Language) is the standard language for interacting with relational databases. It is used to create, modify, manage, and query data. SQL is essential for database administrators, developers, and analysts.

## Key Features of SQL
- Declarative language: Specify what data to retrieve, not how to retrieve it.
- Portable: Works across different relational database systems (MySQL, PostgreSQL, SQL Server, etc.).
- Powerful: Supports complex queries, joins, aggregations, and transactions.

## Common SQL Commands

### SELECT
Retrieve data from a table.

```sql
SELECT column1, column2 FROM table_name WHERE condition;
```

**Example:**
```sql
SELECT name, age FROM students WHERE age > 18;
```

### INSERT
Add new data to a table.

```sql
INSERT INTO table_name (column1, column2) VALUES (value1, value2);
```

**Example:**
```sql
INSERT INTO students (name, age) VALUES ('Alice', 20);
```

### UPDATE
Modify existing data in a table.

```sql
UPDATE table_name SET column1 = value1 WHERE condition;
```

**Example:**
```sql
UPDATE students SET age = 21 WHERE name = 'Alice';
```

### DELETE
Remove data from a table.

```sql
DELETE FROM table_name WHERE condition;
```

**Example:**
```sql
DELETE FROM students WHERE age < 18;
```

## Additional Concepts

### Joins
Combine rows from two or more tables based on a related column.

```sql
SELECT students.name, courses.title
FROM students
JOIN enrollments ON students.id = enrollments.student_id
JOIN courses ON enrollments.course_id = courses.id;
```

### Aggregation
Summarize data using functions like COUNT, SUM, AVG, MIN, MAX.

```sql
SELECT COUNT(*) FROM students;
SELECT AVG(age) FROM students;
```

### Transactions
Group multiple SQL statements into a single unit of work.

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

---

SQL is a foundational skill for anyone working with data. Mastery of SQL enables efficient data management and analysis in any relational database system.
