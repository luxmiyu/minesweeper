function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default class Difficulty {
  public name: string
  public size: number
  public mines: number
  public clear: number

  constructor(name: string, size: number, mines: number, clear: number) {
    this.name = name
    this.size = size
    this.mines = mines
    this.clear = clear
  }

  public get density(): number {
    return this.mines / (this.size ** 2)
  }

  public get densityPercentage(): string {
    return `${(this.density * 100).toFixed(2)}%`
  }

  public toString(): string {
    return `${capitalizeFirstLetter(this.name)} (${this.mines} mines)`
  }
}
