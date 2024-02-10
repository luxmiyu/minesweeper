import './reset.css'
import './common.sass'
import './style.sass'
import './theme.ts'

import Board from './classes/Board'
import Difficulty from './classes/Difficulty'

const flagmode = document.getElementById('flagmode') as HTMLButtonElement
const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement
const resetButton = document.getElementById('reset') as HTMLButtonElement
// const boardContainer = document.getElementById('board-container') as HTMLDivElement
const boardDisplay = document.getElementById('board') as HTMLDivElement

const difficulties: Difficulty[] = [
  new Difficulty('easy',     9,  10, 1),
  new Difficulty('normal',  11,  20, 1),
  new Difficulty('hard',    15,  40, 2),
  new Difficulty('insane',  23, 100, 2),
  new Difficulty('expert',  33, 210, 2),
  new Difficulty('master',  45, 420, 3),
  new Difficulty('extreme', 59, 727, 3),
  new Difficulty('suicide', 99, 2048, 3),
]

difficulties.forEach(difficulty => {
  let element = document.createElement('option')
  element.value = difficulty.name
  element.innerHTML = difficulty.toString()
  difficultySelect.appendChild(element)
})

const board = new Board(boardDisplay, difficulties[0])

// ----------------------------------------------------- Event Listeners -----------------------------------------------------

function resetBoard() {
  board.initialize()

  // reset flagmode button
  toggleFlagmode()
  toggleFlagmode()
}

function flagmodeOn() {
  flagmode.classList.remove('win', 'lose')

  flagmode.innerHTML = 'FLAG MODE ON'
  flagmode.classList.add('on')
  flagmode.dataset.flagmode = 'true'
}

function flagmodeOff() {
  flagmode.classList.remove('win', 'lose')

  flagmode.innerHTML = 'FLAG MODE OFF'
  flagmode.classList.remove('on')
  flagmode.dataset.flagmode = 'false'
}

function toggleFlagmode() {
  if (board.status === 'won' || board.status === 'lost') return

  if (flagmode.dataset.flagmode === 'true') {
    flagmodeOff()
  } else {
    flagmodeOn()
  }
}

difficultySelect.addEventListener('change', () => {
  const difficulty = difficulties.find(difficulty => difficulty.name === difficultySelect.value)
  if (difficulty) {
    board.initialize(difficulty)

    // reset flagmode button
    toggleFlagmode()
    toggleFlagmode()
  }
})

flagmode.addEventListener('click', toggleFlagmode)
resetButton.addEventListener('click', resetBoard)

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF') {
    toggleFlagmode()
  }

  if (event.code === 'KeyR') {
    resetBoard()
  }

  if (event.code.startsWith('Digit') && event.code.length === 6) {
    const index = parseInt(event.code[5]) - 1
    if (index >= 0 && index < difficulties.length) {
      difficultySelect.value = difficulties[index].name
      board.initialize(difficulties[index])
    }
  }
})
