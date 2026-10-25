import { useState } from 'react'
import { ArrowLeftRight, Settings, Undo2, X } from 'lucide-react'
import './App.css'

function swapSideState(state) {
  return {
    ...state,
    scores: [...state.scores].reverse(),
    games: [...state.games].reverse(),
    gameHistory: state.gameHistory.map((game) => ({
      ...game,
      scores: [...game.scores].reverse(),
      winner: 1 - game.winner,
    })),
    homeSide: 1 - state.homeSide,
  }
}

function App() {
  const [teamNames, setTeamNames] = useState({ home: 'Heim', guest: 'Gast' })
  const [discipline, setDiscipline] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false)
  const [scoreboard, setScoreboard] = useState({
    scores: [0, 0],
    homeSide: 0,
    games: [0, 0],
    gameHistory: [],
    endsSwitched: false,
    gameOver: false,
    matchOver: false,
    undoStack: [],
  })

  function incrementScore(side) {
    setScoreboard((current) => {
      if (current.gameOver) {
        return current
      }

      const { undoStack, ...previousState } = current
      const scores = [...current.scores]
      scores[side] += 1

      const opponent = 1 - side
      const gameWon =
        scores[side] === 30 ||
        (scores[side] >= 21 && scores[side] - scores[opponent] >= 2)

      const switchEnds =
        current.gameHistory.length === 2 &&
        !current.endsSwitched &&
        scores[side] === 11

      if (switchEnds) {
        const switchedState = swapSideState({ ...current, scores })
        return {
          ...switchedState,
          endsSwitched: true,
          undoStack: [...undoStack, previousState],
        }
      }

      if (!gameWon) {
        return {
          ...current,
          scores,
          undoStack: [...undoStack, previousState],
        }
      }

      const games = [...current.games]
      games[side] += 1
      const matchWon = games[side] === 2

      return {
        ...current,
        scores,
        games,
        gameHistory: [...current.gameHistory, { scores, winner: side }],
        gameOver: true,
        matchOver: matchWon,
        undoStack: [...undoStack, previousState],
      }
    })
  }

  function startNextGame() {
    setScoreboard((current) => {
      const { undoStack, ...previousState } = current
      return {
        ...swapSideState(current),
        scores: [0, 0],
        endsSwitched: false,
        gameOver: false,
        undoStack: [...undoStack, previousState],
      }
    })
  }

  function startNewMatch() {
    setScoreboard((current) => {
      const { undoStack, ...previousState } = current
      return {
        ...current,
        scores: [0, 0],
        homeSide: 0,
        games: [0, 0],
        gameHistory: [],
        endsSwitched: false,
        gameOver: false,
        matchOver: false,
        undoStack: [...undoStack, previousState],
      }
    })
  }

  function resetScoreAndHistory() {
    setScoreboard((current) => {
      const { undoStack, ...previousState } = current
      return {
        ...current,
        scores: [0, 0],
        games: [0, 0],
        gameHistory: [],
        endsSwitched: false,
        gameOver: false,
        matchOver: false,
        undoStack: [...undoStack, previousState],
      }
    })
    setResetConfirmationOpen(false)
    setSettingsOpen(false)
  }

  function undoLastAction() {
    setScoreboard((current) => {
      if (current.undoStack.length === 0) {
        return current
      }

      const previousState = current.undoStack[current.undoStack.length - 1]
      return {
        ...previousState,
        undoStack: current.undoStack.slice(0, -1),
      }
    })
  }

  function switchSides() {
    setScoreboard((current) => {
      if (current.scores[0] !== 0 || current.scores[1] !== 0) {
        return current
      }

      const { undoStack, ...previousState } = current
      return {
        ...swapSideState(current),
        undoStack: [...undoStack, previousState],
      }
    })
  }

  return (
    <main className="scoreboard">
      <button
        className="undo-button"
        type="button"
        aria-label="Undo last action"
        title="Undo last action"
        disabled={scoreboard.undoStack.length === 0}
        onClick={undoLastAction}
      >
        <Undo2 aria-hidden="true" />
      </button>
      <button
        className="settings-button"
        type="button"
        aria-label="Settings"
        title="Settings"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        onClick={() => setSettingsOpen((open) => !open)}
      >
        <Settings aria-hidden="true" />
      </button>
      {settingsOpen && (
        <section
          className="settings-panel"
          role="dialog"
          aria-labelledby="settings-title"
        >
          <header className="settings-panel__header">
            <h2 id="settings-title">Einstellungen</h2>
            <button
              className="settings-panel__close"
              type="button"
              aria-label="Einstellungen schließen"
              onClick={() => setSettingsOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </header>
          <label className="settings-field">
            <span>Heim</span>
            <input
              type="text"
              value={teamNames.home}
              maxLength={20}
              onChange={(event) =>
                setTeamNames((current) => ({ ...current, home: event.target.value }))
              }
            />
          </label>
          <label className="settings-field">
            <span>Gast</span>
            <input
              type="text"
              value={teamNames.guest}
              maxLength={20}
              onChange={(event) =>
                setTeamNames((current) => ({ ...current, guest: event.target.value }))
              }
            />
          </label>
          <label className="settings-field">
            <span>Disziplin</span>
            <select
              value={discipline}
              onChange={(event) => setDiscipline(event.target.value)}
            >
              <option value="">Keine</option>
              <option value="HD1">HD1</option>
              <option value="HD2">HD2</option>
              <option value="DD">DD</option>
              <option value="HE1">HE1</option>
              <option value="HE2">HE2</option>
              <option value="DE">DE</option>
              <option value="HE3">HE3</option>
              <option value="MX">MX</option>
            </select>
          </label>
          <button
            className="settings-reset-button"
            type="button"
            onClick={() => setResetConfirmationOpen(true)}
          >
            Spielstand und Historie zurücksetzen
          </button>
          {resetConfirmationOpen && (
            <div className="reset-confirmation" role="group" aria-label="Reset bestätigen">
              <p>Spielstand und gesamte Historie wirklich zurücksetzen?</p>
              <div className="reset-confirmation__actions">
                <button
                  className="reset-confirmation__cancel"
                  type="button"
                  onClick={() => setResetConfirmationOpen(false)}
                >
                  Abbrechen
                </button>
                <button
                  className="reset-confirmation__confirm"
                  type="button"
                  onClick={resetScoreAndHistory}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}
        </section>
      )}
      {scoreboard.scores.map((score, side) => (
        <button
          className={`score-tile ${side === 0 ? 'score-tile--blue' : 'score-tile--red'}`}
          type="button"
          key={side}
          aria-label={`${side === scoreboard.homeSide ? teamNames.home || 'Heim' : teamNames.guest || 'Gast'} score: ${score}`}
          disabled={scoreboard.gameOver}
          onClick={() => incrementScore(side)}
        >
          <span className="score-tile__value">{score}</span>
          <span className="score-tile__label">
            {side === scoreboard.homeSide
              ? teamNames.home || 'Heim'
              : teamNames.guest || 'Gast'}
          </span>
        </button>
      ))}
      <aside className="match-summary">
        {discipline && <div className="match-discipline">{discipline}</div>}
        <div
          className="games-indicator"
          aria-label={`Games: left ${scoreboard.games[0]}, right ${scoreboard.games[1]}`}
        >
          <span className="games-indicator__score games-indicator__score--blue">
            {scoreboard.games[0]}
          </span>
          <span className="games-indicator__divider" aria-hidden="true" />
          <span className="games-indicator__score games-indicator__score--red">
            {scoreboard.games[1]}
          </span>
        </div>
        {scoreboard.scores[0] === 0 && scoreboard.scores[1] === 0 && (
          <button
            className="side-switch-button"
            type="button"
            aria-label="Heim und Gast tauschen"
            title="Heim und Gast tauschen"
            onClick={switchSides}
          >
            <ArrowLeftRight aria-hidden="true" />
          </button>
        )}
        {scoreboard.gameHistory.length > 0 && (
          <ol className="past-games" aria-label="Scores of completed games">
            {scoreboard.gameHistory.map((game, index) => (
              <li className="past-games__item" key={index}>
                <span className="past-games__number">{index + 1}</span>
                <span className={`past-games__score past-games__score--blue ${game.winner === 0 ? 'past-games__score--winner' : ''}`}>
                  {game.scores[0]}
                </span>
                <span className="past-games__divider" aria-hidden="true">
                  -
                </span>
                <span className={`past-games__score past-games__score--red ${game.winner === 1 ? 'past-games__score--winner' : ''}`}>
                  {game.scores[1]}
                </span>
              </li>
            ))}
          </ol>
        )}
      </aside>
      {scoreboard.gameOver && (
        <div className="next-game-overlay">
          {scoreboard.matchOver ? (
            <div className="match-over-content">
              <div className="match-over-message" role="status">
                Match gewonnen: {scoreboard.homeSide === scoreboard.games.indexOf(2)
                  ? teamNames.home || 'Heim'
                  : teamNames.guest || 'Gast'}
              </div>
              <button
                className="next-game-button"
                type="button"
                onClick={startNewMatch}
              >
                Neues Match
              </button>
            </div>
          ) : (
            <button
              className="next-game-button"
              type="button"
              onClick={startNextGame}
            >
              {scoreboard.gameHistory.length === 1 ? '2. Satz' : '3. Satz'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default App
