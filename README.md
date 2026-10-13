# SURGE

## 1. Game Overview

### 1.1 Game Concept

SURGE is a 2D tower-defence game based on Humans VS Machines. 
The Player must defend their stronghold from waves of machines by placing different human defenders on a battlefield grid

Players must manage energy, position defenders effectively, and prevent enemies from reaching and destroying their Stronghold.

### 1.2 Genre

2D Tower Defence/Strategy

### 1.3 Inspiration

SURGE is inspired by tower-defence games such as Plants vs. Zombies, in particular its grid-based defender placement, resource management and approaching enemy waves.

#### 1.4 Core Gameplay

The player:
- Select defenders from a vertical toolbar
- Places defenders on available battlefield grid cells
- Spend energy to place defenders
- Defends against waves of machine enemies
- Use Shooters to attack enemies automatically
- Aim is to protect the Stronghold from enemy attacks

## 2 Game Design

### 2.1 Battlefield / Grid

The game uses a 7-column by 5-row grid

The defenders can be placed on available cells, and each cell can hold on defender at a time

Enemies approach the stronghold from the opposite side of the battlefield

The grid tracks occupied cells, allowing destroyed defenders to be removed and replaced.

### 2.2 Defender Selection Toolbar

A vertical defender selection toolbar that is connected to the main game scene.

The toolbar includes:
- Shooter and Gnerator selection
- Defender sprite icons
- Energy cost labels
- Visual highlighting for the selected defender
- A dedicated sidebar seperated from the battlefield
- A display showing the players current spendable energy

### 2.3 Energy System / Generation

The main resource for the defenders is energy. Each defender will have a different cost of energy. 

The player begins with 200 energy.

Shooter - 100 Energy Cost
Generator - 50 Energy Cost

Energy is managed through a separate EnergyManager class.

The system checks whether the player has enough energy before allowing a defender to be placed.

Both defender types currently have a 7.5 second placement cooldown

### 2.4 Generator Defender
The Generator produces collectible energy pickups.

- Energy pickups provide 25 energy
- The player clicks pickups to collect them
- Uncollected energy pickups disappear after a period of time
- Generated energy can be used to purchase additional defenders


### 2.5 Shooter Defender

The Shooter is a stationary defensive unit placed on the battlefield grid

It automatically fires projectiles at approaching enemies

Projectiles deal damage when they collide with enemies, and enemies are destroyed when their health reaches zero

### 2.6 Melee Enemy
The Melee Enemy is the currently implemented machine enemy type

The Melee Enemy:
- Spawns on the right hand side of the battlefield
-  Moves towards the stronghold
-  Attacks defenders blocking its path
-  Stops moving while attacking
-  Can damage the Stronghold upon reaching it

  The current Melee Enemy has 200 health and deals 25 damage per attack

### 2.7 Ranged Enemy
The Ranged Enemy is the currently implemented machine enemy type that attacks from a distance.

The Ranged Enemy:
- Spawns on the right hand side of the battlefield
- Moves towards the stronghold
- Stops moving when defenders or the stronghold are within its 300px shooting range
- Fires blue projectiles every 2 seconds
- Can damage defenders and the stronghold with its projectiles
- Can be damaged and destroyed by defenders

  The current Ranged Enemy has 150 health and deals 20 damage per projectile

### 2.8 Health and Damage (Stats)

The game supports health and damage interactions between projectiles, enemies, defenders and the Stronghold.

- Projectiles damage enemy units
- Enemies damage defenders when they reach them
- Destroyed defenders are removed from their grid cells
- Enemies can damage the stronghold once they reach its collision area

Enemies attacking the Stronghold deal damage at regular intervals (currently one attack cycle per second)

### 2.9 Stronghold Destruction and Game Over
When Stronghold health reaches zero, a destruction event is triggered.

The game transitions to as Game Over scene.

The game over screen provides two options:
- Restart: Starts a new game/instance
- Main Menu: Returns to the title scree

### 2.10 Main Menu
SURGE includes a main menu featuring a background (artwork), a game title, subtitle and Play button

The menu uses a separate webpage layout whereas the gameplay uses its own interface.

### 2.11 Sound Effects

Basic sound effects have been added to the game to add a bit more liveliness to the game.

## 3 Player Input/Controls

SURGE is primarily controlled using the mouse.

| Action | Control |
|---|---|
| Select Defender | Left-click a defender in the toolbar |
| Place Defender | Left-click an empty battlefield grid cell |
| Collect Energy | Left-click an energy pickup |
| Start Game | Click the Play button |
| Restart Game | Click the Restart button on the Game Over screen |
| Return to Main Menu | Click the Main Menu button on the Game Over screen |

## 4 Technical Implementation

### 4.1 Technologies

The project uses:
- Typescript
- Phaser 4
- Deno
- HTML & CSS for webpage layout
- Git and GitHub for version control
- GitHub project for task allocation and management
- Celbridge IDE for development

### 4.2 Project Structure

| Directory | Responsibility |
|---|---|
| `src/scenes/` | Contains the Main Menu, Game Scene and Game Over scenes. |
| `src/defenders/` | Contains defender classes such as Shooter and Generator. |
| `src/enemies/` | Contains enemy classes and their movement and attack behaviour. |
| `src/grid/` | Manages the battlefield grid, individual cells and defender placement. |
| `src/managers/` | Contains resource management and wave management modules. |
| `src/systems/` | Handles collision detection and combat interactions. |
| `src/objects/` | Contains game objects such as the Stronghold and projectiles. |
| `src/ui/` | Contains the Phaser defender selection toolbar. |
| `src/constants.ts` | Stores game dimensions, grid settings, defender costs and cooldowns.
  

## 5 Game Features (Implemented and Planned)

| Feature | Priority | Description |
|---|:---:|---|
| Grid System | 1 | Create the battlefield grid and individual cells used for placing defenders. |
| Toolbar | 1 | Allow the player to select the type of defender they want to place. |
| Energy System | 2 | Create a resource system used to purchase and place defenders. |
| Shooter Defender | 1 | Basic attacking human defender that shoots approaching machines. |
| Barricade Defender | 2 | Defensive unit used to block or slow enemies. |
| Generator Defender | 3 | Produces additional energy for the player. |
| Melee Enemy | 1 | Basic machine enemy that moves towards and attacks defenders at close range. |
| Shooter Enemy | 2 | Machine enemy capable of attacking defenders from a distance. |
| Boss Enemy | 3 | Strong enemy intended for later levels. |
| Health / Damage System | 1 | Allow defenders and enemies to take damage and be destroyed. |
| Input Mechanics | 1 | Allow the player to interact with the grid and place defenders. |
| Multiple Levels | 3 | Add additional levels with increasing difficulty. |
| Level Complete Screen | 3 | Display a completion screen when the player successfully finishes a level. |

## 6 Development Progress
Completed development work includes:
- Setting up the project
- Typescript and Phaser configuration
- Grid and cell management
- Defender placement
- Shooter and Generator defenders
- Melee enemy movement and combat
- Projectile collision detection
- Energy management and collection
- Health and damage interactions
- Stronghold implementation and collisions
- Vertical toolbar and defender icons
- Main menu and Game Over scenes
- Stronghold destruction and restart functionality
- Basic sound effects
- Health bars implemented (Enemy, ...)
- Ranged enemy movement and shooting




