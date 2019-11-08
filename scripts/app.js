function main() {

  // VARIABLES ======================================================================================

  // HTML ELEMENTS
  const grid = document.querySelector('.grid')
  const scoreCounter = document.getElementById('score')
  const lifeCounter = document.getElementById('lives')
  const messageScreen = document.querySelector('.message')
  const countdown = document.getElementById('countdown')

  // GAME VARIABLES
  const width = 21
  let score
  let lives
  let cells = [] 
  let foodCount
  let frightened 
  let player
  let playerShadow = []
  let ghostHistories = []
  let ghostInterval
  let energizerTimeout
  let countdownInterval
  let countdownValue
  let nameForm

  // NON-GAME SCREENS ======================================================================================

  // STARTING SCREEN 
  const logo = document.createElement('img')
  logo.setAttribute('src', 'images/cat-logo.png')
  messageScreen.appendChild(logo)

  const button = document.createElement('button')
  button.innerHTML = 'Start game'
  button.addEventListener('click', countdownScreen)
  messageScreen.appendChild(button)

  // COUNTDOWN / INSTRUCTIONS SCREEN
  function countdownScreen() {
    score = 0
    scoreCounter.innerHTML = score
    lives = 3
    lifeCounter.innerHTML = lives

    messageScreen.innerHTML = ''

    let counter = 3
    const startCountdown = document.createElement('div')
    startCountdown.classList.add('startCountdown')
    startCountdown.innerHTML = counter
    messageScreen.appendChild(startCountdown)

    const instructions = document.createElement('img')
    instructions.setAttribute('src', 'images/instructions.png')
    messageScreen.appendChild(instructions)

    const starterInterval = setInterval(() => {
      counter -= 1
      startCountdown.innerHTML = counter
    }, 1000)

    setTimeout(() => {
      clearInterval(starterInterval)
      runGame()
    }, 3000)
  }

  // END GAME SCREEN
  function endGame(state) {

    // CLEAR VARIABLES
    clearInterval(ghostInterval)
    grid.innerHTML = '' 
    cells = []
    playerShadow = []

    grid.appendChild(messageScreen)

    // VICTORY SCREEN
    if (state === 'win') {
      messageScreen.innerHTML = `You won! Your score was ${score}.`

      const logo = document.createElement('img')
      logo.setAttribute('src', 'https://media.giphy.com/media/3iBcRAErFhFwoTVbN5/giphy.gif')
      messageScreen.appendChild(logo)

      nameForm = document.createElement('input')
      nameForm.setAttribute('type', 'text')
      nameForm.setAttribute('placeholder', 'Enter your name')
      messageScreen.appendChild(nameForm)

      const submitButton = document.createElement('button')
      submitButton.innerHTML = 'Submit'
      submitButton.addEventListener('click', getHighScores)
      messageScreen.appendChild(submitButton)


    // DEFEAT SCREEN
    } else if (state === 'lose') {
      messageScreen.innerHTML = `Game-over! Your score was ${score}.`

      const logo = document.createElement('img')
      logo.setAttribute('src', 'images/cat-defeat.png')
      messageScreen.appendChild(logo)

      const button = document.createElement('button')
      button.innerHTML = 'Play again'
      button.addEventListener('click', countdownScreen)
      messageScreen.appendChild(button)
    }
  }

  // LOCAL HIGH SCORES SCREEN
  function getHighScores() {
    const name = nameForm.value

    if (!localStorage.getItem('gameScores')) {
      const playersScores = []
      playersScores.push({ name, score })
      localStorage.setItem('gameScores', JSON.stringify(playersScores))

    } else {
      const playersScores = JSON.parse(localStorage.getItem('gameScores'))
      playersScores.push({ name, score })
      localStorage.setItem('gameScores', JSON.stringify(playersScores))
    }

    let scoresArray = JSON.parse(localStorage.getItem('gameScores'))
    scoresArray = scoresArray.sort(function(a, b) { return b.score - a.score } )

    scoresArray = scoresArray.slice(0, 10)

    messageScreen.innerHTML = ''

    const scoreBoard = document.createElement('div')
    scoreBoard.setAttribute('id', 'scoreboard')
    messageScreen.appendChild(scoreBoard)

    const scoreTitle = document.createElement('h2')
    scoreTitle.innerHTML = 'High Scores (locally)'
    scoreBoard.appendChild(scoreTitle)

    let spot = 0
    scoresArray.forEach(player => {

      spot++
      
      const place = document.createElement('div')
      place.classList.add('score')
      place.innerHTML = `${spot}. ${player.name}: ${player.score}`
      scoreBoard.appendChild(place)
    })

    const button = document.createElement('button')
    button.innerHTML = 'Play again'
    button.addEventListener('click', countdownScreen)
    messageScreen.appendChild(button)

    localStorage.setItem('gameScores', JSON.stringify(scoresArray))
  }

  // MISC USEFUL FUNCTIONS ======================================================================================

  // GET X AND Y COORDINATE OF ANY CELL
  function getXY(position) {
    const y = Math.floor(position / width) + 1
    const x = position % width + 1                                       

    return [x, y]
  }

  // CELL LOGIC (TO TRAVEL THROUGH EDGES OF THE BOARD)
  function getNeighbourCell(position, direction) {
    switch (direction) {
      case 'up': return position < width ? position + (width * (width - 1)) : position - width
      case 'right': return (position - (width - 1 )) % width === 0 ? position - (width - 1) : position + 1
      case 'down': return position > (width * (width - 1)) - 1 ? position - (width * (width - 1)) : position + width
      case 'left' : return position % width === 0 ? position + (width - 1) : position - 1
    }
  }

  // GHOST MOVEMENT ======================================================================================

  function moveGhost(ghostHistory) {

    let ghostOptions = [getNeighbourCell(ghostHistory[0], 'up'), getNeighbourCell(ghostHistory[0], 'right'), getNeighbourCell(ghostHistory[0], 'down'), getNeighbourCell(ghostHistory[0], 'left')]

    // DISCARD WALLS AND PREVIOUS LOCATION
    ghostOptions = ghostOptions.filter((option) => {
      return !(cells[option].classList.contains('wall') || option === ghostHistory[1])
    })

    // SET NEW POSITION
    let newGhost = 0
    if (ghostOptions.length > 1) {

      let minDistance = 30 // theoretical maximum
      let maxDistance = 0 // theoretical minimum

      const distances = ghostOptions.map((cell) => {

        const playerXY = getXY(player)
        const newGhostXY = getXY(cell)

        const distance = Math.sqrt((playerXY[0] - newGhostXY[0]) ** 2 + (playerXY[1] - newGhostXY[1]) ** 2)

        distance < minDistance ? minDistance = distance : minDistance
        distance > maxDistance ? maxDistance = distance : maxDistance

        return distance
      })

      if (!frightened) {
        newGhost = distances.indexOf(minDistance)
      } else {
        newGhost = distances.indexOf(maxDistance)
      }
    }

    // OTHER GHOST COLLISION
    if (cells[ghostOptions[newGhost]].classList.contains('ghost')) {
      ghostHistory = ghostHistory.reverse()
    } else {
      ghostHistory = [ghostOptions[newGhost], ghostHistory[0]]
    }
    cells[ghostHistory[1]].classList.remove('ghost')
    cells[ghostHistory[0]].classList.add('ghost')

    // COLLISION WITH PLAYER
    if (cells[ghostHistory[0]].classList.contains('player') || playerShadow.includes(ghostHistory[0])) {
      ghostHistory = collideWithGhost(ghostHistory)
    } 

    return ghostHistory
  }

  // PLAYER MOVEMENT ======================================================================================

  function movePlayer(cellIndex) {

    const newPosition = cells[cellIndex]

    // DO NOTHING IF MOVING INTO WALL OR GHOST PEN
    if (newPosition.classList.contains('wall') || newPosition.classList.contains('ghostpen')) {
      return player

    } else {

      // FOOD
      if (newPosition.classList.contains('food')) {
        newPosition.classList.remove('food')
        score += 1
        foodCount -= 1
        scoreCounter.innerHTML = score

        if (foodCount === 0) {
          endGame('win')
        }

      // GHOST
      } else if (newPosition.classList.contains('ghost')) {
        for (let i = 0; i < 4; i++) {
          if (ghostHistories[i].includes(player)) {
            ghostHistories[i] = collideWithGhost(ghostHistories[i])
          }
        }
        
      // ENERGIZER
      } else if (newPosition.classList.contains('energizer')) {
        newPosition.classList.remove('energizer')
        energize()
      }

      return cellIndex
    }
  }

  document.addEventListener('keydown', e => {

    switch (e.key) {

      case 'w': {
        const cellIndex = getNeighbourCell(player, 'up')
        cells[player].classList.remove('player', 'up', 'right', 'down', 'left')     
        player = movePlayer(cellIndex)
        cells[player].classList.add('player', 'up')
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        break
      }

      case 'd': {
        const cellIndex = getNeighbourCell(player, 'right')
        cells[player].classList.remove('player', 'up', 'right', 'down', 'left')     
        player = movePlayer(cellIndex)
        cells[player].classList.add('player', 'right')    
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        break
      }

      case 's': {
        const cellIndex = getNeighbourCell(player, 'down')
        cells[player].classList.remove('player', 'up', 'right', 'down', 'left')     
        player = movePlayer(cellIndex)
        cells[player].classList.add('player', 'down') 
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        break
      } 

      case 'a': {
        const cellIndex = getNeighbourCell(player, 'left')
        cells[player].classList.remove('player', 'up', 'right', 'down', 'left')     
        player = movePlayer(cellIndex)
        cells[player].classList.add('player', 'left')    
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        break
      }
    }
  })

  // GAME MECHANICS ======================================================================================

  // ENERGIZE
  function energize() {

    countdownValue = 10
    countdown.innerHTML = countdownValue

    // IF NOT FRIGHTENED ALREADY
    if (frightened === false ) {
      frightened = true

      cells.forEach((cell) => {
        cell.classList.add('frightened')
      })

      countdownInterval = setInterval(() => {
        countdownValue -= 1
        countdown.innerHTML = countdownValue
      }, 1000)

      energizerTimeout = setTimeout(() => {
        frightened = false
        cells.forEach((cell) => {
          cell.classList.remove('frightened')
        })
        clearInterval(countdownInterval)
        countdown.innerHTML = ''
      }, 10000)

    // IF ALREADY FRIGHTENED
    } else {   

      clearTimeout(energizerTimeout)

      energizerTimeout = setTimeout(() => {
        frightened = false
        cells.forEach((cell) => {
          cell.classList.remove('frightened')
        })
        clearInterval(countdownInterval)
        countdown.innerHTML = ''
      }, 10000)  
    }
  }

  // PLAYER COLLIDES WITH GHOST
  function collideWithGhost(ghostHistory) {

    if (!frightened) {
      lives -= 1
      lifeCounter.innerHTML = lives

      if (lives === 0) {
        endGame('lose')

      } else {
        cells[player].classList.remove('player')
        player = 178
        playerShadow = []
        cells[player].classList.add('player')
        return ghostHistory
      }

    } else {
      score += 100
      scoreCounter.innerHTML = score
      
      ghostHistory = [241, ghostHistory[0]]
      cells[ghostHistory[1]].classList.remove('ghost')
      cells[ghostHistory[0]].classList.add('ghost')

      return ghostHistory
    }
  }

  // GAME FUNCTION ======================================================================================

  function runGame() {

    grid.removeChild(messageScreen)

    player = 178
    ghostHistories = [[22, 23], [40, 61], [400, 379], [418, 417]]
    frightened = false
    const board = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 4, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 4, 4, 4, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 4, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
    foodCount = 200
    
    // SET UP GAME BOARD
    for (let i = 0; i < width ** 2; i++){
      const cell = document.createElement('div')
      cell.classList.add('cell')

      const cellClass = board[i] 

      switch (cellClass) {
        case 1: cell.classList.add('wall'); break
        case 2: cell.classList.add('food'); break
        case 3: cell.classList.add('energizer'); break
        case 4: cell.classList.add('ghostpen'); break
      }

      grid.appendChild(cell)
      cells.push(cell)
    }  

    // SET INITIAL PLAYER AND GHOST LOCATIONS
    cells[player].classList.add('player')

    for (let i = 0; i < 4; i++) {
      const ghost = ghostHistories[i][0]
      cells[ghost].classList.add('ghost')
    }
    
    // MOVE GHOSTS
    ghostInterval = setInterval(() => {
      for (let i = 0; i < 4; i++) {
        ghostHistories[i] = moveGhost(ghostHistories[i])
      }
    }, 300)
  }
}

document.addEventListener('DOMContentLoaded', main)
