const express = require("express");
const app = express();

app.use(express.json());

const users = [
  { id: 1, name: "Amit", email: "amit@test.com" },
  { id: 2, name: "Riya", email: "riya@test.com" }
];

const notes = [
  { id: 1, title: "Note 1", content: "Content 1", userId: 1 },
  { id: 2, title: "Note 2", content: "Content 2", userId: 2 }
];

// Helper function to mock fetching external data
async function fetchExternalData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ source: "External API", data: "Sample external data payload" });
    }, 100);
  });
}

// Helper function to get user by ID
function getUserById(id) {
  return users.find(u => u.id === Number(id));
}

// Helper function to generate a note ID (avoiding collision with existing 1 and 2)
function generateNoteId() {
  // deterministically generate next ID based on current notes to avoid collisions
  const maxId = notes.reduce((max, n) => (n.id > max ? n.id : max), 0);
  return maxId + 1;
}

app.get("/users", (req, res) => {
  const allUsers = users;
  res.send(allUsers);
});

app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = getUserById(id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send(user);
});

app.get("/notes/count", (req, res) => {
  const total = notes.length;
  res.send({ total });
});

app.get("/external-data", async (req, res) => {
  try {
    const data = await fetchExternalData();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch external data" });
  }
});

app.get("/notes", (req, res) => {
  if (notes.length === 0) {
    console.log("No notes found");
  }
  res.send(notes);
});

app.post("/notes", (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content || userId === undefined || userId === null) {
    return res.status(400).json({ error: "Invalid input: title, content and userId are required" });
  }

  const owner = getUserById(userId);
  if (!owner) {
    return res.status(400).json({ error: "Invalid userId: user does not exist" });
  }

  const newNote = {
    id: generateNoteId(),
    title: String(title),
    content: String(content),
    userId: Number(userId)
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).send({ message: "Note not found" });
  }

  notes.splice(noteIndex, 1);
  res.send({ message: "Note deleted" });
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  user.name = name;

  res.send(user);
});

app.get("/user-notes/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const userNotes = notes.filter(n => n.userId === userId);
  res.send(userNotes);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (email === "admin@test.com" && password === "123456") {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post("/sum", (req, res) => {
  const { a, b } = req.body;
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: "Both a and b must be provided" });
  }

  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
    return res.status(400).json({ error: "Both a and b must be valid numbers" });
  }

  const total = numA + numB;
  res.json({ total });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});