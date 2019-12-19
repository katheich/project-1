
### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly, Software Engineering Immersive
# Vac-Man 
 

## Overview

This is my first project of the software engineering immersive course at GA London. The assignment was to create a grid-based game to be rendered in the browser, using HTML, CSS and JavaScript. The project was to be completed **individually** within **one week**.

Given a list of options from GA, I chose to re-create the classic game **Pac-Man**. Please note that while the game is designed in terms of roombas and cats, this documentation is written in terms of the original Pac-Man lingo, e.g. referring to _ghosts_ and _energizers_, as the underlying code also uses this jargon. 

You can launch the game on GitHub pages [here](https://katheich.github.io/vac-man/), or find the GitHub repo [here](https://github.com/katheich/vac-man).

## Brief

- **Render a game in the browser**
- **Design logic for winning & visually display which player won**
- **Include separate HTML / CSS / JavaScript files**
- Stick with **KISS (Keep It Simple Stupid)** and **DRY (Don't Repeat Yourself)** principles
- Use **Javascript** for **DOM manipulation**
- **Deploy your game online**, where the rest of the world can access it
- Use **semantic markup** for HTML and CSS (adhere to best practices)

## Technologies used ![Sock](/images/sock.png)

- HTML
- CSS
- JavaScript (ES6)
- Git and GitHub
- Photoshop
- Google Fonts

## Approach

### Board layout 

- kept a single array of continuously increasing numbers to track the cells
- created two basic functions to navigate this array as intended:
  - `getXY`: for each cell, calculate the X and Y coordinate (used for distance calculations)
    ```js
    function getXY(position) {
      const y = Math.floor(position / width) + 1
      const x = position % width + 1                                       

      return [x, y]
    }
    ```
  - `getNeighbourCell`: based on the cell you're on and the direction you're heading, determine which cell is the one you will land on (allows moving through the walls to appear on the opposite side)
    ```js
    function getNeighbourCell(position, direction) {
      switch (direction) {
        case 'up': return position < width ? position + (width * (width - 1)) : position - width
        case 'right': return (position - (width - 1 )) % width === 0 ? position - (width - 1) : position + 1
        case 'down': return position > (width * (width - 1)) - 1 ? position - (width * (width - 1)) : position + width
        case 'left' : return position % width === 0 ? position + (width - 1) : position - 1
      }
    }
    ```
- everything else, i.e. walls, power-ups, player and ghosts, are simply classes assigned to these cells

### Ghost movement 
- like in original game, ghosts only look one move ahead
- consider for each ghost the 4 possible options it could move to and narrow it down
- cannot move into walls or backwards, so choices only need to be made at intersections
- at intersection, calculate as-the-crow-flies distance (straight line, ignores walls) to pac-man from each option and pick the one that is closest (in frightened state, pick the one that is furthest)
- moving all ghosts the same way in the same interval, different behaviour emerges from different starting points alone
- in order to avoid them 'fusing together' as a result, if two ghosts bump into each other, they will reverse 

```js
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

      (...)
    }
  }
```


### Game timing 
- Ghosts are on set intervals, moving one at a time using the algorithm in `moveGhost`
  ```js 
    ghostInterval = setInterval(() => {
      for (let i = 0; i < 4; i++) {
        ghostHistories[i] = moveGhost(ghostHistories[i])
      }
    }, 300)
  ```
- Eventlistener on window for WASD input from player
  ```js
    document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'w': {
        const cellIndex = getNeighbourCell(player, 'up')
        cells[player].classList.remove('player', 'up', 'right', 'down', 'left')     
        player = movePlayer(cellIndex)
        cells[player].classList.add('player', 'up')
        break
      }
      (...)
    }
  }
  ```

### Collisions 
- as overlap of classes could be too brief to detect all collisions reliably (if timed correctly, pac-man could 'pass through' a ghost), implemented a player shadow around all cells of the player that would all be considered as collisions if a ghost hit them
  ```js
  playerShadow = [getNeighbourCell(player, 'up'), getNeighbourCell(player, 'right'), getNeighbourCell(player, 'down'), getNeighbourCell(player, 'left')]
  ```
- checks for collisions both in the moves of the ghosts and the player
  - in `moveGhost`:

    ```js
    if (cells[ghostHistory[0]].classList.contains('player') || playerShadow.includes(ghostHistory[0])) {
      ghostHistory = collideWithGhost(ghostHistory)
    } 
    ```
  - in `movePlayer`:
  
    ```js
    else if (newPosition.classList.contains('ghost')) {
        for (let i = 0; i < 4; i++) {
          if (ghostHistories[i].includes(player)) {
            ghostHistories[i] = collideWithGhost(ghostHistories[i])
          }
        }
    } 
    ```

### Power-ups and 'frightened' state 
- when pac-man eats an energizer, a boolean 'frightened' is toggled from false to true for 10 seconds
- if another energizer is consumed when the boolean was already true, the timer is reset to 10 seconds from the last energizer
- various behaviours are different when this boolean is true, namely:
  1) ghosts choose the cell furthest away from pac-man, not closest
  2) if pac-man collides with a ghost, 100 points are added to the score and the ghost is relocated to the ghost-pen
  3) the CSS class frightened changes the look of the ghosts
- a countdown was added to alert the player of the time the game is remaining in the frightened state

### Variables 
At all times various variables are used to keep track of things happening in the game:

- `player`: the index of the cell the player is on
- `playerShadow`: keeps track of all cells around the player in an array, to improve collision detection
- `ghostHistories`: the location of all 4 ghosts in an array, in which each ghost has their own array of their current and immediately preceding position (also as cell indeces)
- `frightened`: a boolean that is at all times either false (base state) or true (for 10 seconds after an _energizer_ is consumed)
- `score`: every time the player moves onto a cell with the _food_ class on it, 1 is added to the score; if the player collides with a _ghost_ while the state _frightened_ is true, 100 is added to the score.
- `lives`: starts at 3 and every time the player collides with a non-frightened _ghost_, 1 life is taken away; if `lives === 0`, the player has lost and the game ends.
- `foodCount`: counts down from the total amount of food on the board (200) every time the player lands on a cell with the _food_ class on it; if it `foodCount === 0`, the player has won and the game ends.

### Non-game screens

- always wipe the grid at the centre of the screen and display a new message div over it

```js
// END GAME SCREEN
  function endGame(state) {

    // CLEAR VARIABLES
    clearInterval(ghostInterval)
    grid.innerHTML = '' 
    cells = []

    grid.appendChild(messageScreen)

    // VICTORY SCREEN
    if (state === 'win') {
      messageScreen.innerHTML = `You won! Your score was ${score}.`

      (...)
    }
  }
```


## Screenshots

![Start screen](/images/screenshots/start-screen.png)

![Countdown screen](/images/screenshots/countdown.png)

![Gameplay](/images/screenshots/gameplay.png)

![Victory screen](/images/screenshots/victory-screen.png)

![High scores screen](/images/screenshots/high-scores.png)

![Defeat screen](/images/screenshots/game-over.png)

![Mobile screen](/images/screenshots/mobile.png)

## Bugs ![Frightened cat](/images/cat-frightened.png)

- collisions still not 100% reliable
- some trouble with firefox on linux apparently

## Future features

- server-side saved scoreboard
- mobile-compatibility
- different behaviour for each 'ghost', more complexity
- further levels


## Lessons learned

- 

## Artwork and credit

Except for GIF after victory, all artwork is my own. ![Cat Logo](/images/cat.png)

GIF from Giphy: https://gph.is/2mHDXA2.



