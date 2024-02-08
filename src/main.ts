import './reset.css'
import './common.sass'
import './style.sass'
import './theme.ts'

import Board from './Board'

const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement
const resetButton = document.getElementById('reset') as HTMLButtonElement

type Difficulty = {
  size: number
  mines: number
  clear: number
}

type DifficultyOption = {
  name: string
  difficulty: Difficulty
}

function diff(size: number, mines: number, clear: number): Difficulty {
  return { size, mines, clear }
}

const difficultyOptions: DifficultyOption[] = [
  { difficulty: diff( 9,  10, 2), name: 'easy' },
  { difficulty: diff(12,  24, 2), name: 'normal' },
  { difficulty: diff(16,  48, 2), name: 'hard' },
  { difficulty: diff(24,  99, 2), name: 'expert' },
  { difficulty: diff(32, 200, 3), name: 'extreme' },
]

difficultyOptions.forEach(option => {
  let element = document.createElement('option')
  element.value = option.name
  element.innerHTML = `${option.name.charAt(0).toLocaleUpperCase()}${option.name.slice(1)} (${option.difficulty.mines} mines)`
  difficultySelect.appendChild(element)
})

const board = new Board(difficultyOptions[0].difficulty)
board.create()

difficultySelect.addEventListener('change', () => {
  const selected = difficultyOptions.find(option => option.name === difficultySelect.value)

  if (selected) {
    board.changeDifficulty(selected.difficulty)
    if (!board.playing) {
      board.create()
    }
  }
})

resetButton.addEventListener('click', () => {
  board.reset()
  board.create()
  difficultySelect.disabled = false
})

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyR') {
    board.reset()
    board.create()
    difficultySelect.disabled = false
  }

  // if (event.code === 'KeyC') {
  //   board.cheat()
  // }

  // on pressing a number key, change the difficulty
  if (event.code.startsWith('Digit')) {
    if (board.startTime !== null) return

    let index = parseInt(event.code.slice(-1)) - 1

    if (index < difficultyOptions.length && index >= 0) {
      difficultySelect.value = difficultyOptions[index].name
      difficultySelect.dispatchEvent(new Event('change'))
    }
  }
})
