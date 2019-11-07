### General Assembly, Software Engineering Immersive
# Project #1: Vac-Man 

First project of the software engineering immersive course at GA London. The assignment was to create a grid-based game to be rendered in the browser, using HTML, CSS and JavaScript.

Given a list of options from GA, I chose to re-create the classic game Pac-Man. Below I first set out the basic approach and design decisions, before exploring its current limitations and with potential avenues for future developments. Please note that while the game is designed in terms of roombas and cats, this documentation is written in terms of the original Pac-Man lingo, e.g. referring to ghosts and energizers, as the underlying code also uses this jargon. 


## Approach and design choices

### Board layout
- kept a single array of continuously increasing numbers to track the cells
- created two basic functions to navigate this array as intended:
  - `getXY(position)`: for each cell, calculate the X and Y coordinate (used for distance calculations)
  - `getNeighbourCell(position, direction)`: based on the cell you're on and the direction you're heading, determine which cell is the one you will land on (allows moving through the walls to appear on the opposite side)
- everything else, i.e. walls, power-ups, player and ghosts, are simply classes assigned to these cells

### Ghost movement
- like in original game, ghosts only look one move ahead
- consider for each ghost the 4 possible options it could move to and narrow it down
- cannot move backwards, so choices only need to be made at intersections
- at intersection, calculate as-the-crow-flies distance (straight line, ignores walls) to pac-man from each option and pick the one that is closest (in frightened state, pick the one that is furthest)
- moving all ghosts the same way in the same interval, different behaviour emerges from different starting points alone
- in order to avoid them 'fusing together' as a result, if two ghosts bump into each other, they will reverse 

### Collisions
- as overlap of classes could be too brief to detect all collisions reliably (if timed correctly, pac-man could 'pass through' a ghost), implemented a player shadow around all cells of the player that would all be considered as collisions if a ghost hit them

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
- `frightened`: a boolean that is at all times either false (base state) or true (for 10 seconds after an energizer is consumed)
- `score`: every time the player moves onto a cell with the 'food' class on it, 1 is added to the score; if the player collides with a ghost while the state frightened is true, 100 is added to the score.
- `lives`: starts at 3 and every time the player collides with a non-frightened ghost, 1 life is taken away; if lives === 0, the player has lost and the game ends.
- `foodCount`: counts down from the total amount of food on the board (200) every time the player lands on a cell with the food class on it; if it reaches 0, the player has won and the game ends.


## Limitations and potential for future development

- server-side saved scoreboard
- mobile-compatibility
- further levels
- different behaviour for each 'ghost', more complexity



## Artwork and credit

Except for GIF after victory, all artwork is my own. ![Alt](/images/cat.png "Title")

GIF from Giphy: https://gph.is/2mHDXA2.



