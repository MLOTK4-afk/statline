"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Field";

export function NotesModal({
  athleteName,
  initialNote,
  onSave,
  onClose,
}: {
  athleteName: string;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote);

  return (
    <Modal onClose={onClose} labelledBy="notes-modal-title">
      <Card className="w-full max-w-md p-6">
        <h2 id="notes-modal-title" className="text-xl text-white">
          Note — {athleteName}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Only visible to you.
        </p>
        <div className="mt-4">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Spoke with the athlete's HS coach on 4/12, strong interest..."
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(note);
              onClose();
            }}
          >
            Save Note
          </Button>
        </div>
      </Card>
    </Modal>
  );
}
