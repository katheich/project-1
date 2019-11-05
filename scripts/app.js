function main() {

  // VARIABLES
  const width = 21
  const grid = document.querySelector('.grid')
  const scoreCounter = document.getElementById('score')
  const lifeCounter = document.getElementById('lives')
  const messageScreen = document.querySelector('.message')
  const countdown = document.getElementById('countdown')

  let cells = [] 
  let score = 0
  let lives = 3
  let ghostInterval

  let player
  let playerShadow = []
  let ghostHistories = []
  let frightened 
  let foodCount
  let energizerTimeout
  let countdownInterval
  let countdownValue

  // STARTING SCREEN 
  const logo = document.createElement('img')
  logo.setAttribute('src', 'images/cat-logo.png')
  messageScreen.appendChild(logo)

  const button = document.createElement('button')
  button.innerHTML = 'Start game'
  button.addEventListener('click', runGame)
  messageScreen.appendChild(button)

  const instructions = document.createElement('img')
  instructions.setAttribute('src', 'images/instructions.png')
  messageScreen.appendChild(instructions)


  // END GAME FUNCTION
  function endGame(state) {

    clearInterval(ghostInterval)
    grid.innerHTML = ''

    grid.appendChild(messageScreen)

    const logo = document.createElement('img')

    if (state === 'win') {
      messageScreen.innerHTML = `You won! Your score was ${score}.`
      logo.setAttribute('src', 'https://media.giphy.com/media/3iBcRAErFhFwoTVbN5/giphy.gif')

    } else if (state === 'lose') {
      messageScreen.innerHTML = `Game-over! Your score was ${score}.`
      logo.setAttribute('src', 'images/cat-defeat.png')
    }

    messageScreen.appendChild(logo)

    const button = document.createElement('button')
    button.innerHTML = 'Play again'
    button.addEventListener('click', runGame)
    messageScreen.appendChild(button)

    cells = []
    playerShadow = []
  }

  // GET X AND Y COORDINATE OF ANY CELL
  function getXY(position) {
    const y = Math.floor(position / width) + 1
    const x = position % width + 1                                       

    return [x, y]
  }

  // CELL LOGIC (TO TRAVEL THROUGH EDGES OF THE BOARD)
  function getNeighbourCell(position, direction) {
    switch (direction) {
      case 'up': return position < 21 ? position + 420 : position - width
      case 'right': return (position - 20) % 21 === 0 ? position - 20 : position + 1
      case 'down': return position > 419 ? position - 420 : position + width
      case 'left' : return position % 21 === 0 ? position + 20 : position - 1
    }
  }

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

    console.log('COLLISION')

    if (!frightened) {
      lives -= 1
      lifeCounter.innerHTML = lives

      if (lives === 0) {
        endGame('lose')

      } else {
        cells[player].classList.remove('player')
        player = 178
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


  // GHOST MOVEMENT  
  function moveGhost(ghostHistory) {

    const ghost = ghostHistory[0]

    let ghostOptions = [getNeighbourCell(ghost, 'up'), getNeighbourCell(ghost, 'right'), getNeighbourCell(ghost, 'down'), getNeighbourCell(ghost, 'left')]

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

        let distance = Math.sqrt((playerXY[0] - newGhostXY[0]) ** 2 + (playerXY[1] - newGhostXY[1]) ** 2)
        
        cells[cell].classList.contains('ghostpen') ? distance += 15 : distance

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
      ghostHistory = [ghostOptions[newGhost], ghost]
    }
    cells[ghostHistory[1]].classList.remove('ghost')
    cells[ghostHistory[0]].classList.add('ghost')

    // COLLISION WITH PLAYER
    if (cells[ghostHistory[0]].classList.contains('player') || playerShadow.includes(ghostHistory[0])) {
      ghostHistory = collideWithGhost(ghostHistory)
    } 
    // console.log('Ghost history at end of move: ', ghostHistory)

    return ghostHistory
  }

  // PLAYER MOVEMENT
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
        console.log('ENERGIZED')
        newPosition.classList.remove('energizer')

        energize()
      }

      return cellIndex
    }
  }

  // ASSIGN AND CLEAR PLAYER CLASSES BASED ON NEW AND PREVIOUS POSITION
  function assignPlayer(newPosition, oldPosition, direction) {
    cells[oldPosition].classList.remove('player')
    cells[oldPosition].classList.remove('up')
    cells[oldPosition].classList.remove('right')
    cells[oldPosition].classList.remove('down')
    cells[oldPosition].classList.remove('left')

    cells[newPosition].classList.add('player')
    cells[newPosition].classList.add(direction)
  }

  document.addEventListener('keydown', e => {

    switch (e.key) {

      case 'w': {
        const cellIndex = getNeighbourCell(player, 'up')
        const oldPosition = player        
        player = movePlayer(cellIndex)
        const newPosition = player

        assignPlayer(newPosition, oldPosition, 'up')
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]   
        // console.log(getXY(player))
        break
      }

      case 'd': {
        const cellIndex = getNeighbourCell(player, 'right')
        const oldPosition = player        
        player = movePlayer(cellIndex)
        const newPosition = player

        assignPlayer(newPosition, oldPosition, 'right')      
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        // console.log(getXY(player))
        break
      }

      case 's': {
        const cellIndex = getNeighbourCell(player, 'down')
        const oldPosition = player        
        player = movePlayer(cellIndex)
        const newPosition = player

        assignPlayer(newPosition, oldPosition, 'down')      
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        // console.log(getXY(player))
        break
      } 

      case 'a': {
        const cellIndex = getNeighbourCell(player, 'left')
        const oldPosition = player        
        player = movePlayer(cellIndex)
        const newPosition = player

        assignPlayer(newPosition, oldPosition, 'left')      
        playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
        // console.log(getXY(player))
        break
      }
    }
  })


  // GAME FUNCTION
  function runGame() {

    console.log('new game')

    grid.removeChild(messageScreen)

    score = 0
    scoreCounter.innerHTML = score
    lives = 3
    lifeCounter.innerHTML = lives

    player = 178
    ghostHistories = [[22, 23], [40, 61], [400, 379], [418, 417]]
    frightened = false
    const board = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 4, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 4, 4, 4, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 4, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
    foodCount = 200
    
    // SET UP GAME BOARD
    for (let i = 0; i < width ** 2; i++){
      const cell = document.createElement('div')

      const cellClass = board[i] 

      switch (cellClass) {
        case 1: cell.classList.add('wall'); break
        case 2: cell.classList.add('food'); break
        case 3: cell.classList.add('energizer'); break
        case 4: cell.classList.add('ghostpen'); break
      }

      grid.appendChild(cell)
      cells.push(cell)

      // cell.innerHTML = i
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
