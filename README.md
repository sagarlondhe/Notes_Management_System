#  Notes_Management_System - Enterprise Notes Management System

 Notes_Management_System is a production-ready, full-stack Notes Management System built on the MERN (MongoDB, Express, React, Node.js) stack. The application demonstrates software engineering best practices, featuring a backend designed around the **MVC + Repository Pattern** and a custom **Tailwind CSS** frontend dashboard featuring auto-saving drafts, server-side pagination, regular-expression based search, pinning, and tags.

---

## 🌟 Features

### Core Operations
* **Create Notes**: Fully-validated input forms (front-end Joi-backed schema and database schema rules).
* **Listing Feed**: Unified workspace displaying active cards. Soft-deleted items are excluded from retrieval.
* **Single Details**: Dedicated viewer displaying formatted text, tag elements, and date metadata.
* **Update Notes**: Edit fields seamlessly with live updates.
* **Soft Delete**: Deletion flag update (`is_delete = 0`) to preserve historical logs. Includes confirmation overlays.

### Performance & UX Enhancements (Bonus Features)
1. **Pin Notes**: Toggle critical items to floating status. Pinned items always group at the top of feeds, sorted by modification timestamps (`is_pinned DESC, updated_at DESC`).
2. **Auto Save**:
   * **Client Drafts**: Save new drafts locally to `localStorage` as you type. Prompts draft restoration on session reload if left unsaved.
   * **Edit Auto Sync**: Saves changes to the backend in the background 1.8 seconds after typing halts. Displays visual saving states (`Saving...`, `Saved at HH:MM:SS`, `Autosave Paused`).
3. **Pill Tags**: Tag notes with custom keywords (comma/enter separated). Filter note collections dynamically by selecting tags from the sidebar.
4. **Server-Side Pagination**: Efficient page limit partitions (`GET /api/notes?page=1&limit=6`) to reduce payload overhead.
5. **Debounced Search**: Text search (300-500ms delay) query matched against note titles, tags, and content.

---

## 📂 Project Structure

```text
popaya_technologies/
├── server/                    # Node/Express Backend
│   ├── config/                # Database configurations (db.js)
│   ├── model/                 # Mongoose schemas (note.model.js)
│   ├── repository/            # Database transactions (note.repository.js)
│   ├── controller/            # Request handlers (note.controller.js)
│   ├── routes/                # Express routes (note.routes.js)
│   ├── middleware/            # Error & Joi validations
│   ├── utils/                 # Responding & Constants helpers
│   ├── app.js                 # Express Application config
│   └── server.js              # Server Listener startup
├── client/                    # Vite + React Frontend
│   ├── src/
│   │   ├── components/        # Skeletons, Modals, Tags selection
│   │   ├── hooks/             # useDebounce and useAutoSave hooks
│   │   ├── layouts/           # MainLayout shell with Sidebar Stats
│   │   ├── pages/             # List, Details, Create, Edit views
│   │   ├── routes/            # React Router configurations
│   │   ├── utils/             # Localized date formatters
│   │   ├── App.jsx            # Routing wrapper
│   │   ├── index.css          # Tailwind presets
│   │   └── main.jsx           # Mounting entry script
│   ├── index.html             # Fonts and html layout templates
│   ├── tailwind.config.js     # Colors, fonts, animations config
│   └── vite.config.js         # Port mapping & proxy config
├── README.md                  # System overview documentation
├── API_DOCUMENTATION.md       # API Specification reference
└── postman_collection.json    # Importable Postman payload schema
```

---

## 🏗️ Architecture Design Principles

* **Separation of Concerns (MVC + Repository)**: The controller contains business execution flow and parameter validations, while the Repository isolates the DB transactions. Views render markup exclusively.
* **Single Responsibility (SOLID)**: Each module is bounded to a singular concern (e.g. `validate.middleware.js` evaluates format parameters prior to controllers).
* **DRY Code**: Shared behaviors (such as standardized JSON envelopes) are unified into central utility helper modules.
* **Mongoose Query Optimization**: Created compound index `is_delete: 1, is_pinned: -1, updated_at: -1` to optimize querying active feeds.

---

## ⚙️ Environment Variables Config

### Backend Config (`server/.env`)
Create a file named `.env` in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes-management
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend Config (`client/.env`)
Create a file named `.env` in the `client` directory (optional - defaults to proxy):
```env
VITE_API_URL=/api
```

---

## 🚀 Installation & Local Running

Ensure you have **Node.js** (v16+) and **MongoDB** running locally.

### 1. Run the Backend Server
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Run backend development server (runs nodemon on Port 5000)
npm run dev
```

### 2. Run the Frontend Client
```bash
# Navigate to frontend directory
cd client

# Install dependencies
npm install

# Run frontend development server (runs Vite on Port 5173)
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to test the application.

---

## 🧪 Testing Verification Tasks

1. **Notes CRUD**: Verify you can create, retrieve, update, and soft-delete notes.
2. **Soft-Delete check**: Inspect your MongoDB database after a delete action. Verify the note document has `is_delete: 0` and is not permanently deleted.
3. **Autosave check**: When editing an existing note, type content and halt. Check the network tab in your browser developer tools to verify background `PUT` updates.
4. **Pagination**: Verify limits and page controls by inserting more than 6 notes.
5. **Debounce Search**: Type slowly in the search bar and verify that API requests are sent only after you stop typing.
