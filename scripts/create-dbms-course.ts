import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CoursesService } from '../src/courses/courses.service';
import { Types } from 'mongoose';

async function createDBMSCourse() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);

  try {
    console.log('Creating DBMS Course...');

    // Create the main course with a valid ObjectId
    const course = await coursesService.createCourse({
      title: 'Database Management Systems (DBMS)',
      description: 'Complete DBMS tutorial covering database fundamentals, SQL, normalization, transactions, and advanced concepts. Learn database management from basics to advanced topics with practical examples and quizzes.',
      isPublished: true,
    }, new Types.ObjectId().toString()); // Generate a valid ObjectId

    console.log('Course created:', course.title);

    // Section 1: Introduction to DBMS
    await coursesService.addSection({
      title: 'Introduction to Database Management Systems',
      description: 'Understand the fundamentals of databases and DBMS',
      priority: 0,
    });

    // Lesson 1.1: Introduction to DBMS
    await coursesService.addLesson(0, {
      title: 'DBMS Tutorial for Beginners',
      content: `# Introduction to Database Management Systems

## What is a Database?

A **database** is an organized collection of structured information or data, typically stored electronically in a computer system. A database is usually controlled by a **Database Management System (DBMS)**.

## What is a DBMS?

A **Database Management System (DBMS)** is software that interacts with end users, applications, and the database itself to capture and analyze data. It provides an interface between the data and the software applications that use it.

### Key Features of DBMS:

1. **Data Storage**: Efficiently stores large amounts of data
2. **Data Retrieval**: Quickly retrieves data when needed
3. **Data Manipulation**: Allows insertion, deletion, and modification of data
4. **Data Security**: Protects data from unauthorized access
5. **Data Integrity**: Ensures accuracy and consistency of data
6. **Concurrent Access**: Multiple users can access data simultaneously

## Types of Database Users

### 1. Database Administrators (DBA)
- Manage the entire database system
- Handle security, backup, and recovery
- Monitor database performance

### 2. Database Designers
- Design the database structure
- Define relationships between data
- Create schemas and models

### 3. End Users
- **Naive Users**: Use pre-defined applications (e.g., bank customers using ATMs)
- **Sophisticated Users**: Engineers, scientists who write complex queries
- **Application Programmers**: Develop database applications

## Evolution of Database Systems

### Timeline:
1. **1960s**: Hierarchical and Network Models
2. **1970s**: Relational Model (E.F. Codd)
3. **1980s**: SQL and RDBMS popularity
4. **1990s**: Object-Oriented Databases
5. **2000s**: NoSQL and Big Data
6. **2010s+**: Cloud Databases, Distributed Systems

## Real-World Applications

- **Banking**: Account management, transactions
- **Airlines**: Reservations, schedules
- **Universities**: Student records, courses
- **E-commerce**: Product catalogs, orders
- **Social Media**: User profiles, posts, connections
- **Healthcare**: Patient records, appointments

## Summary

DBMS is essential for modern data management, providing:
- Efficient data storage and retrieval
- Data security and integrity
- Support for multiple users
- Reduced data redundancy
- Improved data consistency

In the next lesson, we'll explore the differences between traditional file-based systems and centralized database approaches.`,
      videoUrl: 'https://youtu.be/DTN78zxMs-I?si=CMHYZVq7IL60GMLD',
      videoDescription: 'DBMS Tutorial for Beginners | Learn Database Management Step by Step',
      priority: 0,
      estimatedMinutes: 45,
      isPublished: true,
      quiz: [
        {
          question: 'What does DBMS stand for?',
          options: [
            { text: 'Database Management System', isCorrect: true },
            { text: 'Data Binary Management System', isCorrect: false },
            { text: 'Digital Base Management System', isCorrect: false },
            { text: 'Database Manipulation System', isCorrect: false },
          ],
          explanation: 'DBMS stands for Database Management System, which is software that manages databases.',
        },
        {
          question: 'Which of the following is NOT a key feature of DBMS?',
          options: [
            { text: 'Data Storage', isCorrect: false },
            { text: 'Data Security', isCorrect: false },
            { text: 'Manual File Management', isCorrect: true },
            { text: 'Concurrent Access', isCorrect: false },
          ],
          explanation: 'Manual file management is a characteristic of file-based systems, not DBMS. DBMS automates data management.',
        },
        {
          question: 'Who is responsible for managing the entire database system, handling security, and backup?',
          options: [
            { text: 'End Users', isCorrect: false },
            { text: 'Database Administrator (DBA)', isCorrect: true },
            { text: 'Application Programmers', isCorrect: false },
            { text: 'Naive Users', isCorrect: false },
          ],
          explanation: 'Database Administrators (DBAs) are responsible for managing the entire database system, including security, backup, and recovery.',
        },
        {
          question: 'Which decade saw the introduction of the Relational Model by E.F. Codd?',
          options: [
            { text: '1960s', isCorrect: false },
            { text: '1970s', isCorrect: true },
            { text: '1980s', isCorrect: false },
            { text: '1990s', isCorrect: false },
          ],
          explanation: 'E.F. Codd introduced the Relational Model in the 1970s, which revolutionized database management.',
        },
        {
          question: 'Which real-world application uses DBMS for account management and transactions?',
          options: [
            { text: 'Social Media', isCorrect: false },
            { text: 'Banking', isCorrect: true },
            { text: 'E-commerce', isCorrect: false },
            { text: 'Universities', isCorrect: false },
          ],
          explanation: 'Banking systems use DBMS for managing accounts, transactions, and customer information.',
        },
      ],
    });

    // Lesson 1.2: File System vs DBMS
    await coursesService.addLesson(0, {
      title: 'File-Based System vs Centralized Database',
      content: `# File-Based System vs Centralized Database Approach

## File-Based System (Traditional Approach)

### What is a File-Based System?

A file-based system is a traditional method of storing data where each application stores its own files independently. Each department or application maintains its own set of files.

### Problems with File-Based Systems

#### 1. **Data Redundancy**
- Same data is duplicated in multiple files
- Example: Customer name stored in both sales and shipping files
- Wastes storage space

#### 2. **Data Inconsistency**
- Updates in one file may not reflect in others
- Different versions of the same data

#### 3. **Difficulty in Accessing Data**
- Need to write new programs for each query
- No ad-hoc queries possible

#### 4. **Data Isolation**
- Data scattered across multiple files
- Different formats and locations

#### 5. **Integrity Problems**
- Difficult to enforce constraints
- No built-in validation rules

#### 6. **Security Issues**
- Difficult to provide different access levels
- All-or-nothing access

#### 7. **Concurrent Access Anomalies**
- Multiple users cannot safely update same file
- Risk of data corruption

#### 8. **No Backup and Recovery**
- Manual backup required
- No automated recovery

## Centralized Database Approach

### Advantages of Database Approach

1. **Reduced Data Redundancy** - Data stored only once
2. **Data Consistency** - Single source of truth
3. **Easy Data Access** - Query languages (SQL)
4. **Data Integration** - All data in one place
5. **Data Integrity** - Built-in constraints
6. **Enhanced Security** - Role-based access control
7. **Concurrent Access Control** - Transaction management
8. **Backup and Recovery** - Automated backups
9. **Reduced Development Time** - Reuse existing queries
10. **Data Independence** - Changes don't affect applications

## Comparison Table

| Feature | File-Based | Database |
|---------|-----------|----------|
| Redundancy | High | Low |
| Consistency | Poor | Good |
| Security | Limited | Advanced |
| Concurrent Access | Problematic | Controlled |
| Query Support | None | SQL |
| Backup/Recovery | Manual | Automated |

## Summary

The centralized database approach overcomes the limitations of file-based systems by providing unified data storage, better management, enhanced security, and efficient concurrent access.`,
      videoUrl: 'https://youtu.be/NSCHqbR3NUE?si=5TzxeTSf4qA7aI9Z',
      videoDescription: 'File Based System Vs Centralized Database Approach',
      priority: 1,
      estimatedMinutes: 30,
      isPublished: true,
      quiz: [
        {
          question: 'What is the main problem with data redundancy in file-based systems?',
          options: [
            { text: 'It improves data consistency', isCorrect: false },
            { text: 'It wastes storage space and causes inconsistency', isCorrect: true },
            { text: 'It makes queries faster', isCorrect: false },
            { text: 'It enhances security', isCorrect: false },
          ],
          explanation: 'Data redundancy wastes storage space and can lead to data inconsistency when the same data is updated in one location but not in others.',
        },
        {
          question: 'Which problem is NOT associated with file-based systems?',
          options: [
            { text: 'Data isolation', isCorrect: false },
            { text: 'Concurrent access anomalies', isCorrect: false },
            { text: 'Automated backup and recovery', isCorrect: true },
            { text: 'Difficulty in accessing data', isCorrect: false },
          ],
          explanation: 'Automated backup and recovery is an advantage of database systems, not a problem of file-based systems.',
        },
        {
          question: 'What does "single source of truth" mean in centralized databases?',
          options: [
            { text: 'Data is stored in multiple locations', isCorrect: false },
            { text: 'Only one user can access the database', isCorrect: false },
            { text: 'Data is stored only once and updates reflect everywhere', isCorrect: true },
            { text: 'Database has only one table', isCorrect: false },
          ],
          explanation: '"Single source of truth" means data is stored in one place, ensuring consistency and that updates reflect everywhere.',
        },
        {
          question: 'Which feature allows multiple users to safely update a database simultaneously?',
          options: [
            { text: 'Data redundancy', isCorrect: false },
            { text: 'Transaction management and locking', isCorrect: true },
            { text: 'File isolation', isCorrect: false },
            { text: 'Manual backup', isCorrect: false },
          ],
          explanation: 'Transaction management and locking mechanisms in DBMS allow concurrent access control, enabling multiple users to safely update the database.',
        },
        {
          question: 'What type of queries are possible in database systems but not in file-based systems?',
          options: [
            { text: 'Pre-defined queries only', isCorrect: false },
            { text: 'Ad-hoc queries using SQL', isCorrect: true },
            { text: 'No queries at all', isCorrect: false },
            { text: 'Manual file searches only', isCorrect: false },
          ],
          explanation: 'Database systems support ad-hoc queries using SQL, allowing users to retrieve data without writing new programs.',
        },
      ],
    });

    // Lesson 1.3: Advantages and Disadvantages
    await coursesService.addLesson(0, {
      title: 'Advantages and Disadvantages of DBMS',
      content: `# Advantages and Disadvantages of DBMS

## Advantages of DBMS

### 1. Data Independence
- Physical and logical data independence
- Changes to storage don't affect applications

### 2. Efficient Data Access
- Optimized query processing
- Indexing for fast retrieval
- Parallel processing

### 3. Data Integrity and Security
- Integrity constraints (Primary key, Foreign key)
- User authentication and authorization
- Encryption and audit trails

### 4. Concurrent Access and Crash Recovery
- Multiple users can access simultaneously
- Transaction management
- Automatic recovery from failures

### 5. Reduced Application Development Time
- Standard interfaces (SQL)
- Reusable queries
- Built-in functions

### 6. Reduced Data Redundancy
- Store data only once
- Minimize duplication
- Save storage space

### 7. ACID Properties
- **Atomicity**: All-or-nothing transactions
- **Consistency**: Valid state transitions
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

## Disadvantages of DBMS

### 1. Cost
- **Software Cost**: Expensive licenses
- **Hardware Cost**: High-performance servers
- **Operational Cost**: Electricity, cooling, maintenance

### 2. Complexity
- Steep learning curve
- Complex architecture
- Difficult troubleshooting

### 3. Requirement of Technical Staff
- Need Database Administrators
- Database developers
- Higher salary costs
- Training expenses

### 4. Size and Performance Overhead
- Large software footprint
- Processing overhead
- May be slower for simple operations

### 5. Database Failure Impact
- Single point of failure
- All applications affected
- Need for redundancy

### 6. Vendor Lock-in
- Proprietary features
- Difficult to migrate
- Dependency on vendor

## When to Use DBMS?

### ✅ Use DBMS When:
- Multiple users need concurrent access
- Data relationships are complex
- Data integrity is critical
- Large volumes of data
- Need advanced querying
- Security is important

### ❌ Avoid DBMS When:
- Very simple data structures
- Single user application
- Small data volume
- Limited resources
- No technical expertise

## Summary

### Key Advantages:
1. Data independence
2. Efficient access
3. Enhanced security
4. Concurrent control
5. Reduced redundancy
6. ACID properties

### Key Disadvantages:
1. High cost
2. Complexity
3. Technical staff required
4. Performance overhead
5. Single point of failure

The benefits usually outweigh disadvantages for modern business applications.`,
      videoDescription: 'Comprehensive overview of DBMS advantages and disadvantages',
      priority: 2,
      estimatedMinutes: 35,
      isPublished: true,
      quiz: [
        {
          question: 'What does "data independence" mean in DBMS?',
          options: [
            { text: 'Data can work without a database', isCorrect: false },
            { text: 'Changes to storage structure don\'t affect applications', isCorrect: true },
            { text: 'Each application has its own data', isCorrect: false },
            { text: 'Data is independent of users', isCorrect: false },
          ],
          explanation: 'Data independence means that changes to the physical or logical structure of data don\'t require changes to application programs.',
        },
        {
          question: 'Which of the following is NOT one of the ACID properties?',
          options: [
            { text: 'Atomicity', isCorrect: false },
            { text: 'Consistency', isCorrect: false },
            { text: 'Availability', isCorrect: true },
            { text: 'Durability', isCorrect: false },
          ],
          explanation: 'The ACID properties are Atomicity, Consistency, Isolation, and Durability. Availability is not part of ACID.',
        },
        {
          question: 'What is a major disadvantage of DBMS in terms of cost?',
          options: [
            { text: 'It\'s completely free', isCorrect: false },
            { text: 'Only software licenses are expensive', isCorrect: false },
            { text: 'Expensive licenses, hardware, and operational costs', isCorrect: true },
            { text: 'No cost involved', isCorrect: false },
          ],
          explanation: 'DBMS involves multiple costs including expensive software licenses, high-performance hardware, and operational costs like electricity and maintenance.',
        },
        {
          question: 'Which advantage allows multiple users to access and modify data simultaneously?',
          options: [
            { text: 'Data independence', isCorrect: false },
            { text: 'Concurrent access control', isCorrect: true },
            { text: 'Reduced redundancy', isCorrect: false },
            { text: 'Vendor lock-in', isCorrect: false },
          ],
          explanation: 'Concurrent access control through transaction management and locking allows multiple users to safely access and modify data simultaneously.',
        },
        {
          question: 'When should you AVOID using DBMS?',
          options: [
            { text: 'When you have large volumes of data', isCorrect: false },
            { text: 'When multiple users need access', isCorrect: false },
            { text: 'For very simple, single-user applications with small data', isCorrect: true },
            { text: 'When data integrity is critical', isCorrect: false },
          ],
          explanation: 'DBMS is overkill for very simple applications with small data volumes, single users, and limited resources. A simple file system might be sufficient.',
        },
        {
          question: 'What does "Atomicity" in ACID properties ensure?',
          options: [
            { text: 'Data is stored in atoms', isCorrect: false },
            { text: 'Transactions are either fully completed or fully rolled back', isCorrect: true },
            { text: 'Multiple databases can be atomic', isCorrect: false },
            { text: 'Data is always consistent', isCorrect: false },
          ],
          explanation: 'Atomicity ensures that transactions are "all-or-nothing" - either all operations in a transaction complete successfully, or none of them do.',
        },
      ],
    });

    console.log('✅ DBMS Course created successfully with 3 lessons and quizzes!');
    console.log('\nCourse Structure:');
    console.log('- Section 1: Introduction to Database Management Systems');
    console.log('  - Lesson 1: DBMS Tutorial for Beginners (5 quiz questions)');
    console.log('  - Lesson 2: File-Based System vs Centralized Database (5 quiz questions)');
    console.log('  - Lesson 3: Advantages and Disadvantages of DBMS (6 quiz questions)');
    console.log('\nAll lessons include YouTube video URLs and comprehensive markdown content.');

  } catch (error) {
    console.error('Error creating course:', error);
  } finally {
    await app.close();
  }
}

createDBMSCourse();
