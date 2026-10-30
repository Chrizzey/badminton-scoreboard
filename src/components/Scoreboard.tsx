import { useState, type ReactNode } from 'react'
import { ScoringSystem, type ScorePair, type ScoreboardSide } from './scoringSystem'

export type { ScoreboardSide } from './scoringSystem'

export interface GameResult {
  scores: ScorePair
  winner: ScoreboardSide
}

interface ScoreboardSnapshot {
  scores: ScorePair
  homeSide: ScoreboardSide
  games: ScorePair
  gameHistory: GameResult[]
  endsSwitched: boolean
  gameOver: boolean
  matchOver: boolean
}

interface ScoreboardState extends ScoreboardSnapshot {
  undoStack: ScoreboardSnapshot[]
}

export interface ScoreboardModel {
  scores: ScorePair
  homeSide: ScoreboardSide
  homeScore: number
  guestScore: number
  games: ScorePair
  gamesToWin: number
  maxGames: number
  gameHistory: GameResult[]
  endsSwitched: boolean
  gameOver: boolean
  matchOver: boolean
  canUndo: boolean
  incrementScore: (side: ScoreboardSide) => void
  startNextGame: () => void
  startNewMatch: () => void
  resetScoreAndHistory: () => void
  undoLastAction: () => void
  switchSides: () => void
}

export interface ScoreboardProps {
  scoringSystem?: ScoringSystem
  children: (model: ScoreboardModel) => ReactNode
}

function swapSideState(state: ScoreboardSnapshot): ScoreboardSnapshot {
  return {
    ...state,
    scores: [state.scores[1], state.scores[0]],
    games: [state.games[1], state.games[0]],
    gameHistory: state.gameHistory.map((game) => ({
      ...game,
      scores: [game.scores[1], game.scores[0]],
      winner: (1 - game.winner) as ScoreboardSide,
    })),
    homeSide: (1 - state.homeSide) as ScoreboardSide,
  }
}

export default function Scoreboard({
  children,
  scoringSystem = ScoringSystem.bestOfThreeTo21,
}: ScoreboardProps) {
  const [state, setState] = useState<ScoreboardState>({
    scores: [0, 0],
    homeSide: 0,
    games: [0, 0],
    gameHistory: [],
    endsSwitched: false,
    gameOver: false,
    matchOver: false,
    undoStack: [],
  })

  function incrementScore(side: ScoreboardSide) {
    setState((current) => {
      if (current.gameOver) {
        return current
      }

      const { undoStack, ...previousState } = current
      const scores: ScorePair = [...current.scores]
      scores[side] += 1

      const gameWon = scoringSystem.isGameWon(scores, side)
      const switchEnds = scoringSystem.shouldSwitchEnds({
        scores,
        side,
        completedGames: current.gameHistory.length,
        endsSwitched: current.endsSwitched,
      })

      if (switchEnds) {
        return {
          ...swapSideState({ ...current, scores }),
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

      const games: ScorePair = [...current.games]
      games[side] += 1

      return {
        ...current,
        scores,
        games,
        gameHistory: [...current.gameHistory, { scores, winner: side }],
        gameOver: true,
        matchOver: games[side] >= scoringSystem.gamesToWin,
        undoStack: [...undoStack, previousState],
      }
    })
  }

  function startNextGame() {
    setState((current) => {
      if (
        !current.gameOver ||
        current.matchOver ||
        current.gameHistory.length >= scoringSystem.maxGames
      ) {
        return current
      }

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
    setState((current) => {
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
    setState((current) => {
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
  }

  function undoLastAction() {
    setState((current) => {
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
    setState((current) => {
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

  const model: ScoreboardModel = {
    ...state,
    homeScore: state.scores[state.homeSide],
    guestScore: state.scores[(1 - state.homeSide) as ScoreboardSide],
    gamesToWin: scoringSystem.gamesToWin,
    maxGames: scoringSystem.maxGames,
    canUndo: state.undoStack.length > 0,
    incrementScore,
    startNextGame,
    startNewMatch,
    resetScoreAndHistory,
    undoLastAction,
    switchSides,
  }

  return children(model)
}
