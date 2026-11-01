import { ArrowLeft } from 'lucide-react'

export interface PastMatchRecord {
  id: string
  discipline: string
  homeName: string
  guestName: string
  startedAt: number
  endedAt: number
  games: Array<{
    homeScore: number
    guestScore: number
  }>
}

interface PastMatchesProps {
  matches: PastMatchRecord[]
  onBack: () => void
}

const dateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(new Date(timestamp))
}

export default function PastMatches({ matches, onBack }: PastMatchesProps) {
  return (
    <main className="past-matches-page">
      <header className="past-matches-page__header">
        <button
          className="past-matches-page__back"
          type="button"
          aria-label="Zurück zum Spielstand"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" />
          <span>Spielstand</span>
        </button>
        <h1>Vergangene Matches</h1>
      </header>
      <div className="past-matches-list">
        {matches.length === 0 ? (
          <p className="past-matches-empty">Noch keine abgeschlossenen Matches</p>
        ) : (
          matches.map((match) => {
            const homeWins = match.games.filter((game) => game.homeScore > game.guestScore).length
            const guestWins = match.games.filter((game) => game.guestScore > game.homeScore).length

            return (
              <article className="past-match" key={match.id}>
                <header className="past-match__header">
                  {match.discipline && match.discipline !== 'Keine' && (
                    <span className="past-match__discipline">{match.discipline}</span>
                  )}
                  <div className="past-match__title">
                    <h2>
                      {match.homeName} <span>vs</span> {match.guestName}
                    </h2>
                  </div>
                </header>
                <div className="past-match__results">
                  <div className="past-match__scores">
                    <table aria-label="Spielstände je Team, Spiele in chronologischer Reihenfolge">
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
                    <div>
                      <dt>Beginn</dt>
                      <dd>
                        <time dateTime={new Date(match.startedAt).toISOString()}>
                          {formatDateTime(match.startedAt)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>Ende</dt>
                      <dd>
                        <time dateTime={new Date(match.endedAt).toISOString()}>
                          {formatDateTime(match.endedAt)}
                        </time>
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            )
          })
        )}
      </div>
    </main>
  )
}