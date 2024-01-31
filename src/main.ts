import './reset.css'
import './common.sass'
import './style.sass'
import './theme.ts'

let count = 0

const button = document.getElementById('counter')
const label = document.getElementById('counter-label')

if (button) button.addEventListener('click', () => {
  count++
  if (label) label.innerHTML = `a button you\'ve pressed ${count === 1 ? `1 time` : `${count} times`}`
})
