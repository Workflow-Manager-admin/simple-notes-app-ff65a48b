import React, { useState, useRef } from 'react';
import './App.css';

// Main color palette
const COLORS = {
  primary: "#2563eb",
  secondary: "#64748b",
  accent: "#fbbf24",
  lightBg: "#ffffff",
  lightAlt: "#f8fafc",
  border: "#e5e7eb",
  text: "#1e293b",
};

const SIDEBAR_WIDTH = 260;

// PUBLIC_INTERFACE
/**
 * Simple Notes Application
 * Modern, minimal, responsive, light theme
 * - Sidebar for navigation and search
 * - Main area for note viewing/editing
 */
function App() {
  // Note Model: { id, title, body, updated }
  const [notes, setNotes] = useState(() => {
    // Try to load from localStorage
    const raw = localStorage.getItem("notes-v1");
    return raw ? JSON.parse(raw) : [];
  });
  const [searchString, setSearchString] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editorNote, setEditorNote] = useState(null); // For note in the editor (unsaved)
  const [editing, setEditing] = useState(false);
  const titleInputRef = useRef(null);

  // Utils for notes storage
  const persist = newNotes => {
    setNotes(newNotes);
    localStorage.setItem("notes-v1", JSON.stringify(newNotes));
  };

  // Get notes sorted by updated desc
  const getSorted = ns => [...ns].sort((a, b) => b.updated - a.updated);

  // Filtered notes for sidebar (search)
  const filteredNotes = getSorted(notes).filter(
    n => n.title.toLowerCase().includes(searchString.toLowerCase()) ||
         n.body.toLowerCase().includes(searchString.toLowerCase())
  );

  // Focus to latest created
  React.useEffect(() => {
    if (editorNote && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editing, editorNote]);

  // Select first note if no selected
  React.useEffect(() => {
    if (notes.length > 0 && !selectedId) {
      setSelectedId(notes[0].id);
    }
  }, [notes, selectedId]);

  // Handlers
  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedId(id);
    setEditing(false);
    setEditorNote(null);
  }

  // PUBLIC_INTERFACE
  function handleCreateNote() {
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      title: "Untitled Note",
      body: "",
      updated: Date.now(),
    };
    persist([note, ...notes]);
    setSelectedId(note.id);
    setEditorNote(note);
    setEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const filtered = notes.filter(n => n.id !== id);
      persist(filtered);
      if (selectedId === id) {
        setSelectedId(filtered.length ? filtered[0].id : null);
        setEditorNote(null);
        setEditing(false);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleStartEdit(note) {
    setEditorNote({...note});
    setEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setEditorNote(null);
    setEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleEditorChange(e) {
    // Called for textarea (body) and input (title)
    const { name, value } = e.target;
    setEditorNote(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    if (!editorNote.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    const updated = {
      ...editorNote,
      updated: Date.now(),
    };
    let replaced = false;
    const updatedNotes = notes.map(n => {
      if (n.id === updated.id) {
        replaced = true;
        return updated;
      }
      return n;
    });
    if (!replaced) {
      updatedNotes.unshift(updated);
    }
    persist(updatedNotes);
    setSelectedId(updated.id);
    setEditorNote(null);
    setEditing(false);
  }

  // Get note for main area
  const note =
    editing && editorNote
      ? editorNote
      : notes.find(n => n.id === selectedId) || null;

  // Sidebar render
  function Sidebar() {
    return (
      <aside style={{
        width: SIDEBAR_WIDTH,
        background: COLORS.lightAlt,
        borderRight: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 5,
        transition: 'box-shadow 0.2s'
      }}>
        <div style={{
          padding: "2rem 1.25rem 1.25rem",
          borderBottom: `1px solid ${COLORS.border}`,
          fontWeight: 700,
          fontSize: 22,
          color: COLORS.primary,
          letterSpacing: 1,
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>Notes</span>
          <button title="New note"
            onClick={handleCreateNote}
            style={{
              background: COLORS.primary,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 22,
              cursor: "pointer",
              fontWeight: 600,
              outline: "none",
              boxShadow: `0 1px 2px 0 rgba(60,64,67,0.06)`
            }}
          >+</button>
        </div>
        <div style={{
          padding: "1rem 1.25rem 0.25rem"
        }}>
          <input
            type="text"
            placeholder="Search notes..."
            aria-label="Search notes"
            value={searchString}
            onChange={e => setSearchString(e.target.value)}
            style={{
              width: "100%",
              fontSize: 15,
              padding: "8px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              marginBottom: 16,
              background: "#fff",
              color: COLORS.text,
              outline: "none"
            }}
          />
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem" }}>
          {filteredNotes.length === 0 ? (
            <p style={{ color: COLORS.secondary, fontSize: 14, margin: "2rem .5rem", textAlign: "center" }}>No notes found.</p>
          ) : (
            filteredNotes.map(n => (
              <div
                key={n.id}
                tabIndex={0}
                role="button"
                aria-pressed={selectedId === n.id}
                onClick={() => handleSelectNote(n.id)}
                onKeyDown={e =>
                  (e.key === "Enter" || e.key === " ") && handleSelectNote(n.id)
                }
                style={{
                  background: selectedId === n.id ? COLORS.primary + "18" : "inherit",
                  borderRadius: 5,
                  padding: "10px 8px",
                  marginBottom: 2,
                  transition: ".1s background",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  border: selectedId === n.id ? `1.5px solid ${COLORS.primary}` : undefined,
                  position: "relative",
                }}
              >
                <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                <div style={{ fontSize: 11, color: COLORS.secondary, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body.slice(0, 56) || <em>No content</em>}</div>
                <small style={{
                  color: COLORS.secondary,
                  opacity: 0.66,
                  position: "absolute",
                  right: 8,
                  top: 12,
                  fontSize: 10
                }}>
                  {new Date(n.updated).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                </small>
                {/* Delete icon for quick access */}
                <button title="Delete note"
                  onClick={e => { e.stopPropagation(); handleDeleteNote(n.id); }}
                  style={{
                    position: "absolute",
                    right: 8,
                    bottom: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.accent,
                    fontSize: "15px"
                  }}>
                  🗑️
                </button>
              </div>
            ))
          )}
        </nav>
        <footer style={{
          fontSize: 12,
          color: COLORS.secondary,
          textAlign: "center",
          padding: "1rem 0 0.75rem"
        }}>
          <span style={{ color: COLORS.accent, fontWeight: 600 }}>Simple Notes App</span>
          <br />
          <span style={{ color: COLORS.secondary }}>by Kavia</span>
        </footer>
      </aside>
    );
  }

  // Main area render
  function MainPanel() {
    if (!note && !editing) {
      return (
        <div style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.secondary,
          fontSize: 22,
          letterSpacing: 0.5
        }}>
          Select or create a note from the sidebar.
        </div>
      );
    }
    if (editing && editorNote) {
      // Editor
      return (
        <form className="editor-panel"
          style={{
            maxWidth: 600,
            margin: "3rem auto",
            background: "#fff",
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            padding: "2rem 2rem 1.2rem",
            boxShadow: "0px 1px 8px 2px rgba(60,60,80,0.04)"
          }}
          onSubmit={e => { e.preventDefault(); handleSaveNote(); }}>
          <label
            htmlFor="title"
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 10,
              color: COLORS.primary
            }}>
            Title
          </label>
          <input
            ref={titleInputRef}
            id="title"
            name="title"
            type="text"
            autoFocus
            required
            maxLength={60}
            placeholder="Note title"
            value={editorNote.title}
            onChange={handleEditorChange}
            style={{
              width: "100%",
              fontSize: "1.12rem",
              padding: "10px 12px",
              border: `1.5px solid ${COLORS.primary}`,
              borderRadius: 6,
              outline: "none",
              marginBottom: 18,
              boxSizing: "border-box",
              color: COLORS.text,
              fontWeight: 600,
            }}
          />
          <label
            htmlFor="body"
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 7,
              color: COLORS.secondary
            }}>
            Content
          </label>
          <textarea
            id="body"
            name="body"
            rows={11}
            placeholder="Write your note here..."
            required
            value={editorNote.body}
            onChange={handleEditorChange}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: "1rem",
              padding: "11px 12px",
              border: `1.1px solid ${COLORS.secondary}`,
              borderRadius: 5,
              marginBottom: 18,
              resize: "vertical",
              outline: "none"
            }}
          />
          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={handleCancelEdit} style={{
              background: COLORS.lightBg,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.secondary,
              borderRadius: 7,
              padding: "9px 18px",
              fontWeight: 600,
              cursor: "pointer"
            }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{
              background: COLORS.primary,
              color: "#fff",
              border: "none",
              padding: "9px 22px",
              borderRadius: 7,
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}>
              Save
            </button>
          </div>
        </form>
      );
    }
    // Note view
    return (
      <section className="note-panel"
        style={{ maxWidth: 700, margin: "2.5rem auto", padding: "0 6vw" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <h2 style={{
            color: COLORS.primary,
            margin: "0.1em 0",
            fontSize: 28,
            fontWeight: 700,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>{note.title}</h2>
          <button
            title="Edit note"
            onClick={() => handleStartEdit(note)}
            style={{
              background: COLORS.accent,
              color: "#39310d",
              fontWeight: 700,
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontSize: 15,
              marginLeft: 8,
              cursor: "pointer",
              transition: "all .13s"
            }}
          >
            Edit
          </button>
          <button
            title="Delete note"
            onClick={() => handleDeleteNote(note.id)}
            style={{
              background: "#fff6e0",
              color: COLORS.accent,
              fontSize: "16px",
              fontWeight: 700,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 6,
              padding: "8px 10px",
              marginLeft: 2,
              cursor: "pointer"
            }}
          >🗑️</button>
        </div>
        <p style={{
          color: COLORS.secondary,
          margin: "0.3em 0 1.2em",
          fontWeight: 500,
          fontSize: 13,
        }}>
          Last updated: {new Date(note.updated).toLocaleString()}
        </p>
        <div style={{
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: 22,
          color: COLORS.text,
          fontSize: 17,
          minHeight: 140,
          whiteSpace: "pre-wrap"
        }}>
          {note.body || <span style={{ color: COLORS.secondary, fontStyle: "italic" }}>No content.</span>}
        </div>
      </section>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.lightBg,
        color: COLORS.text,
        display: "flex"
      }}
    >
      <Sidebar />
      <main style={{
        marginLeft: SIDEBAR_WIDTH,
        width: "100%",
        background: "#fcfcfd",
        minHeight: "100vh"
      }}>
        <MainPanel />
      </main>
    </div>
  );
}

export default App;
