import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import ManualMatchForm from './ManualMatchForm'
import PastMatchCard from './PastMatchCard'
import { type Locale, type Messages } from '../i18n'

export interface PastMatchRecord {
  id: string
  manual?: boolean
  discipline: string
  homeName: string
  guestName: string
  startedAt?: number
  endedAt: number
  games: Array<{
    homeScore: number
    guestScore: number
  }>
}

interface PastMatchesProps {
  matches: PastMatchRecord[]
  onBack: () => void
  onAddMatch: (match: PastMatchRecord) => void
  onUpdateMatch: (match: PastMatchRecord) => void
  onDeleteMatch: (matchId: string) => void
  locale: Locale
  messages: Messages
}

export default function PastMatches({
  matches,
  onBack,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  locale,
  messages,
}: PastMatchesProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMatch, setEditingMatch] = useState<PastMatchRecord | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null)

  function saveManualMatch(match: PastMatchRecord) {
    if (editingMatch?.id) {
      onUpdateMatch(match)
    } else {
      onAddMatch(match)
    }
    setShowAddForm(false)
    setEditingMatch(null)
  }

  function startNewMatchEntry() {
    setEditingMatch(null)
    setFormKey((current) => current + 1)
    setShowAddForm((visible) => !visible)
  }

  function startEditingMatch(match: PastMatchRecord) {
    setEditingMatch(match)
    setFormKey((current) => current + 1)
    setShowAddForm(true)
  }

  return (
    <main className="past-matches-page">
      <header className="past-matches-page__header">
        <button
          className="past-matches-page__back"
          type="button"
          aria-label={messages.historyBack}
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
          <span>{messages.historyBackLabel}</span>
        </button>
        <h1>{messages.historyTitle}</h1>
        <button
          className="past-matches-add-button"
          type="button"
          aria-label={messages.addMatchResult}
          title={messages.addMatchResult}
          onClick={startNewMatchEntry}
        >
          <Plus aria-hidden="true" />
        </button>
      </header>
      <div className="past-matches-list">
        {showAddForm && (
          <ManualMatchForm
            key={formKey}
            match={editingMatch}
            onSave={saveManualMatch}
            onCancel={() => setShowAddForm(false)}
            locale={locale}
            messages={messages}
          />
        )}
        {matches.length === 0 ? (
          !showAddForm && <p className="past-matches-empty">{messages.historyEmpty}</p>
        ) : (
          matches.map((match) => (
            <PastMatchCard
              key={match.id}
              match={match}
              isDeleting={deletingMatchId === match.id}
              onEdit={startEditingMatch}
              onRequestDelete={() => setDeletingMatchId(match.id)}
              onConfirmDelete={() => {
                onDeleteMatch(match.id)
                setDeletingMatchId(null)
              }}
              onCancelDelete={() => setDeletingMatchId(null)}
              locale={locale}
              messages={messages}
            />
          ))
        )}
      </div>
    </main>
  )
}