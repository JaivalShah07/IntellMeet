// @ts-nocheck
import { useState } from "react";

export default function CreateMeetingModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white w-96 p-6 rounded-xl shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Create Meeting
        </h2>

        <input
          className="w-full p-2 border mb-3 rounded"
          placeholder="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border mb-3 rounded"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Create
          </button>

        </div>

      </div>

    </div>
  );
}
