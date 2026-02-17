'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BookmarkModal from '@/components/BookmarkModal'
import { Plus, Trash2, Pencil, Power } from "lucide-react"

type Bookmark = {
  id: string
  title: string
  url: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setBookmarks(data)
  }

  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks'
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const addBookmark = async (title: string, url: string) => {
    if (!title || !url) return

    await supabase.from('bookmarks').insert([
      { title, url, user_id: user.id }
    ])

    setTitle('')
    setUrl('')
    fetchBookmarks()
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    fetchBookmarks()
  }

  const startEditing = (bookmark: Bookmark) => {
    setEditingId(bookmark.id)
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url)
  }

  const updateBookmark = async (id: string, title: string, url: string) => {
    await supabase
      .from('bookmarks')
      .update({ title: editTitle, url: editUrl })
      .eq('id', id)

    setEditingId(null)
    fetchBookmarks()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          <Power size={16} />
          Logout
        </button>
      </div>


      <div className="space-y-2">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="border p-3 rounded space-y-2"
          >
            {editingId === b.id ? (
              <div className="space-y-2">
                <input
                  className="border p-2 w-full rounded"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  className="border p-2 w-full rounded"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateBookmark(b.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <a
                  href={b.url}
                  target="_blank"
                  className="font-semibold hover:underline"
                >
                  {b.title}
                </a>

                <div className="flex gap-4">

                  <button
                    onClick={() => {
                      setEditData(b)
                      setModalOpen(true)
                    }}
                    className="group relative"
                  >
                    <Pencil size={18} className="text-blue-600 hover:scale-110 transition" />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      Edit
                    </span>
                  </button>

                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="group relative"
                  >
                    <Trash2 size={18} className="text-red-600 hover:scale-110 transition" />
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      Delete
                    </span>
                  </button>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        {/* <input
          className="border p-2 flex-1 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 flex-1 rounded"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        /> */}
        <button
          onClick={() => {
            setEditData(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add
        </button>
      </div>
      <BookmarkModal
        isOpen={modalOpen}
        mode={editData ? "edit" : "add"}
        initialTitle={editData?.title}
        initialUrl={editData?.url}
        onClose={() => setModalOpen(false)}
        onSave={(title, url) => {
          if (editData) {
            updateBookmark(editData.id, title, url)
          } else {
            addBookmark(title, url)
          }
        }}
      />

    </div>
  )
}
