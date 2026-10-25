import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import Scoreboard, { type ScoreboardModel } from '../components/Scoreboard'

function scoreTiles(): HTMLButtonElement[] {
  return screen.getAllByRole('button', { name: /score: \d+$/ }) as HTMLButtonElement[]
}

function points(): string[] {
  return scoreTiles().map(
    (tile) => tile.querySelector<HTMLElement>('.score-tile__value')?.textContent ?? '',
  )
}

function matchScore(): string[] {
  return [...document.querySelectorAll<HTMLElement>('.games-indicator__score')].map(
    (node) => node.textContent ?? '',
  )
}

function clickTile(index: number, count = 1): void {
  const tile = () => scoreTiles()[index]
  for (let point = 0; point < count; point += 1) {
    fireEvent.click(tile())
  }
}

function winGame(index: number, pointsToWin = 21): void {
  clickTile(index, pointsToWin)
}

describe('badminton scoreboard UI', () => {
  it('exposes home/guest scores and completed-game history to its parent', () => {
    let model!: ScoreboardModel

    render(
      <Scoreboard>
        {(scoreboard) => {
          model = scoreboard
          return (
            <div>
              <output aria-label="Home score">{scoreboard.homeScore}</output>
              <output aria-label="Guest score">{scoreboard.guestScore}</output>
              <output aria-label="Past-game scores">
                {JSON.stringify(scoreboard.gameHistory.map((game) => game.scores))}
              </output>
              <button onClick={() => scoreboard.incrementScore(0)}>Score for Heim</button>
            </div>
          )
        }}
      </Scoreboard>,
    )

    expect(screen.getByLabelText('Home score')).toHaveTextContent('0')
    expect(screen.getByLabelText('Guest score')).toHaveTextContent('0')

    for (let point = 0; point < 21; point += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Score for Heim' }))
    }
    expect(model.homeScore).toBe(21)
    expect(model.guestScore).toBe(0)
    expect(model.gameHistory.map((game) => game.scores)).toEqual([[21, 0]])
  })

  it('starts at 0-0 with Heim and Gast', () => {
    render(<App />)

    expect(points()).toEqual(['0', '0'])
    expect(screen.getByText('Heim')).toBeInTheDocument()
    expect(screen.getByText('Gast')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo last action' })).toBeDisabled()
  })

  it('increments only the clicked side and undoes the last point', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(scoreTiles()[0])
    await user.click(scoreTiles()[1])
    expect(points()).toEqual(['1', '1'])

    await user.click(screen.getByRole('button', { name: 'Undo last action' }))
    expect(points()).toEqual(['1', '0'])
  })

  it('uses badminton set rules: two-point lead from 21 and a hard cap at 30', () => {
    const { unmount } = render(<App />)

    clickTile(0, 20)
    clickTile(1, 20)
    clickTile(0)
    expect(points()).toEqual(['21', '20'])
    expect(screen.queryByRole('button', { name: '2. Satz' })).not.toBeInTheDocument()

    clickTile(1)
    expect(points()).toEqual(['21', '21'])
    clickTile(0, 2)
    expect(points()).toEqual(['23', '21'])
    expect(screen.getByRole('button', { name: '2. Satz' })).toBeInTheDocument()

    unmount()
    render(<App />)
    for (let rally = 0; rally < 29; rally += 1) {
      clickTile(0)
      clickTile(1)
    }
    expect(points()).toEqual(['29', '29'])
    clickTile(0)
    expect(points()).toEqual(['30', '29'])
    expect(screen.getByRole('button', { name: '2. Satz' })).toBeInTheDocument()
  })

  it('switches sides between sets and keeps the completed game in history', () => {
    render(<App />)

    winGame(0)
    expect(matchScore()).toEqual(['1', '0'])
    expect(screen.getByLabelText('Scores of completed games')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: '2. Satz' }))
    expect(points()).toEqual(['0', '0'])
    expect(scoreTiles()[0]).toHaveAttribute('aria-label', 'Gast score: 0')
    expect(scoreTiles()[1]).toHaveAttribute('aria-label', 'Heim score: 0')
    expect(screen.queryByRole('button', { name: '3. Satz' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Scores of completed games')).toHaveTextContent('1')
  })

  it('automatically switches ends at 11 in the third set and can undo that switch', () => {
    render(<App />)

    winGame(0)
    fireEvent.click(screen.getByRole('button', { name: '2. Satz' }))
    winGame(0)
    fireEvent.click(screen.getByRole('button', { name: '3. Satz' }))

    clickTile(0, 10)
    expect(points()).toEqual(['10', '0'])
    clickTile(0)
    expect(points()).toEqual(['0', '11'])
    expect(scoreTiles()[0]).toHaveAttribute('aria-label', 'Gast score: 0')
    expect(scoreTiles()[1]).toHaveAttribute('aria-label', 'Heim score: 11')

    fireEvent.click(screen.getByRole('button', { name: 'Undo last action' }))
    expect(points()).toEqual(['10', '0'])
    expect(scoreTiles()[0]).toHaveAttribute('aria-label', 'Heim score: 10')
  })

  it('ends the match after two sets, and starts a fresh match with undo support', () => {
    render(<App />)

    winGame(0)
    fireEvent.click(screen.getByRole('button', { name: '2. Satz' }))
    winGame(1)

    expect(screen.getByRole('status')).toHaveTextContent('Match gewonnen: Heim')
    expect(screen.getByRole('button', { name: 'Neues Match' })).toBeInTheDocument()
    expect(scoreTiles().every((tile) => tile.disabled)).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Neues Match' }))
    expect(points()).toEqual(['0', '0'])
    expect(matchScore()).toEqual(['0', '0'])
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Scores of completed games')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Undo last action' }))
    expect(matchScore()).toEqual(['0', '2'])
    expect(screen.getByRole('status')).toHaveTextContent('Match gewonnen: Heim')
  })

  it('edits team labels and displays the selected discipline in settings', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    const dialog = screen.getByRole('dialog', { name: 'Einstellungen' })
    await user.clear(within(dialog).getByRole('textbox', { name: 'Heim' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Heim' }), 'Team A')
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Disziplin' }), 'MX')

    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(document.querySelector('.match-discipline')).toHaveTextContent('MX')

    await user.click(screen.getByRole('button', { name: 'Einstellungen schließen' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not score on the outside click that closes settings', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(scoreTiles()[0])

    expect(points()).toEqual(['0', '0'])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps settings open when cancelling the reset confirmation', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Spielstand und Historie zurücksetzen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))

    expect(screen.getByRole('dialog', { name: 'Einstellungen' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Reset bestätigen' })).not.toBeInTheDocument()
  })

  it('enters and exits browser fullscreen from the fullscreen control', async () => {
    const user = userEvent.setup()
    const originalRequestFullscreen = Object.getOwnPropertyDescriptor(
      document.documentElement,
      'requestFullscreen',
    )
    const originalExitFullscreen = Object.getOwnPropertyDescriptor(document, 'exitFullscreen')
    const originalFullscreenElement = Object.getOwnPropertyDescriptor(document, 'fullscreenElement')
    const requestFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.documentElement,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    const exitFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    })
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    })

    try {
      render(<App />)

      await user.click(screen.getByRole('button', { name: 'Vollbild aktivieren' }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Vollbild verlassen' })).toHaveAttribute(
          'aria-pressed',
          'true',
        ),
      )
      expect(requestFullscreen).toHaveBeenCalledOnce()

      await user.click(screen.getByRole('button', { name: 'Vollbild verlassen' }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Vollbild aktivieren' })).toHaveAttribute(
          'aria-pressed',
          'false',
        ),
      )
      expect(exitFullscreen).toHaveBeenCalledOnce()
    } finally {
      if (originalRequestFullscreen) {
        Object.defineProperty(document.documentElement, 'requestFullscreen', originalRequestFullscreen)
      } else {
        Reflect.deleteProperty(document.documentElement, 'requestFullscreen')
      }
      if (originalExitFullscreen) {
        Object.defineProperty(document, 'exitFullscreen', originalExitFullscreen)
      } else {
        Reflect.deleteProperty(document, 'exitFullscreen')
      }
      if (originalFullscreenElement) {
        Object.defineProperty(document, 'fullscreenElement', originalFullscreenElement)
      } else {
        Reflect.deleteProperty(document, 'fullscreenElement')
      }
    }
  })

  it('requires reset confirmation, resets score and history, and supports undo', () => {
    render(<App />)

    clickTile(0)
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Spielstand und Historie zurücksetzen' }))

    expect(points()).toEqual(['1', '0'])
    expect(screen.getByRole('group', { name: 'Reset bestätigen' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(points()).toEqual(['1', '0'])

    fireEvent.click(screen.getByRole('button', { name: 'Spielstand und Historie zurücksetzen' }))
    fireEvent.click(screen.getByRole('button', { name: /^Zurücksetzen$/ }))
    expect(points()).toEqual(['0', '0'])
    expect(matchScore()).toEqual(['0', '0'])
    expect(screen.queryByLabelText('Scores of completed games')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Undo last action' }))
    expect(points()).toEqual(['1', '0'])
  })
})
