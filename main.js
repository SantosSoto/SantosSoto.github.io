// ----- LOGIN CHECK -----
// Only block lesson/dashboard pages, not login.html
const user = localStorage.getItem("username");
if (!user && !window.location.pathname.endsWith("login.html")) {
  window.location.href = "login.html";
}

// ----- Sidebar toggle -----
const toggleBtn = document.getElementById("toggleSidebar");
const sidebar = document.querySelector(".sidebar");
const container = document.querySelector(".container");

if (toggleBtn && sidebar && container) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    container.classList.toggle("sidebar-collapsed");
  });
}

// ----- Quiz logic -----
const quizOptions = document.querySelectorAll(".quiz-option");
const quizFeedback = document.getElementById("quiz-feedback");

quizOptions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isCorrect = btn.dataset.correct === "true";

    quizOptions.forEach((o) => o.classList.remove("correct", "wrong"));

    if (isCorrect) {
      btn.classList.add("correct");
      if (quizFeedback) {
        quizFeedback.textContent = "Correct! Make sure to mark your progress.";
      }
    } else {
      btn.classList.add("wrong");
      if (quizFeedback) {
        quizFeedback.textContent =
          "Not quite. Why don't you reread the section above again?";
      }
    }
  });
});

// ----- Task-based progress + localStorage -----
const taskCheckboxes = document.querySelectorAll(".task-checkbox");
const progressBar = document.querySelector(".progress");
const notesTextarea = document.querySelector(".notes-textarea");

// Safety check
if (typeof PAGE_ID === "undefined") {
  console.warn("PAGE_ID is not defined on this page.");
}

function updateProgressFromTasks(save = true) {
  if (
    !progressBar ||
    taskCheckboxes.length === 0 ||
    typeof PAGE_ID === "undefined"
  ) {
    return;
  }

  let completed = 0;
  taskCheckboxes.forEach((cb) => {
    if (cb.checked) completed++;
  });

  const percent = (completed / taskCheckboxes.length) * 100;
  progressBar.style.width = percent + "%";

  if (percent === 100) {
    progressBar.style.backgroundColor = "#4caf50";
    if (save) {
      localStorage.setItem(`completed_${PAGE_ID}`, "true");
      localStorage.setItem("last_page", PAGE_ID);
    }
  } else {
    progressBar.style.backgroundColor = "#6b8bff";
  }

  if (save) {
    const states = Array.from(taskCheckboxes).map((cb) => cb.checked);
    localStorage.setItem(`tasks_${PAGE_ID}`, JSON.stringify(states));
    localStorage.setItem(`progress_${PAGE_ID}`, String(percent));
  }
}

function loadState() {
  if (typeof PAGE_ID === "undefined") return;

  const savedTasks = localStorage.getItem(`tasks_${PAGE_ID}`);
  if (savedTasks) {
    try {
      JSON.parse(savedTasks).forEach((checked, i) => {
        if (taskCheckboxes[i]) taskCheckboxes[i].checked = checked;
      });
    } catch {
      console.warn("Could not parse saved tasks for", PAGE_ID);
    }
  }

  if (notesTextarea) {
    const savedNotes = localStorage.getItem(`notes_${PAGE_ID}`);
    if (savedNotes !== null) notesTextarea.value = savedNotes;
  }

  updateProgressFromTasks(false);
}

// Save notes (correct version)
if (notesTextarea && typeof PAGE_ID !== "undefined") {
  notesTextarea.addEventListener("input", () => {
    localStorage.setItem(`notes_${PAGE_ID}`, notesTextarea.value);
  });
}

// Checkbox listeners
taskCheckboxes.forEach((cb) => {
  cb.addEventListener("change", () => updateProgressFromTasks(true));
});

// Load everything
loadState();
