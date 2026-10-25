import { useState } from 'react'
import { ArrowLeftRight, Settings, Undo2 } from 'lucide-react'
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
  const [scoreboard, setScoreboard] = useState({
    scores: [0, 0],
    homeSide: 0,
    games: [0, 0],
    gameHistory: [],
    gameOver: false,
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

      if (!gameWon) {
        return {
          ...current,
          scores,
          undoStack: [...undoStack, previousState],
        }
      }

      const games = [...current.games]
      games[side] += 1

      return {
        ...current,
        scores,
        games,
        gameHistory: [...current.gameHistory, { scores, winner: side }],
        gameOver: true,
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
        gameOver: false,
        undoStack: [...undoStack, previousState],
      }
    })
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
      >
        <Settings aria-hidden="true" />
      </button>
      {scoreboard.scores.map((score, side) => (
        <button
          className={`score-tile ${side === 0 ? 'score-tile--blue' : 'score-tile--red'}`}
          type="button"
          key={side}
          aria-label={`${side === scoreboard.homeSide ? 'Heim' : 'Gast'} score: ${score}`}
          disabled={scoreboard.gameOver}
          onClick={() => incrementScore(side)}
        >
          <span className="score-tile__value">{score}</span>
          <span className="score-tile__label">
            {side === scoreboard.homeSide ? 'Heim' : 'Gast'}
          </span>
        </button>
      ))}
      <aside className="match-summary">
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
          <button
            className="next-game-button"
            type="button"
            onClick={startNextGame}
          >
            Next game
          </button>
        </div>
      )}
    </main>
  )
}

export default App
