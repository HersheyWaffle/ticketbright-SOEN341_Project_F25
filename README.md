# TicketBright - SOEN341 Software Process, Fall 2025
### Campus Events & Ticketing

---

## Objective

The objective of this project is to design and implement a Campus Events & Ticketing Web Application that enhances student engagement, simplifies event management, and provides analytical insights for campus stakeholders.

Through this project, our team will:

- Gain hands-on experience with software engineering principles and Agile development.

- Practice collaborative programming using GitHub for version control, task tracking, and team coordination.

- Build a prototype web platform that allows students to discover, register for, and attend campus events with ease.

- Equip organizers and administrators with tools to efficiently manage events and analyze participation trends.

By the end of the course, the result will be a middle-fidelity prototype that demonstrates essential functionality and could serve as a foundation for a production-ready system.

---

## Project Overview

The Campus Events & Ticketing application is intended to serve as a central hub for events within the university community. Students often struggle to discover events or manage attendance, while organizers face challenges in promotion and tracking. This platform addresses these issues by integrating event discovery, ticketing, and attendance into a single, streamlined system.

The system is structured around three main user roles: Students, Organizers, and Administrators. Each role has tailored features to meet their needs while ensuring a cohesive and intuitive user experience.

---

## Core Features

### 1. Student Event Experience  
- Event Discovery 
  - Browse and search for events using filters such as date, category, and organization.  
- Event Management  
  - Save events to a personal calendar for reminders.  
  - Claim free or paid tickets seamlessly.  
  - Receive a digital ticket with a unique QR code for check-in at the venue.  

### 2. Organizer Event Management  
- Event Creation
  - Enter detailed event information (title, description, date/time, location, ticket capacity, ticket type).  
- Event Analytics  
  - Access dashboards showing ticket sales, attendance rates, and remaining capacity.  
- Tools
  - Export attendee lists as CSV files.  
  - Validate tickets using an integrated QR scanner (QR code upload or simple file-based input).  

### 3. Administrator Dashboard & Moderation  
- Platform Oversight
  - Approve or reject organizer accounts.  
  - Moderate event listings to ensure compliance with university policies.  
- Analytics  
  - View global platform statistics, including total events hosted, tickets issued, and attendance trends.  
- Management  
  - Manage organizations, assign roles, and oversee platform usage.  

### 4. Additional Feature  
The team will propose and validate an extra feature with the TA. This will serve as a differentiating element beyond the three core roles.  

---

## Team Members and their Roles

| Name                 | Student ID | Role     | Username          |
| -------------------- | ---------- | -------- | ----------------- |
| Ali El Khaled        | 40268326   | Frontend | Ali-ElKha         |
| Davann Hang          | 24790383   | Backend  | davanndbg         |
| Nirthika Ilaiyarajah | 40298669   | Frontend | nirthikkaa        |
| Omar Ghazaly         | 40280795   | Backend  | HersheyWaffle     |
| Ryan Batti           | 40299408   | Frontend | houd162           |
| Shayan Javanmardi    | 40299147   | Backend  | shayjaa           |
| Yasmin Tavassoli     | 40284812   | Frontend | yasmintavassoli04 |

---

## Technologies  
We intend to use modern web development frameworks and tools. The exact stack will be finalized as the project progresses.  

- Frontend: (React, Angular)
- Backend: (Node.js with Express) 
- Database: TBD (if required) (PostgreSQL, MySQL, MongoDB etc.)
- Version Control: GitHub (distributed version control, issues, and project boards)  
- Development Approach: Agile Scrum with four sprints (~3 weeks each)  

---

## Agile & Sprint Structure  

- Project Duration: ~10 weeks  
- Iterations: 4 sprints (3–4 weeks each)  
- Sprint Activities:  
  - Sprint planning and backlog refinement.  
  - User story creation (`US.##`).  
  - Task breakdown into smaller assignments (`Task.##`).  
  - Documentation of meeting minutes.  
  - Team contribution logs submitted at the end of each sprint.  

Each sprint will include deliverables that demonstrate incremental progress. Contributions will be tracked via GitHub issues, commits, and pull requests to ensure transparency and accountability.  

---

## Repository Structure  

```plaintext
<ticketbright-SOEN341_Project_F25>/
│
├── Sprint1/
│   ├── MeetingMinutes/
│   ├── UserStories/
│   ├── Tasks/
│   └── Logs/
│
├── Sprint2/
│   ├── MeetingMinutes/
│   ├── UserStories/
│   ├── Tasks/
│   └── Logs/
│
├── Sprint3/
│   └── ...
│
├── Sprint4/
│   └── ...
│
└── README.md
