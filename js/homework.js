import { auth, db } from '../firebase/firebase.js';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// DOM Elements
const taskForm = document.getElementById('task-form');
const searchInput = document.getElementById('searchInput');
const tasksRef = collection(db, 'homeworkTasks');

const dueTodayWidget = document.getElementById('dueTodayCount');
const upcomingWidget = document.getElementById('upcomingCount');

let allTasks = [];

// ✅ Add Task
taskForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const due = document.getElementById('due').value;
  const priority = document.getElementById('priority').value;
  const user = auth.currentUser;

  if (!user || !title || !subject || !due) return;

  const task = {
    title,
    subject,
    due,
    status: "todo",
    uid: user.uid,
    priority
  };

  try {
    await addDoc(tasksRef, task);
    taskForm.reset();
  } catch (error) {
    console.error("Error adding task:", error.message);
  }
});

// ✅ Real-time Task Loader
function loadTasks() {
  if (!auth.currentUser) return;

  const q = query(tasksRef, where("uid", "==", auth.currentUser.uid));
  onSnapshot(q, (snapshot) => {
    allTasks = [];
    snapshot.forEach(docSnap => {
      allTasks.push({ id: docSnap.id, ...docSnap.data() });
    });

    updateTaskWidgets();
    renderTasks();
  });
}

// ✅ Render Tasks
function renderTasks() {
  const filter = searchInput?.value.toLowerCase() || '';
  const columns = {
    "todo": document.getElementById('todo'),
    "in-progress": document.getElementById('in-progress'),
    "done": document.getElementById('done')
  };

  Object.values(columns).forEach(col => col.innerHTML = '');

  const sortedTasks = [...allTasks].sort((a, b) => {
    const priorityMap = { high: 1, medium: 2, low: 3 };
    const aPriority = priorityMap[a.priority] || 4;
    const bPriority = priorityMap[b.priority] || 4;

    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.due) - new Date(b.due);
  });

  sortedTasks.forEach(({ id, title, subject, due, status, priority }) => {
    const matches = title.toLowerCase().includes(filter) || subject.toLowerCase().includes(filter);
    if (!matches) return;

    const taskEl = createTaskElement(id, title, subject, due, status, priority);
    const col = columns[status] || columns["todo"];
    col.appendChild(taskEl);
  });
}

// ✅ Create Task DOM Element
function createTaskElement(id, title, subject, due, status, priority) {
  const taskEl = document.createElement('div');
  taskEl.className = 'task';
  taskEl.draggable = true;
  taskEl.dataset.id = id;

  const color = stringToColor(subject);
  const priorityLabel = {
    high: '⭐ High',
    medium: '➡️ Medium',
    low: '💤 Low'
  }[priority] || '';

  taskEl.innerHTML = `
    <h4>${title}</h4>
    <p>
      <span class="subject-badge" style="background:${color};">${subject}</span>
      <span class="priority-badge">${priorityLabel}</span> —
      Due ${due}
    </p>
    <div class="task-actions">
      <button class="edit-btn" data-id="${id}">✏️</button>
      <button class="delete-btn" data-id="${id}">🗑</button>
    </div>
  `;

  taskEl.addEventListener('dragstart', e => {
    e.dataTransfer.setData("text/plain", id);
  });

  taskEl.querySelector('.delete-btn').addEventListener('click', async () => {
    if (confirm("Delete this task?")) {
      await deleteDoc(doc(db, 'homeworkTasks', id));
    }
  });

  taskEl.querySelector('.edit-btn').addEventListener('click', () => {
    openEditModal(id, { title, subject, due, priority });
  });
  
  const isOverdue = new Date(due) < new Date().setHours(0, 0, 0, 0) && status !== "done";
  if (isOverdue) {
    taskEl.classList.add('overdue');
  }
  
  return taskEl;
}

// ✅ Drag-and-Drop
document.querySelectorAll('.widget')?.forEach(col => {
  col.addEventListener('dragover', e => e.preventDefault());

  col.addEventListener('drop', async e => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const newStatus = col.dataset.status;
    await updateDoc(doc(db, 'homeworkTasks', taskId), { status: newStatus });
  });
});

// ✅ Update Due Widgets
function updateTaskWidgets() {
  const today = new Date().toISOString().split('T')[0];
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const dueToday = allTasks.filter(task => task.due === today).length;
  const upcoming = allTasks.filter(task => {
    const dueDate = new Date(task.due);
    return dueDate > new Date(today) && dueDate <= oneWeekFromNow;
  }).length;

  if (dueTodayWidget) dueTodayWidget.textContent = dueToday;
  if (upcomingWidget) upcomingWidget.textContent = upcoming;
}

// ✅ Live Search
searchInput?.addEventListener('input', renderTasks);

// ✅ Edit Modal Logic
const modal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTitle = document.getElementById('edit-title');
const editSubject = document.getElementById('edit-subject');
const editDue = document.getElementById('edit-due');
const editPriority = document.getElementById('edit-priority');
const cancelEdit = document.getElementById('cancel-edit');

let currentEditId = null;

function openEditModal(id, task) {
  currentEditId = id;
  editTitle.value = task.title;
  editSubject.value = task.subject;
  editDue.value = task.due;
  editPriority.value = task.priority || "medium";
  modal.classList.remove('hidden');
}

cancelEdit?.addEventListener('click', () => {
  modal.classList.add('hidden');
});

editForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const updatedTask = {
    title: editTitle.value.trim(),
    subject: editSubject.value.trim(),
    due: editDue.value,
    priority: editPriority.value
  };

  await updateDoc(doc(db, 'homeworkTasks', currentEditId), updatedTask);
  modal.classList.add('hidden');
});

// ✅ Color Generator
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
                      ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
                      ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
  return color.slice(0, 7);
}

// ✅ Auth-based loading
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
if (auth.currentUser) {
  loadTasks();
} else {
  onAuthStateChanged(auth, user => {
    if (user) loadTasks();
  });
}

