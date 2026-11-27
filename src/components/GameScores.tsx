export type GameScore = [number, number]

interface GameScoresProps {
  teamNames: [string, string]
  games: GameScore[]
  label: string
}

export default function GameScores({ teamNames, games, label }: GameScoresProps) {
  const gamesWon = [0, 1].map((team) =>
    games.filter((game) => game[team] > game[1 - team]).length,
  )

  return (
    <table className="game-scores" aria-label={label}>
      <tbody>
        {teamNames.map((teamName, team) => (
          <tr
            key={team}
            className={gamesWon[team] > gamesWon[1 - team] ? 'game-scores__winner' : undefined}
          >
            <th scope="row">{teamName}</th>
            {games.map((game, index) => (
              <td
                key={index}
                className={game[team] > game[1 - team] ? 'game-scores__score--winner' : undefined}
              >
                {game[team]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
