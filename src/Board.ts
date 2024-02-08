type Difficulty = {
  size: number
  mines: number
  clear: number
}

type Vector = {
  x: number
  y: number
}

const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement
const timerDisplay = document.getElementById('timer') as HTMLParagraphElement
const flagsDisplay = document.getElementById('flags') as HTMLParagraphElement

const BOMB = '&#128163;'//'&#9899;'//'<span class="material-symbols-rounded">bomb</span>'
const FLAG = '&#128681;'//'<span class="material-symbols-rounded">flag</span>'

function vectorDistanceLazy(v1: Vector, v2: Vector) {
  return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y)
}

function timerBackground(percentage: number): string {
  const n = (percentage * 100).toFixed(2)
  return `linear-gradient(90deg, var(--color-timer) ${n}%, var(--color-background) ${n}%)`
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
  // return `${seconds.toString()}.${(milliseconds).toString().padStart(3, '0')}`
}

export default class Board {
  private difficulty: Difficulty
  private div: HTMLDivElement

  public reveals: Vector[] = []
  public flags: Vector[] = []
  public mines: Vector[] = []
  public safezone: Vector[] = [] // determines by difficulty clear distance

  private firstReveal: Vector | null = null

  public startTime: number | null = null
  public endTime: number | null = null
  public playing = false
  public gameover = false
  public explosion: Vector | null = null

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty
    this.div = document.getElementById('board') as HTMLDivElement

    this.div.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })

    setInterval(() => {
      if (this.playing) {
        if (this.endTime !== null) {
          const difference = this.endTime - this.startTime!
          timerDisplay.innerHTML = `CLEARED IN ${formatTime(difference)}`
        }

        timerDisplay.innerHTML = `${formatTime((Date.now() - this.startTime!))}`
      }
    }, 10)
  }

  public get size() { return this.difficulty.size }
  public get mineCount() { return this.difficulty.mines }
  public get clearDistance() { return this.difficulty.clear }
  public get flagCount() { return this.flags.length }
  public get revealCount() { return this.reveals.length }
  public get hiddenCount() { return this.size ** 2 - this.revealCount }

  private isMine(x: number, y: number) { return this.mines.some(mine => mine.x === x && mine.y === y) }
  private isFlag(x: number, y: number) { return this.flags.some(flag => flag.x === x && flag.y === y) }
  private isRevealed(x: number, y: number) { return this.reveals.some(reveal => reveal.x === x && reveal.y === y) }
  private isOutOfRange(x: number, y: number) { return x < 0 || y < 0 || x >= this.size || y >= this.size }

  private countSurroundingMines(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return -1

    let count = this.mines.filter(mine => Math.abs(mine.x - x) <= 1 && Math.abs(mine.y - y) <= 1).length

    return count
  }

  private countSurroundingFlags(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return -1

    let count = this.flags.filter(flag => Math.abs(flag.x - x) <= 1 && Math.abs(flag.y - y) <= 1).length

    return count
  }

  private countSurroundingHidden(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return -1

    let count = 0

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (this.isRevealed(x + i, y + j)) continue
        if (this.isOutOfRange(x + i, y + j)) continue
        count++
      }
    }

    return count
  }

  private spawnMine() {
    if (this.firstReveal === null) return

    if (this.mines.length === this.mineCount) return
    if (this.mines.length === this.size ** 2) return

    const x = Math.floor(Math.random() * this.size)
    const y = Math.floor(Math.random() * this.size)

    if (this.isMine(x, y) || vectorDistanceLazy(this.firstReveal, { x, y }) <= this.clearDistance) {
      this.spawnMine()
    } else {
      this.mines.push({ x, y })
    }
  }

  public reset() {
    this.reveals = []
    this.mines = []
    this.flags = []
    this.gameover = false
    this.explosion = null
    this.startTime = null
    this.playing = false
    this.firstReveal = null
    this.div.innerHTML = ''
    timerDisplay.innerHTML = '0:00.000'
    flagsDisplay.innerHTML = '0 / 0 flags'
    difficultySelect.disabled = false
    timerDisplay.style.background = timerBackground(0)
  }

  public changeDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty
  }

  public create() {
    this.reveals = []
    this.mines = []
    this.flags = []

    this.div.innerHTML = ''

    this.div.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`
    this.div.style.gridTemplateRows = `repeat(${this.size}, 1fr)`
    this.div.style.fontSize = `${36 / this.size}cqb`

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.row = i.toString()
        cell.dataset.col = j.toString()
        cell.addEventListener('click', () => this.reveal(i, j))
        cell.addEventListener('contextmenu', () => this.flag(i, j))
        this.div.appendChild(cell)
      }
    }

    timerDisplay.innerHTML = '0:00.000'
    flagsDisplay.innerHTML = `0 / ${this.mineCount} flags`
  }

  public generate() {
    this.create()

    for (let i = 0; i < this.mineCount; i++) {
      this.spawnMine()
    }

    this.draw()
  }

  public click(x: number, y: number) {
    if (this.isRevealed(x, y)) {
      this.chord(x, y)
    } else {
      this.reveal(x, y)
    }
  }

  public reveal(x: number, y: number) {
    if (this.isRevealed(x, y)) return
    if (this.isFlag(x, y)) return
    if (this.gameover) return
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return

    if (this.revealCount === 0) {
      this.startTime = Date.now()
      this.playing = true
      this.firstReveal = { x, y }
      this.generate()

      difficultySelect.disabled = true
    }

    if (this.reveals.includes({ x, y })) return
    this.reveals.push({ x, y })

    if (this.isMine(x, y)) {
      this.gameover = true
      this.playing = false
      this.endTime = Date.now()
      this.explosion = { x, y }
    } else {
      let count = this.countSurroundingMines(x, y)

      if (count === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue
            if (this.isRevealed(x + i, y + j) || this.isFlag(x + i, y + j)) continue
            this.reveal(x + i, y + j)
          }
        }
      }
    }

    if (this.hiddenCount === this.mineCount) {
      // flag all remaining cells
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (this.isMine(i, j) && !this.isFlag(i, j)) {
            this.flags.push({ x: i, y: j })
          }
        }
      }

      this.gameover = true
      this.playing = false
      this.endTime = Date.now()
      flagsDisplay.innerHTML = `${this.flagCount} / ${this.mineCount} flags`
      timerDisplay.style.background = timerBackground(this.flagCount / this.mineCount)
    }

    this.draw()
  }

  public chord(x: number, y: number) {
    if (this.gameover) return
    if (this.revealCount === 0) return
    if (this.isOutOfRange(x, y)) return

    if (this.isRevealed(x, y)) {
      let mines = this.countSurroundingMines(x, y)
      let flags = this.countSurroundingFlags(x, y)
      let hidden = this.countSurroundingHidden(x, y)

      // reveal all surrounding cells if the number of flags matches the number of mines
      if (mines === flags) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            this.reveal(x + i, y + j)
          }
        }
      }

      // flag all surrounding cells if the number of hidden cells matches the number of flags
      if (mines > 0 && hidden === mines) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (!this.isRevealed(x + i, y + j) && !this.isFlag(x + i, y + j) && !this.isOutOfRange(x + i, y + j)) {
              if (!this.flags.includes({ x: x + i, y: y + j })) {
                this.flags.push({ x: x + i, y: y + j })
              }
            }
          }
        }

        // bugfix: remove duplicate flags
        this.flags = [...new Set(this.flags)]

        timerDisplay.style.background = timerBackground(this.flagCount / this.mineCount)
        flagsDisplay.innerHTML = `${this.flagCount} / ${this.mineCount} flags`

        if (this.flagCount === this.mineCount) {
          if (this.mines.every(mine => this.isFlag(mine.x, mine.y))) {
            this.gameover = true
            this.playing = false
            this.endTime = Date.now()
          }
        }

        this.draw()
      }
    }
  }

  public flag(x: number, y: number) {
    if (this.isOutOfRange(x, y)) return

    if (this.revealCount === 0) {
      this.reveal(x, y)
      return
    }

    if (this.isRevealed(x, y)) {
      this.chord(x, y)
      return
    }

    if (this.gameover) return

    if (this.flagCount === this.mineCount && !this.isFlag(x, y)) return

    if (this.isFlag(x, y)) {
      const index = this.flags.findIndex(flag => flag.x === x && flag.y === y)
      this.flags = this.flags.filter((_, i) => i !== index)
    } else {
      this.flags.push({ x, y })
    }

    timerDisplay.style.background = timerBackground(this.flagCount / this.mineCount)
    flagsDisplay.innerHTML = `${this.flagCount} / ${this.mineCount} flags`

    if (this.flagCount === this.mineCount) {
      if (this.mines.every(mine => this.isFlag(mine.x, mine.y))) {
        this.gameover = true
        this.playing = false
        this.endTime = Date.now()
      }
    }

    this.draw()
  }

  // public cheat() {
  //   this.flags = []

  //   for (let i = 0; i < this.size; i++) {
  //     for (let j = 0; j < this.size; j++) {
  //       if (this.isMine(i, j)) {
  //         this.flags.push({ x: i, y: j })
  //       } else {
  //         this.reveal(i, j)
  //       }
  //     }
  //   }

  //   this.gameover = true
  //   this.playing = false
  //   this.endTime = Date.now()

  //   this.draw()
  // }

  public draw() {
    this.div.innerHTML = ''

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.row = i.toString()
        cell.dataset.col = j.toString()
        cell.addEventListener('click', () => this.click(i, j))
        cell.addEventListener('contextmenu', () => this.flag(i, j))
        // mobile controls: hold to flag
        cell.addEventListener('pointerdown', (event) => {
          if (event.button === 2) return

          const flagged = this.isFlag(i, j)

          let timeout = setTimeout(() => {
            this.flag(i, j)
          }, 350)

          cell.addEventListener('pointerup', () => {
            clearTimeout(timeout)

            if (flagged && !this.isFlag(i, j) || !flagged && this.isFlag(i, j)) {
              this.flag(i, j)
            }
          })
        })
        this.div.appendChild(cell)

        if (this.isRevealed(i, j)) {
          cell.classList.add('reveal')

          let count = this.mines.filter(mine => Math.abs(mine.x - i) <= 1 && Math.abs(mine.y - j) <= 1).length

          if (count > 0 && !this.isMine(i, j)) {
            cell.innerText = count.toString()

            switch (count) {
              case 1: cell.classList.add('one'); break
              case 2: cell.classList.add('two'); break
              case 3: cell.classList.add('three'); break
              case 4: cell.classList.add('four'); break
              case 5: cell.classList.add('five'); break
              case 6: cell.classList.add('six'); break
              case 7: cell.classList.add('seven'); break
              case 8: cell.classList.add('eight'); break
            }
          }
        }

        if (this.isFlag(i, j)) {
          cell.classList.add('flag')
          cell.innerHTML = FLAG
        }

        if (this.explosion && this.explosion.x === i && this.explosion.y === j) {
          cell.classList.add('explosion')
        }

        if (this.gameover) {
          if (this.isMine(i, j) && !this.isFlag(i, j)) {
            cell.classList.add('mine')
            cell.innerHTML = BOMB
          }

          if (!this.isMine(i, j) && this.isFlag(i, j)) {
            cell.classList.add('wrong')
          }

          if (this.isMine(i, j) && this.isFlag(i, j)) {
            cell.classList.add('right')
          }
        }
      }
    }
  }
}
