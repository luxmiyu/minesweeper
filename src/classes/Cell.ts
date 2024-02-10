const BOMB = '&#128163;'
const FLAG = '&#128681;'

const flagmode = document.getElementById('flagmode') as HTMLButtonElement

function getFlagMode() {
  return flagmode.dataset.flagmode === 'true'
}

export default class Cell {
  public x: number
  public y: number

  public mine: boolean
  public revealed: boolean
  public flagged: boolean
  public count: number

  public element: HTMLDivElement

  constructor(x: number, y: number, onReveal: (x: number, y: number) => void, onFlag: (x: number, y: number) => void) {
    this.x = x
    this.y = y

    this.mine = false
    this.revealed = false
    this.flagged = false
    this.count = 0

    this.element = document.createElement('div')
    this.element.classList.add('cell')
    this.element.innerHTML = ''

    this.element.addEventListener('click', () => {
      if (getFlagMode()) {
        onFlag(x, y)
      } else {
        onReveal(x, y)
      }
    })
    this.element.addEventListener('contextmenu' , (event) => {
      event.preventDefault()
      
      if (getFlagMode()) {
        onReveal(x, y)
      } else {
        onFlag(x, y)
      }
    })
  }

  public toString(): string { return `(${this.x}, ${this.y})` }

  public setMine(): void {
    this.mine = true
  }

  public reveal(): void {
    if (this.revealed || this.flagged) return

    this.revealed = true
    this.element.classList.add('revealed')
    
    if (this.mine) {
      this.element.innerHTML = BOMB
      this.element.classList.add('mine')
    } else if (this.count > 0) {
      this.element.innerHTML = this.count.toString()

      switch (this.count) {
        case 1: this.element.classList.add('one'); break
        case 2: this.element.classList.add('two'); break
        case 3: this.element.classList.add('three'); break
        case 4: this.element.classList.add('four'); break
        case 5: this.element.classList.add('five'); break
        case 6: this.element.classList.add('six'); break
        case 7: this.element.classList.add('seven'); break
        case 8: this.element.classList.add('eight'); break
      }
    }
  }

  public explode(): void {
    this.element.classList.add('explosion')
  }

  public hide(): void {
    if (!this.revealed) return

    this.revealed = false
    this.element.classList.remove('revealed')
    this.element.innerHTML = ''
  }

  public flag(): void {
    if (this.revealed || this.flagged) return

    this.flagged = true
    this.element.classList.add('flagged')
    this.element.innerHTML = FLAG
  }

  public unflag(): void {
    if (this.revealed || !this.flagged) return

    this.flagged = false
    this.element.classList.remove('flagged')
    this.element.innerHTML = ''
  }

  public judge(): void {
    this.element.classList.remove('right', 'wrong')

    if (this.flagged && this.mine) {
      this.element.classList.add('right')
    } else if (this.flagged && !this.mine) {
      this.element.classList.add('wrong')
    }
  }
}
