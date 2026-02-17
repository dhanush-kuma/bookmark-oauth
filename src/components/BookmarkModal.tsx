"use client"

import { useState, useEffect } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, url: string) => void
  initialTitle?: string
  initialUrl?: string
  mode: "add" | "edit"
}

export default function BookmarkModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
  initialUrl = "",
  mode
}: Props) {

  const [title, setTitle] = useState(initialTitle)
  const [url, setUrl] = useState(initialUrl)

  useEffect(() => {
    setTitle(initialTitle)
    setUrl(initialUrl)
  }, [initialTitle, initialUrl])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">

        <h2 className="text-xl font-semibold">
          {mode === "add" ? "Add Bookmark" : "Edit Bookmark"}
        </h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onSave(title, url)
              onClose()
            }}
            className="px-4 py-1.5 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
