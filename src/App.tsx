import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeftRight, Maximize, Minimize, Settings, Undo2, X } from 'lucide-react'
import Scoreboard, { type ScoreboardSide } from './components/Scoreboard'
import { ScoringSystem } from './components/scoringSystem'
import './App.css'

interface AppProps {
  scoringSystem?: ScoringSystem
}

const scoringModes = [
  {
    value: 'bestOfThreeTo21',
    label: '3x21',
    scoringSystem: ScoringSystem.bestOfThreeTo21,
  },
  {
    value: 'bestOfThreeTo15',
    label: '3x15',
    scoringSystem: ScoringSystem.bestOfThreeTo15,
  },
  {
    value: 'bestOfFiveTo11',
    label: '5x11',
    scoringSystem: ScoringSystem.bestOfFiveTo11,
  },
] as const

function App({ scoringSystem }: AppProps) {
  const [teamNames, setTeamNames] = useState({ home: 'Heim', guest: 'Gast' })
  const [discipline, setDiscipline] = useState('')
  const [selectedScoringSystem, setSelectedScoringSystem] = useState(
    () => scoringSystem ?? ScoringSystem.bestOfThreeTo21,
  )
  const [pendingScoringSystem, setPendingScoringSystem] = useState<ScoringSystem | null>(null)
  const [modeSwitchConfirmationOpen, setModeSwitchConfirmationOpen] = useState(false)
  const [scoreboardInstance, setScoreboardInstance] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)
  const settingsPanelRef = useRef<HTMLElement | null>(null)
  const selectedMode = scoringModes.find(
    (mode) => mode.scoringSystem === selectedScoringSystem,
  )?.value ?? 'custom'

  useEffect(() => {
    if (!settingsOpen) {
      return undefined
    }

    function handleOutsideClick(event: MouseEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      const eventPath = event.composedPath()
      if (
        (settingsPanelRef.current && eventPath.includes(settingsPanelRef.current)) ||
        (settingsButtonRef.current && eventPath.includes(settingsButtonRef.current))
      ) {
        return
      }

      setSettingsOpen(false)
      setResetConfirmationOpen(false)
      setModeSwitchConfirmationOpen(false)
      setPendingScoringSystem(null)
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [settingsOpen])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === document.documentElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen may be unavailable or disallowed by the current browser context.
    }
  }

  return (
    <Scoreboard
      key={scoreboardInstance}
      scoringSystem={selectedScoringSystem}
    >
      {(scoreboard) => (
    <main className="scoreboard">
      <button
        className="undo-button"
        type="button"
        aria-label="Undo last action"
        title="Undo last action"
        disabled={!scoreboard.canUndo}
        onClick={scoreboard.undoLastAction}
      >
        <Undo2 aria-hidden="true" />
      </button>
      <button
        ref={settingsButtonRef}
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
      <button
        className="fullscreen-button"
        type="button"
        aria-label={isFullscreen ? 'Vollbild verlassen' : 'Vollbild aktivieren'}
        title={isFullscreen ? 'Vollbild verlassen' : 'Vollbild aktivieren'}
        aria-pressed={isFullscreen}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
      </button>
      {settingsOpen && createPortal(
        <div className="settings-overlay">
          <section
            ref={settingsPanelRef}
            className="settings-panel"
            role="dialog"
            aria-modal="true"
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
          <label className="settings-field">
            <span>Spielmodus</span>
            <select
              value={selectedMode}
              onChange={(event) => {
                const nextMode = event.target.value
                const nextSystem = scoringModes.find((mode) => mode.value === nextMode)
                  ?.scoringSystem ?? (nextMode === 'custom' ? scoringSystem : undefined)

                if (!nextSystem || nextSystem === selectedScoringSystem) {
                  return
                }

                const matchHasStarted =
                  scoreboard.canUndo ||
                  scoreboard.gameHistory.length > 0 ||
                  scoreboard.scores.some((score) => score > 0) ||
                  scoreboard.games.some((gamesWon) => gamesWon > 0)

                if (matchHasStarted) {
                  setPendingScoringSystem(nextSystem)
                  setModeSwitchConfirmationOpen(true)
                  return
                }

                setSelectedScoringSystem(nextSystem)
              }}
            >
              {selectedMode === 'custom' && (
                <option value="custom">Benutzerdefiniert</option>
              )}
              {scoringModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          {modeSwitchConfirmationOpen && pendingScoringSystem && (
            <div className="reset-confirmation" role="group" aria-label="Moduswechsel bestätigen">
              <p>Ein Moduswechsel setzt Spielstand und Historie zurück. Fortfahren?</p>
              <div className="reset-confirmation__actions">
                <button
                  className="reset-confirmation__cancel"
                  type="button"
                  onClick={() => {
                    setPendingScoringSystem(null)
                    setModeSwitchConfirmationOpen(false)
                  }}
                >
                  Abbrechen
                </button>
                <button
                  className="reset-confirmation__confirm"
                  type="button"
                  onClick={() => {
                    setSelectedScoringSystem(pendingScoringSystem)
                    setScoreboardInstance((instance) => instance + 1)
                    setPendingScoringSystem(null)
                    setModeSwitchConfirmationOpen(false)
                    setSettingsOpen(false)
                  }}
                >
                  Modus wechseln
                </button>
              </div>
            </div>
          )}
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
                  onClick={() => {
                    scoreboard.resetScoreAndHistory()
                    setResetConfirmationOpen(false)
                    setSettingsOpen(false)
                  }}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}
          </section>
        </div>,
        document.body,
      )}
      {scoreboard.scores.map((score, side) => (
        <button
          className={`score-tile ${side === 0 ? 'score-tile--blue' : 'score-tile--red'}`}
          type="button"
          key={side}
          aria-label={`${side === scoreboard.homeSide ? teamNames.home || 'Heim' : teamNames.guest || 'Gast'} score: ${score}`}
          disabled={scoreboard.gameOver}
          onClick={() => {
            if (settingsOpen) {
              return
            }

            scoreboard.incrementScore(side as ScoreboardSide)
          }}
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
            onClick={scoreboard.switchSides}
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
                Match gewonnen: {scoreboard.homeSide === scoreboard.games.findIndex(
                  (gamesWon) => gamesWon >= scoreboard.gamesToWin,
                )
                  ? teamNames.home || 'Heim'
                  : teamNames.guest || 'Gast'}
              </div>
              <button
                className="next-game-button"
                type="button"
                onClick={scoreboard.startNewMatch}
              >
                Neues Match
              </button>
            </div>
          ) : (
            <button
              className="next-game-button"
              type="button"
              onClick={scoreboard.startNextGame}
            >
              {scoreboard.gameHistory.length + 1}. Satz
            </button>
          )}
        </div>
      )}
    </main>
      )}
    </Scoreboard>
  )
}

export default App
