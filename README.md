# Attendance Management Portal

A web-based Attendance Management Portal designed to help teachers manage student attendance records. It allows teachers to add students, view attendance records, update student information, and delete records.

## Features

- **Create:** Add students with their name, section, subject, and attendance dates.
- **Read:** Display student records and attendance information.
- **Update:** Edit student names, sections, subjects, and attendance dates.
- **Delete:** Remove student records after confirmation.
- **Search:** Search and filter student records by section and subject.

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- Vercel

## Project Structure

```text
student-api-backend/
│
├── public/
│   └── index.html
│
├── api/
│   └── index.js
│
├── package.json
├── package-lock.json
├── db.js
├── .gitignore
└── README.md
```

## CRUD Operations

| Operation | Description |
|---|---|
| Create | Add a new student record |
| Read | View student attendance records |
| Update | Edit student information |
| Delete | Delete student records |

## API Endpoints

All API routes are under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api` | Retrieve all student records |
| POST | `/api` | Add a new student |
| PUT | `/api/:id` | Update student information |
| PATCH | `/api/:id` | Update attendance date |
| DELETE | `/api/:id` | Delete a student record |

## Database

The project uses **MongoDB Atlas** to store student information and attendance records.

### Collection Fields

- `studentName`
- `section`
- `subjectName`
- `attendanceDates`

## Deployment

The application is deployed using Vercel.

**Live Website:** Add your Vercel deployment link here.

## Purpose

This project was developed as part of an Enterprise System Migration activity to demonstrate database integration, backend API development, and frontend implementation.
