function setupGame() {

  // VARIABLES
  const start = document.getElementById('start')
  const width = 21
  const grid = document.querySelector('.grid')
  const scoreCounter = document.getElementById('score')
  const lifeCounter = document.getElementById('lives')

  const board = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 4, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 4, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 4, 4, 4, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 3, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  let player = 178
  let ghost = 253
  const cells = [] 
  let score = 0
  let lives = 3
  let ghostHistory = [0, 0]
  let frightened = false

  
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

  cells[player].classList.add('player')
  cells[ghost].classList.add('ghost')

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

  // GHOST HITS PLAYER 
  function collideWithGhost() {

    console.log('COLLISION')

    if (!frightened) {
      lives -= 1
      lifeCounter.innerHTML = lives

      if (lives === 0) {
        console.log(`GAME OVER, TOTAL SCORE: ${score}`)
      }

      cells[player].classList.remove('player')
      player = 178
      cells[player].classList.add('player')

    } else {
      score += 100
      
      cells[ghost].classList.remove('ghost')
      ghost = 219
      cells[ghost].classList.add('ghost')
    }
  }


  // GHOST MOVEMENT

  // current ghost position: ghost
  // all options of ghost positions: ghostOptions = [up, right, down, left]
  // new ghost position: newGhost (index in array ghostOptions)
  // tracking history of ghost position: ghostHistory
  
  function moveGhost() {

    // console.log('ghost: ', ghost)

    let ghostOptions = [getNeighbourCell(ghost, 'up'), getNeighbourCell(ghost, 'right'), getNeighbourCell(ghost, 'down'), getNeighbourCell(ghost, 'left')]
    // console.log('All cells around: ', ghostOptions)

    ghostOptions = ghostOptions.filter((option) => {
      return !(cells[option].classList.contains('wall') || option === ghostHistory[1])
    })

    // console.log('Viable options: ', ghostOptions)

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

        // console.log(cell, distance, minDistance, maxDistance)
      })

      if (!frightened) {
        newGhost = distances.indexOf(minDistance)
      } else {
        newGhost = distances.indexOf(maxDistance)
      }
      
      // RANDOM CHOICE 
      // newGhost =  Math.floor(Math.random() * ghostOptions.length)
    }

    ghostHistory = [ghostOptions[newGhost], ghost]
    cells[ghost].classList.remove('ghost')
    ghost = ghostOptions[newGhost]
    cells[ghost].classList.add('ghost')

    // console.log('Ghost history at end of move: ', ghostHistory)

    // check conditions on new ghost cell
    if (cells[ghost].classList.contains('player')) {
      collideWithGhost()
    }

  }

  const ghostInterval = setInterval(() => {

    console.log(frightened)
    moveGhost()

  }, 300)



  // PLAYER MOVEMENT
  function movePlayer(cellIndex) {

    const newPosition = cells[cellIndex]

    if (newPosition.classList.contains('wall') || newPosition.classList.contains('ghostpen')) {
      return

    } else {
      cells[player].classList.remove('player')
      newPosition.classList.add('player')
      player = cellIndex

      if (newPosition.classList.contains('food')) {
        newPosition.classList.remove('food')
        score += 1
        scoreCounter.innerHTML = score

      } else if (newPosition.classList.contains('ghost') || ghostHistory.includes(player)) {
        collideWithGhost()

      } else if (newPosition.classList.contains('energizer')) {
        console.log('ENERGIZED')
        newPosition.classList.remove('energizer')
        frightened = true

        cells.forEach((cell) => {
          cell.classList.add('frightened')
        })

        setTimeout(() => {
          frightened = false
          cells.forEach((cell) => {
            cell.classList.remove('frightened')
          })
        }, 10000)

      }
    }
  }

  document.addEventListener('keyup', e => {

    switch (e.key) {

      case 'w': {
        const cellIndex = getNeighbourCell(player, 'up')
        movePlayer(cellIndex)
        // console.log(getXY(player))
        break
      }

      case 'd': {
        const cellIndex = getNeighbourCell(player, 'right')
        movePlayer(cellIndex)
        // console.log(getXY(player))
        break
      }

      case 's': {
        const cellIndex = getNeighbourCell(player, 'down')
        movePlayer(cellIndex)
        // console.log(getXY(player))
        break
      } 

      case 'a': {
        const cellIndex = getNeighbourCell(player, 'left')
        movePlayer(cellIndex)
        // console.log(getXY(player))
        break
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', setupGame)
