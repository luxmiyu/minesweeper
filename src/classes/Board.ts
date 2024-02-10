import Cell from './Cell'
import type Difficulty from './Difficulty'

const timerDisplay = document.getElementById('timer') as HTMLParagraphElement
const flagsDisplay = document.getElementById('flags') as HTMLParagraphElement
const flagmode = document.getElementById('flagmode') as HTMLButtonElement

function distanceLazy(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2))
}

function formatTime(ms: number): string {
  let milliseconds = ms
  let seconds = Math.floor(milliseconds / 1000)
  milliseconds = milliseconds % 1000
  let minutes = Math.floor(seconds / 60)
  seconds = seconds % 60
  let hours = Math.floor(minutes / 60)
  minutes = minutes % 60

  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${(milliseconds).toString().padStart(3, '0')}`
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${(milliseconds).toString().padStart(3, '0')}`
}

type Status = 'waiting' | 'ongoing' | 'won' | 'lost'

export default class Board {
  private difficulty: Difficulty

  private cells: Cell[][]
  private element: HTMLDivElement

  private startTime: number | null
  private endTime: number | null
  
  public status: Status

  constructor(div: HTMLDivElement, difficulty: Difficulty) {
    this.difficulty = difficulty

    this.cells = []
    this.element = div

    this.startTime = null
    this.endTime = null

    this.status = 'waiting'

    this.initialize()

    setInterval(this.updateTimer.bind(this), 10)
  }

  public get difficultyName(): string { return this.difficulty.name }
  public get size(): number { return this.difficulty.size }
  public get totalMines(): number { return this.difficulty.mines }
  public get clearDistance(): number { return this.difficulty.clear }

  private updateTimer(): void {
    if (this.status === 'ongoing') {
      const now = Date.now()
      const elapsed = now - (this.startTime || now)

      timerDisplay.innerHTML = formatTime(elapsed)
    } else if (this.status === 'waiting') {
      timerDisplay.innerHTML = formatTime(0)
    } else {
      timerDisplay.innerHTML = formatTime(this.endTime! - this.startTime!)
    }
  }

  private updateTimerBackground(percentage: number): void {
    const n = (percentage * 100).toFixed(2)
    timerDisplay.style.background = `linear-gradient(90deg, var(--color-timer) ${n}%, var(--color-background) ${n}%)`
  }

  private updateFlagDisplay(): void {
    const flags = this.getAllFlags().length
    const mines = this.totalMines
    const percentage = flags / mines

    flagsDisplay.innerHTML = `${flags} / ${mines} flags`

    this.updateTimerBackground(percentage)
  }

  private getCell(x: number, y: number): Cell {
    return this.cells[y][x]
  }

  private getAllCells(): Cell[] {
    return this.cells.flat()
  }

  private getAllNeighbors(x: number, y: number): Cell[] {
    const neighbors = []

    for (let ny = -1; ny <= 1; ny++) {
      for (let nx = -1; nx <= 1; nx++) {
        if (nx === 0 && ny === 0) continue

        const cx = x + nx
        const cy = y + ny

        if (this.isOutOfBounds(cx, cy)) continue

        neighbors.push(this.getCell(cx, cy))
      }
    }

    return neighbors
  }

  private getAllUnrevealed(): Cell[] {
    return this.getAllCells().filter(cell => !cell.revealed)
  }

  private getAllMines(): Cell[] {
    return this.getAllCells().filter(cell => cell.mine)
  }

  private getAllFlags(): Cell[] {
    return this.getAllCells().filter(cell => cell.flagged)
  }

  private judgeAllFlags(): void {
    this.getAllFlags().forEach(flag => flag.judge())
  }

  private countNeighbors(x: number, y: number, condition: (cell: Cell) => boolean): number {
    let count = 0

    for (let ny = -1; ny <= 1; ny++) {
      for (let nx = -1; nx <= 1; nx++) {
        if (nx === 0 && ny === 0) continue

        const cx = x + nx
        const cy = y + ny

        if (this.isOutOfBounds(cx, cy)) continue

        if (condition(this.getCell(cx, cy))) count++
      }
    }

    return count
  }

  public initialize(difficulty?: Difficulty): void {
    if (difficulty) {
      this.difficulty = difficulty
    }

    this.status = 'waiting'

    this.element.innerHTML = ''

    this.element.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`
    this.element.style.gridTemplateRows = `repeat(${this.size}, 1fr)`
    this.element.style.fontSize = `${36 / this.size}cqb`
    
    this.cells = []

    this.startTime = null
    this.endTime = null

    for (let y = 0; y < this.size; y++) {
      this.cells[y] = []

      for (let x = 0; x < this.size; x++) {
        const cell = new Cell(x, y, this.onReveal.bind(this), this.onFlag.bind(this))
        this.cells[y][x] = cell
        this.element.appendChild(cell.element)
      }
    }
  }

  public isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= this.size || y >= this.size
  }

  private updateCounts(): void {
    const cells = this.getAllCells()

    cells.forEach(cell => {
      if (cell.mine) return
      
      cell.count = this.countNeighbors(cell.x, cell.y, neighbor => neighbor.mine)
    })
  }

  private generateMines(x: number, y: number): void {
    let remaining = this.totalMines

    while (remaining > 0) {
      const rx = Math.floor(Math.random() * this.size)
      const ry = Math.floor(Math.random() * this.size)

      if (distanceLazy(x, y, rx, ry) <= this.clearDistance) continue
      if (this.getCell(rx, ry).mine) continue

      this.getCell(rx, ry).setMine()
      remaining--
    }

    this.updateCounts()
  }

  private checkWin(): void {
    const unrevealed = this.getAllUnrevealed()
    const mines = this.getAllMines()

    const allMinesFlagged = mines.every(mine => mine.flagged)
    const allUnrevealMines = unrevealed.every(cell => cell.mine)

    if (allMinesFlagged || allUnrevealMines) {
      this.win()
    }
  }

  private win() {
    this.status = 'won'
    this.getAllMines().forEach(mine => mine.flag())
    this.judgeAllFlags()

    this.endTime = Date.now()
    this.updateTimer()

    flagmode.classList.add('win')
    flagmode.innerText = 'CLEAR!'
  }

  private lose(x: number, y: number): void {
    this.status = 'lost'
    this.getAllMines().forEach(mine => mine.reveal())
    this.getCell(x, y).explode()
    this.judgeAllFlags()

    this.endTime = Date.now()
    this.updateTimer()

    flagmode.classList.add('lose')
    flagmode.innerText = 'GAME OVER'
  }

  private onReveal(x: number, y: number): void {
    if (this.status === 'waiting') {
      this.status = 'ongoing'
      this.generateMines(x, y)

      this.startTime = Date.now()
    }

    if (this.status !== 'ongoing') return

    const cell = this.getCell(x, y)

    if (cell.revealed) {
      // attempt smart reveal and flagging

      const flags = this.countNeighbors(x, y, neighbor => neighbor.flagged)
      const hidden = this.countNeighbors(x, y, neighbor => !neighbor.revealed)

      if (flags === cell.count) {
        const neighbors = this.getAllNeighbors(x, y)

        neighbors.forEach(neighbor => {
          if (!neighbor.revealed && !neighbor.flagged) {
            this.onReveal(neighbor.x, neighbor.y)
          }
        })
      }

      if (hidden === cell.count) {
        const neighbors = this.getAllNeighbors(x, y)

        neighbors.forEach(neighbor => {
          if (!neighbor.flagged) {
            neighbor.flag()
          }
        })
      }
    } else if (!cell.flagged) {
      // reveal cell if not flagged

      if (cell.mine) {
        this.lose(x, y)
        return
      }

      cell.reveal()

      if (cell.count === 0) {
        const neighbors = this.getAllNeighbors(x, y)

        neighbors.forEach(neighbor => {
          if (!neighbor.revealed) {
            this.onReveal(neighbor.x, neighbor.y)
          }
        })
      }
    }

    this.checkWin()
    this.updateFlagDisplay()
  }

  private onFlag(x: number, y: number): void {
    if (this.status === 'waiting') {
      this.onReveal(x, y)
      return
    }

    if (this.status !== 'ongoing') return

    const cell = this.getCell(x, y)

    if (cell.revealed) {
      this.onReveal(x, y)
      return
    }

    if (cell.flagged) {
      cell.unflag()
    } else {
      cell.flag()
    }

    this.checkWin()
    this.updateFlagDisplay()
  }
}
