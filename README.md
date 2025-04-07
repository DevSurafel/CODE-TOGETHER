# 💻 CodeTogether: Real-Time Collaborative Editor

![CodeTogether Logo](public/logo512.png)

A **multi-user coding environment** with live execution, doubt resolution, and team collaboration.

---

## ✨ Features

- **Real-time code sync** (WebSockets)
- **Multi-language execution** (C/C++/Python/JS)
- **Integrated terminal** (Judge0 API)
- **Doubt chat system**
- **User presence indicators**
- **Editor locking** (teacher mode)
- **Code downloading**

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm/yarn
- [Judge0 API key](https://rapidapi.com/judge0-official/api/judge0-ce/) (free)

### Installation
```bash
git clone https://github.com/DevSurafel/CodeTogether.git
cd CodeTogether
npm install
```

## Configuration  
Create .env file:  
```bash
REACT_APP_RAPID_API_KEY=your_judge0_key
FRONTEND_URL=http://localhost:3000
PORT=8000
```
## Running  
# Start both frontend and backend
```bash
npm run dev
```

## Docker  
```bash
docker-compose up --build
```

## 🛠 Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | React, CodeMirror, Socket.IO Client|
| Backend    | Node.js, Express, Socket.IO        |
| Execution  | Judge0 API                         |
| Styling    | CSS3, Animated UI                  |

## Screenshots  
Landing Page

Editor View
