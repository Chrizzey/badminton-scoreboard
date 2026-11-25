import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { disciplineCodes, translateDiscipline, type Locale, type Messages } from '../i18n'
import type { PastMatchRecord } from './PastMatches'

interface ManualMatchFormProps {
  match: PastMatchRecord | null
  onSave: (match: PastMatchRecord) => void
  onCancel: () => void
  locale: Locale
  messages: Messages
}

interface ManualGameScore {
  homeScore: string
  guestScore: string
}

function toLocalDateTimeValue(timestamp: number): string {
  const localTimestamp = timestamp - new Date(timestamp).getTimezoneOffset() * 60_000
  return new Date(localTimestamp).toISOString().slice(0, 16)
}

export default function ManualMatchForm({
  match,
  onSave,
  onCancel,
  locale,
  messages,
}: ManualMatchFormProps) {
  const [homeName, setHomeName] = useState(match?.homeName ?? messages.home)
  const [guestName, setGuestName] = useState(match?.guestName ?? messages.guest)
  const [discipline, setDiscipline] = useState(match?.discipline ?? '')
  const [gameScores, setGameScores] = useState<ManualGameScore[]>(() =>
    match ? match.games.map((game) => ({
      homeScore: String(game.homeScore),
      guestScore: String(game.guestScore),
    })) : [{ homeScore: '', guestScore: '' }],
  )
  const [endedAt, setEndedAt] = useState(() => toLocalDateTimeValue(match?.endedAt ?? Date.now()))
  const [formError, setFormError] = useState('')

  function saveManualMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const endedAtTimestamp = new Date(endedAt).getTime()
    if (!Number.isFinite(endedAtTimestamp)) {
      return
    }

    const completedGames = gameScores.map((game) => ({
      homeScore: Number(game.homeScore),
      guestScore: Number(game.guestScore),
    }))
    if (completedGames.some((game) => game.homeScore === game.guestScore)) {
      setFormError(messages.tiedGameScore)
      return
    }

    onSave({
      id: match?.id ?? `manual-${endedAtTimestamp}-${Math.random().toString(36).slice(2)}`,
      manual: true,
      discipline,
      homeName: homeName.trim() || messages.home,
      guestName: guestName.trim() || messages.guest,
      endedAt: endedAtTimestamp,
      games: completedGames,
    })
  }

  return (
    <form className="manual-match-form" onSubmit={saveManualMatch}>
      <header className="manual-match-form__header">
        <h2>{match?.id ? messages.updateMatchResult : messages.newMatchResult}</h2>
        <button
          className="manual-match-form__close"
          type="button"
          aria-label={messages.cancel}
          onClick={onCancel}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="manual-match-form__teams">
        <label className="manual-match-field">
          <span>{messages.home}</span>
          <input
            required
            value={homeName}
            onChange={(event) => setHomeName(event.target.value)}
          />
        </label>
        <label className="manual-match-field">
          <span>{messages.guest}</span>
          <input
            required
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
          />
        </label>
        <label className="manual-match-field">
          <span>{messages.discipline}</span>
          <select value={discipline} onChange={(event) => setDiscipline(event.target.value)}>
            <option value="">{messages.noDiscipline}</option>
            {disciplineCodes.map((code) => (
              <option key={code} value={code}>
                {translateDiscipline(code, locale)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="manual-match-games">
        {gameScores.map((game, gameIndex) => (
          <fieldset className="manual-match-game" key={gameIndex}>
            <legend>{messages.nextGame(gameIndex + 1)}</legend>
            <label className="manual-match-field">
              <span>{homeName || messages.home}</span>
              <input
                aria-label={messages.gameScoreInput(gameIndex + 1, homeName || messages.home)}
                type="number"
                min="0"
                step="1"
                required
                value={game.homeScore}
                onChange={(event) =>
                  setGameScores((current) => current.map((currentGame, currentIndex) =>
                    currentIndex === gameIndex
                      ? { ...currentGame, homeScore: event.target.value }
                      : currentGame,
                  ))
                }
              />
            </label>
            <label className="manual-match-field">
              <span>{guestName || messages.guest}</span>
              <input
                aria-label={messages.gameScoreInput(gameIndex + 1, guestName || messages.guest)}
                type="number"
                min="0"
                step="1"
                required
                value={game.guestScore}
                onChange={(event) =>
                  setGameScores((current) => current.map((currentGame, currentIndex) =>
                    currentIndex === gameIndex
                      ? { ...currentGame, guestScore: event.target.value }
                      : currentGame,
                  ))
                }
              />
            </label>
            {gameScores.length > 1 && (
              <button
                className="manual-match-game__remove"
                type="button"
                aria-label={messages.removeGame(gameIndex + 1)}
                onClick={() => setGameScores((current) =>
                  current.filter((_, currentIndex) => currentIndex !== gameIndex),
                )}
              >
                <X aria-hidden="true" />
              </button>
            )}
          </fieldset>
        ))}
      </div>
      {gameScores.length < 5 && (
        <button
          className="manual-match-form__add-game"
          type="button"
          onClick={() => setGameScores((current) => [
            ...current,
            { homeScore: '', guestScore: '' },
          ])}
        >
          <Plus aria-hidden="true" />
          {messages.addGame}
        </button>
      )}
      <div className="manual-match-form__times">
        <label className="manual-match-field">
          <span>{messages.endTime}</span>
          <input
            type="datetime-local"
            required
            value={endedAt}
            onChange={(event) => setEndedAt(event.target.value)}
          />
        </label>
      </div>
      {formError && <p className="manual-match-form__error" role="alert">{formError}</p>}
      <footer className="manual-match-form__actions">
        <button type="button" onClick={onCancel}>
          {messages.cancel}
        </button>
        <button className="manual-match-form__save" type="submit">
          {match?.id ? messages.updateMatchResult : messages.saveMatchResult}
        </button>
      </footer>
    </form>
  )
}