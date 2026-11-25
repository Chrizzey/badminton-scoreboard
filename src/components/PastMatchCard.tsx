import { Pencil, Trash2 } from 'lucide-react'
import { translateDiscipline, type Locale, type Messages } from '../i18n'
import type { PastMatchRecord } from './PastMatches'

interface PastMatchCardProps {
  match: PastMatchRecord
  isDeleting: boolean
  onEdit: (match: PastMatchRecord) => void
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  locale: Locale
  messages: Messages
}

function formatDateTime(timestamp: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export default function PastMatchCard({
  match,
  isDeleting,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  locale,
  messages,
}: PastMatchCardProps) {
  const homeWins = match.games.filter((game) => game.homeScore > game.guestScore).length
  const guestWins = match.games.filter((game) => game.guestScore > game.homeScore).length
  const isManual = match.manual || match.id.startsWith('manual-')

  return (
    <article className="past-match">
      <header className="past-match__header">
        {match.discipline && match.discipline !== 'Keine' && (
          <span className="past-match__discipline">
            {translateDiscipline(match.discipline, locale)}
          </span>
        )}
        <div className="past-match__title">
          <h2>
            {match.homeName} <span>{messages.versus}</span> {match.guestName}
          </h2>
        </div>
        <div className="past-match__actions">
          {isManual && (
            <button
              className="past-match__edit"
              type="button"
              aria-label={messages.editMatch(match.homeName, match.guestName)}
              title={messages.editMatch(match.homeName, match.guestName)}
              onClick={() => onEdit(match)}
            >
              <Pencil aria-hidden="true" />
            </button>
          )}
          <button
            className="past-match__delete"
            type="button"
            aria-label={messages.deleteMatch(match.homeName, match.guestName)}
            title={messages.deleteMatch(match.homeName, match.guestName)}
            onClick={onRequestDelete}
          >
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </header>
      {isDeleting && (
        <div className="past-match__delete-confirmation" role="group">
          <p>{messages.confirmDeleteMatch(match.homeName, match.guestName)}</p>
          <button type="button" onClick={onConfirmDelete}>
            {messages.deleteMatch(match.homeName, match.guestName)}
          </button>
          <button type="button" onClick={onCancelDelete}>
            {messages.cancel}
          </button>
        </div>
      )}
      <div className="past-match__results">
        <div className="past-match__scores">
          <table aria-label={messages.historyTableLabel}>
            <tbody>
              <tr className={homeWins > guestWins ? 'past-match__winner' : undefined}>
                <th scope="row">{match.homeName}</th>
                {match.games.map((game, index) => (
                  <td key={`${match.id}-home-${index}`}>{game.homeScore}</td>
                ))}
              </tr>
              <tr className={guestWins > homeWins ? 'past-match__winner' : undefined}>
                <th scope="row">{match.guestName}</th>
                {match.games.map((game, index) => (
                  <td key={`${match.id}-guest-${index}`}>{game.guestScore}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <dl className="past-match__times">
          {match.startedAt !== undefined && (
            <div>
              <dt>{messages.startTime}</dt>
              <dd>
                <time dateTime={new Date(match.startedAt).toISOString()}>
                  {formatDateTime(match.startedAt, locale)}
                </time>
              </dd>
            </div>
          )}
          <div>
            <dt>{messages.endTime}</dt>
            <dd>
              <time dateTime={new Date(match.endedAt).toISOString()}>
                {formatDateTime(match.endedAt, locale)}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}