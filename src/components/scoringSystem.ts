export type ScoreboardSide = 0 | 1
export type ScorePair = [number, number]

export interface ScoringRules {
  pointsToWin: number
  pointCap: number
  gamesToWin: number
  maxGames: number
  endSwitch?: {
    gameNumber: number
    score: number
  }
}

export interface EndSwitchContext {
  scores: ScorePair
  side: ScoreboardSide
  completedGames: number
  endsSwitched: boolean
}

export class ScoringSystem {
  static readonly bestOfThreeTo21 = new ScoringSystem({
    pointsToWin: 21,
    pointCap: 30,
    gamesToWin: 2,
    maxGames: 3,
    endSwitch: {
      gameNumber: 3,
      score: 11,
    },
  })

  static readonly bestOfThreeTo15 = new ScoringSystem({
    pointsToWin: 15,
    pointCap: 21,
    gamesToWin: 2,
    maxGames: 3,
    endSwitch: {
      gameNumber: 3,
      score: 8,
    },
  })

  static readonly bestOfFiveTo11 = new ScoringSystem({
    pointsToWin: 11,
    pointCap: 15,
    gamesToWin: 3,
    maxGames: 5,
    endSwitch: {
      gameNumber: 5,
      score: 6,
    },
  })

  constructor(readonly rules: ScoringRules) {}

  get gamesToWin(): number {
    return this.rules.gamesToWin
  }

  get maxGames(): number {
    return this.rules.maxGames
  }

  isGameWon(scores: ScorePair, side: ScoreboardSide): boolean {
    const sideScore = scores[side]
    const opponentScore = scores[(1 - side) as ScoreboardSide]

    return (
      sideScore >= this.rules.pointCap ||
      (sideScore >= this.rules.pointsToWin &&
        sideScore - opponentScore >= 2)
    )
  }

  shouldSwitchEnds({ scores, side, completedGames, endsSwitched }: EndSwitchContext): boolean {
    const endSwitch = this.rules.endSwitch

    return (
      endSwitch !== undefined &&
      completedGames + 1 === endSwitch.gameNumber &&
      !endsSwitched &&
      scores[side] === endSwitch.score
    )
  }
}