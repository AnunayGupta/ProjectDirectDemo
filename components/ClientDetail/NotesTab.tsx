import { Note } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { firmConfig } from '@/lib/firm-config'

interface NotesTabProps {
  notes: Note[]
  advisorName?: string
}

export default function NotesTab({ notes, advisorName }: NotesTabProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-sage py-8 text-center">No notes recorded.</p>
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const advisor = firmConfig.advisors.find(a => a.id === note.advisorId)
        return (
          <div key={note.id} className="bg-surface rounded border border-border/50 px-6 py-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-heading text-base text-text">{note.title}</h4>
              <p className="text-[11px] text-sage flex-shrink-0 mt-1">{formatDate(note.createdAt)}</p>
            </div>
            <p className="text-sm text-text/80 leading-relaxed">{note.body}</p>
            <p className="text-[11px] text-sage mt-3">
              {advisor ? `${advisor.name} — ${advisor.title}` : 'Advisor'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
