interface Color {
  name: string
  dark: string
  light: string
}

const colors: Color[] = [
  { dark: 'eaeaea', light: '2a2a2a', name: 'text' },
  { dark: 'bababa', light: '5a5a5a', name: 'text-secondary' },
  { dark: 'cd435c', light: 'e86880', name: 'selection' },
  { dark: 'eaeaea', light: '2a2a2a', name: 'selection-text' },
  { dark: '1a1a1a', light: 'eaeaea', name: 'background' },
  { dark: '222222', light: 'dedede', name: 'background-accent' },
  { dark: '3a3a3a', light: 'd2d2d2', name: 'shadow' },
  { dark: '8a8a8a', light: '8a8a8a', name: 'hr' },
  { dark: '2a2a2a', light: 'd8d8d8', name: 'button' },
  { dark: 'bababa', light: '5a5a5a', name: 'button-border' },
  { dark: '3a3a3a', light: 'eaeaea', name: 'button-hover' },
  { dark: '5a5a5a', light: 'fafafa', name: 'button-active' },
  { dark: '8a8a8a', light: 'fafafa', name: 'button-disabled' },
  { dark: '2a2a2a', light: 'd8d8d8', name: 'input' },
  { dark: '5a5a5a', light: '8a8a8a', name: 'input-border' },
  { dark: 'eaeaea', light: '5a5a5a', name: 'scrollbar-thumb' },
  { dark: '1a1a1a', light: 'eaeaea', name: 'scrollbar-track' },
  { dark: 'bababa', light: 'eaeaea', name: 'range' },
  { dark: '3a3a3a', light: 'aaaaaa', name: 'range-border' },
  { dark: '3a3a3a', light: 'aaaaaa', name: 'range-background' },
  { dark: 'e26f80', light: 'f4899d', name: 'checkbox-background' },

  { dark: '6dacff', light: '6dacff', name: 'timer' },
  { dark: 'eeb456', light: 'efbf73', name: 'algorithm' },
  
  { dark: 'bababa', light: 'bebebe', name: 'cell' },
  { dark: 'bababa', light: 'bebebe', name: 'mine' },
  { dark: 'bababa', light: 'bebebe', name: 'flag' },
  { dark: '3a3a3a', light: 'dddddd', name: 'reveal' },
  { dark: 'cd435c', light: 'e86880', name: 'explosion' },
  { dark: '3a3a3a', light: 'dddddd', name: 'wrong' },
  { dark: '5cd778', light: '5cd778', name: 'right' },
  { dark: '75a6e5', light: '6dacff', name: 'flagmode' },

  { dark: '6dacff', light: '0012f4', name: 'one' },
  { dark: '44a159', light: '007c1b', name: 'two' },
  { dark: 'f7574a', light: 'ff1e0e', name: 'three' },
  { dark: '7765c2', light: '00057c', name: 'four' },
  { dark: 'aa5e5c', light: '850a05', name: 'five' },
  { dark: '54aeac', light: '00807f', name: 'six' },
  { dark: '707070', light: '000000', name: 'seven' },
  { dark: 'cacaca', light: '808080', name: 'eight' },
]

const buttonThemeToggle = document.getElementById('theme-toggle')

if (buttonThemeToggle) {
  buttonThemeToggle.addEventListener('click', () => {
    toggleTheme()
  })
}

// when the user presses alt + t, toggle the theme
document.addEventListener('keydown', (event) => {
  if (event.altKey && event.key === 'l') {
    toggleTheme()
  }
})

function toggleTheme() {
  localStorage.setItem('theme', localStorage.getItem('theme') === 'dark' ? 'light' : 'dark')

  updateTheme()
}

let currentTheme = ''

function updateTheme() {
  // default to dark unless it's already set to light
  let theme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  localStorage.setItem('theme', theme)

  if (buttonThemeToggle) {
    if (theme === 'dark') {
      buttonThemeToggle.innerHTML = 'switch to light theme 🌞'
    } else {
      buttonThemeToggle.innerHTML = 'switch to dark theme 🌚'
    }
  }

  for (let color in colors) {
    let colorName = colors[color].name
    let colorValue = colors[color][theme as 'dark' | 'light']
    document.documentElement.style.setProperty(`--color-${colorName}`, `#${colorValue}`)
  }

  currentTheme = theme
}

updateTheme()

setInterval(() => {
  if (currentTheme !== localStorage.getItem('theme')) {
    updateTheme()
  }
}, 500)

export {}
