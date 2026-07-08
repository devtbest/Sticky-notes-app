// STICKY NOTES APP
// ===============================

console.log("Sticky Notes App Loaded");

// ELEMENTS
// ===============================

const notesContainer = document.getElementById("notesContainer");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const addNoteBtn = document.getElementById("addNoteBtn");
const noteInput = document.getElementById("noteInput");
const modal = document.querySelector(".modal");
const toast = document.querySelector(".toast");
const colorInput = document.getElementById("colorInput");
const pickerContainer = document.getElementById("pickerContainer");

let selectedNote = null;

// COLOR PICKER
// ===============================
const colorPicker = new iro.ColorPicker("#pickerContainer", {
    width: 220,
    color: "#FFF9B0",
    borderWidth: 1,
    borderColor: "#ddd"
});

colorPicker.on("color:change", async (color) => {

    if (!selectedNote) return;

    const selectedColor = color.hexString;
    const noteCard =
      document.querySelector(
        `[data-id="${selectedNote.id}"]`
    );

    if (noteCard) {
    noteCard.style.backgroundColor =
        selectedColor;
    }

    await updateNoteColor(
        selectedNote.id,
        selectedColor
    );

    hideColorPicker();

});

// API URL
// ===============================

const API_URL =
  "https://6a3a65a5917c7b14c74d6ec2.mockapi.io/api/v1/notes";


// FETCH NOTES
// ===============================

async function fetchNotes() {

    console.log("1. fetchNotes started");

    try {

        const response = await fetch(API_URL);

        console.log("2. Response received");

        const notes = await response.json();

        console.table(notes);

        notesContainer.innerHTML = "";

        notes.forEach((note) => {
            createNoteCard(note);
        });

        console.log("4. Notes displayed");

    } catch (error) {

        console.error("Fetch Error:", error);

    }

}

// CREATE NOTE CARD
// ===============================

function createNoteCard(note) {

  const card = document.createElement("div");

  card.className = "note";
  card.dataset.id = note.id;
  card.style.backgroundColor = note.color || "#FFF9B0";

  card.innerHTML = `
      <p class="note-content">${note.content}</p>

      <div class="note-footer">

          <span class="note-date">
              ${formatDate(note.createdAt)}
          </span>

          <div class="note-actions">

              <button class="edit-btn"><i class="fa-solid fa-paintbrush" style="color: rgb(136, 138, 139);"></i></button>

              <button class="delete-btn"><i class="fa-solid fa-trash-can" style="color: rgb(136, 138, 139);"></i></button>

          </div>

      </div>
  `;

  // Edit button
  const editBtn = card.querySelector(".edit-btn");

  editBtn.addEventListener("click", () => {

    selectedNote = note;

    const rect = editBtn.getBoundingClientRect();

    const pickerWidth = 260;
    const pickerHeight = 300;
    const spacing = 10;

    // Default position (below the button)
    let left = rect.left;
    let top = rect.bottom + spacing;

    // If it overflows the right side, move it left
    if (left + pickerWidth > window.innerWidth) {
        left = window.innerWidth - pickerWidth - spacing;
    }

    // If it overflows the bottom, show it above the button
    if (top + pickerHeight > window.innerHeight) {
        top = rect.top - pickerHeight - spacing;
    }

    // If it's still too high, keep it inside the window
    if (top < spacing) {
        top = spacing;
    }

    pickerContainer.style.left = `${left}px`;
    pickerContainer.style.top = `${top}px`;

    pickerContainer.classList.add("show");

  });

  // Delete button
  const deleteBtn = card.querySelector(".delete-btn");

  deleteBtn.addEventListener("click", () => {
    deleteNote(note.id);
  });

  notesContainer.appendChild(card);
}

// ADD NOTE
// ===============================

async function addNote() {

  const content = noteInput.value.trim();

  if (!content) {
    alert("Please enter a note.");
    return;
  }

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        content,
        color: "#FFF9B0"
      })

    });

    if (!response.ok) {
      throw new Error("Failed to add note.");
    }


    modal.classList.add("hidden");

    showToast("Note added successfully!");

    await fetchNotes();

  } catch (error) {

    console.error(error);

    alert("Something went wrong.");

  }

}

// UPDATE NOTE
// ===============================

async function updateNote(id, content) {

  try {

    const response = await fetch(`${API_URL}/${id}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        content
      })

    });

    if (!response.ok) {
      throw new Error("Failed to update note.");
    }

    showToast("Note updated!");

    fetchNotes();

  } catch (error) {

    console.error(error);

  }

}

async function updateNoteColor(id, color) {

  try {

    const response = await fetch(`${API_URL}/${id}`, {

      method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
           content: selectedNote.content,
           color
        })
    });

   if (!response.ok) {
      throw new Error("Failed to update note color.");
     }

    fetchNotes();

  } catch (error) {

    console.error(error);

  }

}

async function handleColorChange() {

    if (!selectedNote) return;

    const selectedColor = colorInput.value;

    await updateNoteColor(
        selectedNote.id,
        selectedColor
    );

}

// DELETE NOTE
// ===============================

async function deleteNote(id) {

  const confirmed = confirm("Delete this note?");

  if (!confirmed) return;

  try {

    const response = await fetch(`${API_URL}/${id}`, {

      method: "DELETE"

    });

    if (!response.ok) {
      throw new Error("Failed to delete note.");
    }

    showToast("Note deleted!");

    fetchNotes();

  } catch (error) {

    console.error(error);

  }

}

// FORMAT DATE
// ===============================

function formatDate(date) {

  if (!date) return "No Date";

  const options = {
    month: "short",
    day: "numeric",
    year: "numeric"
  };

  return new Date(date).toLocaleDateString(
    "en-US",
    options
  );

}

// TOAST
// ===============================

function showToast(message) {

  const messageElement =
      document.querySelector(".toast-message");

  messageElement.textContent = message;

  toast.classList.remove("hidden");

  setTimeout(() => {

    toast.classList.add("hidden");

  }, 2000);

}

// HIDE COLOR PICKER
// ===============================

function hideColorPicker() {

    pickerContainer.classList.remove("show");

    selectedNote = null;

}

// MODAL EVENTS
// ===============================

openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  noteInput.value = "";
});

addNoteBtn.addEventListener("click", addNote);

// CLOSE COLOR PICKER
// ===============================

document.addEventListener("click", (event) => {

    const clickedPicker = pickerContainer.contains(event.target);

    const clickedEditButton = event.target.closest(".edit-btn");

    if (!clickedPicker && !clickedEditButton) {

        hideColorPicker();

    }

});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        hideColorPicker();

    }

});

window.addEventListener("scroll", () => {

    hideColorPicker();

});


// INITIAL LOAD
// ===============================

fetchNotes();
