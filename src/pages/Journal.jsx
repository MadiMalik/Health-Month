import { useState } from "react";
import { useEntries } from "../hooks/useEntries";
import EntryList from "../components/EntryList";
import Modal from "../components/Modal";
import EntryForm from "../components/EntryForm";
import { formatYYYYMMDD } from "../lib/date";

export default function Journal() {
  const { last30, addEntry, updateEntry, deleteEntry } = useEntries();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const today = formatYYYYMMDD(new Date());

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setOpen(true);
  };

  const onClose = () => setOpen(false);

  const onSave = (payload) => {
    if (editing) {
      updateEntry(editing.id, payload);
    } else {
      addEntry(payload);
    }
    setOpen(false);
  };

  const emptyState = last30.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Journal</h2>
          <p className="text-sm text-gray-600">
            Log daily info for the last 30 days.
          </p>
        </div>
        <button className="btn w-full sm:w-auto" onClick={onCreate} aria-haspopup="dialog">
          Add Today’s Entry
        </button>
      </div>

      {emptyState ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            No entries yet. Start by adding today’s entry.
          </p>
          <button className="btn" onClick={onCreate}>
            Add Entry
          </button>
        </div>
      ) : (
        <EntryList entries={last30} onEdit={openEdit} onDelete={deleteEntry} />
      )}

      <Modal
        open={open}
        onClose={onClose}
        title={editing ? "Edit Entry" : "Add Entry"}
      >
        <EntryForm
          open={open}
          onClose={onClose}
          onSave={onSave}
          initial={editing}
        />
      </Modal>
    </div>
  );
}