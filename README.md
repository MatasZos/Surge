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

The player can:
- Select defenders from a vertical toolbar
- Places defenders on available battlefield grid cells
- Spend energy to place defenders
- Use Shooters and Dual Barrel defenders to attack enemies automatically
- Use Generators to produce additional energy
- Use Barricades to block approaching machines
- Collect energy pickups produced by Generators or dropped by defeated enemies
- Aim is to protect the Stronghold from enemy attacks

## 2 Game Design

### 2.1 Battlefield / Grid

The game uses a 9-column by 5-row grid

The defenders can be placed on available cells, and each cell can hold on defender at a time

Enemies approach the stronghold from the opposite side of the battlefield

The grid tracks occupied cells, allowing destroyed defenders to be removed and replaced.

### 2.2 Defender Selection Toolbar

A vertical defender selection toolbar that is connected to the main game scene.

The toolbar includes:
- Shooter, Generator, Barricade and Dual Barrel selection
- Defender sprite icons
- Energy cost labels
- Visual highlighting for the selected defender
- A dedicated sidebar seperated from the battlefield
- A display showing the players current spendable energy
- Individual placement cooldown countdowns for each defender

### 2.3 Energy System / Generation

The main resource for the defenders is energy. Each defender will have a different cost of energy. 

The player begins with 500 energy.

Shooter - 100 Energy Cost
Generator - 50 Energy Cost
Barricade - 125 Energy Cost
Dual Barrel - 200 Energy Cost

Energy is managed through a separate EnergyManager class.

The system checks whether the player has enough energy before allowing a defender to be placed.
Each defender also has its own placement cooldown

Starting energy, defender costs, and cooldown duration can be adjusted in the Excel gameplay configuration.

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

### 2.6 Barricade Defender

The Barricade is a defensive unit that is designed to block approaching machine enemies.

It has significantly more health than attacking defenders.

The Barricade does not attack enemies directly.

### 2.7 Dual Barrel Defender

The Dual Barrel is an attacking defender that fires two projectiles during one interval.

The Dual Barrel:
- Detects enemies approaching within its row
- Fires two projectiles per firing cycle
- Fires its second projectile shortly after the first
- Damages any unit hit by the projectile
  
### 2.8 Melee Enemy
The Melee Enemy is the currently implemented machine enemy type

The Melee Enemy:
- Spawns on the right hand side of the battlefield
-  Moves towards the stronghold
-  Attacks defenders blocking its path
-  Stops moving while attacking
-  Can damage the Stronghold upon reaching it
-  Also receives retaliation damage from the Stronghold

  The current Melee Enemy has 200 health and deals 25 damage per attack

### 2.9 Ranged Enemy
The Ranged Enemy is the currently implemented machine enemy type that attacks from a distance.

The Ranged Enemy:
- Spawns on the right hand side of the battlefield
- Moves towards the stronghold
- Stops moving when defenders or the stronghold are within its 300px shooting range
- Fires blue projectiles every 2 seconds
- Can damage defenders and the stronghold with its projectiles
- Can be damaged and destroyed by defenders

  The current Ranged Enemy has 150 health and deals 20 damage per projectile

### 2.10 Crusher Enemy
The Crusher is a larger, heavily armoured machine enemy

It moves much slower than standard enemies but has significantly more health and deals greater damage during close-range attacks.

The Crusher:
- Attacks defenders at close range
- Can damage the stronghold
- Receives retaliation damage when attacking the Stronghold (similarly to Melee Enemy)

The Crusher provides an additional challenge compared to the other Enemy types.

### 2.11 Health and Damage (Stats)

The game supports health and damage interactions between projectiles, enemies, defenders and the Stronghold.

- Defenders and Enemies have individual health values
- Enemy and defender health bar display remaining health
- Projectile damage enemies when collision occurs
- Ranged Enemies attack using projectiles
- Destroyed defenders are removed from their grid
- Destroyed enemies have an explosion effect and a simple shrinking animation
- Enemies stop moving while performing their attacks (current state)
  
Health and damage statistics can be adjusted in the gameplay spreadsheet

### 2.12 Stronghold Health and Retaliation

The Stronghold is the player's main structure and must be protected

Its current and maximum health is displayed using a health bar positioned above the Stronghold

When enemies damage the Stronghold, the health bar decreases

Stronghold retaliation has also been implemented
- When Melee or Crusher enemies attack the Stronghold directly, the Stronghold deals damage back to the enemy if it survives the attack
- Ranged Enemies are not affected by this retaliation because they attack from a distance

### 2.13 Energy Drops from Defeated Enemies
Enemies have a chance to drop collectible energy when defeated

In the current state:
- Each defeated enemy has a 40% chance to drop an energy pickup
- The pickup appears near the enemy's death position
- Collecting the pickup rewards the player with 20 bonus energy
- Uncollected pickups disappear after a period of time (similarly to how the energy pickup disappears on the Generator)

### 2.14 Enemy Spawning and WaveManager
Enemy spawning is currently continuous rather than being divided into numbered waves

The current probabilities are:
Melee - 60% spawn probability
Ranged - 35% spawn probability
Crusher - 5% spawn probability

There is an initial spawn delay to allow the user to place down their units (current state)

A full wave progression system, including numbered waves and increasing difficulty, is planned for future development

### 2.15 Stronghold Destruction and Game Over
When Stronghold health reaches zero, a destruction event is triggered.

The game transitions to as Game Over scene.

The game over screen provides two options:
- Restart: Starts a new game/instance
- Main Menu: Returns to the title scree

### 2.16 Main Menu
SURGE includes a main menu featuring a background (artwork), a game title, subtitle and Play button

The menu uses a separate webpage layout whereas the gameplay uses its own interface.

### 2.17 Sound Effects

Basic sound effects have been added to the game to add a bit more liveliness to the game.

These include:
- Background music
- Defender shooting sounds
- Enemy hit sounds
- Enemy destruction sounds



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
- Python for spreadsheet configuration export script
- Excel for gameplay configuration and statistics
- Git and GitHub for version control
- GitHub project for task allocation and management
- Celbridge IDE for development


### 4.2 Project Structure

| Directory / File | Responsibility |
|---|---|
| `src/scenes/` | Contains the Main Menu, Game Scene and Game Over scenes. |
| `src/defenders/` | Contains defender classes such as Shooter, Generator, Barricade and Dual Barrel. |
| `src/enemies/` | Contains Melee, Ranged and Crusher enemy classes, including their movement and combat behaviour. |
| `src/grid/` | Manages the battlefield grid, individual cells and defender placement. |
| `src/managers/` | Contains EnergyManager for managing energy and WaveManager for enemy spawn selection. |
| `src/systems/` | Handles collision detection and combat interactions. |
| `src/objects/` | Contains game objects such as the Stronghold and projectiles. |
| `src/ui/` | Contains the defender selection toolbar and cooldown indicators. |
| `src/config/` | Contains default gameplay settings and CSV configuration loading. |
| `src/constants.ts` | Stores game dimensions and grid layout constants. |
| `config/gameplay.xlsx` | Excel spreadsheet containing gameplay statistics and settings. |
| `config/export_config.py` | Python script that exports Excel settings to CSV files. |
| `config/gameplay.csv` | Generated CSV containing gameplay settings used by the game. |
| `build.ts` | Builds and checks the project and copies files into the distribution folder. |


### 4.3 Excel and CSV Gameplay Configuration

SURGE uses an Excel-based gameplay configuration system

The spreadsheet contains separate worksheets for:
- Enemies
- Defenders
- Energy
- Stronghold
- Waves and enemy spawning

This allows us to adjust any of these values such as health, damage, movement speed, energy costs, cooldowns and spawn probabilities to be adjusted instantly


  


## 5 Game Features (Implemented and Planned)

| Feature | Priority | Description | Status |
|---|:---:|---|---|
| Grid System | 1 | Create the battlefield grid and individual cells used for placing defenders. | Implemented |
| Defender Toolbar | 1 | Allow players to select defenders and view their energy costs. | Implemented |
| Energy System | 2 | Resource system used to purchase and place defenders. | Implemented |
| Shooter Defender | 1 | Basic attacking defender that fires projectiles at approaching enemies. | Implemented |
| Barricade Defender | 2 | Defensive unit with high health used to block approaching enemies. | Implemented |
| Generator Defender | 3 | Produces collectible energy pickups for the player. | Implemented |
| Dual Barrel Defender | 2 | Attacking defender that fires two projectiles in quick succession. | Implemented |
| Melee Enemy | 1 | Basic machine enemy that attacks defenders and the Stronghold at close range. | Implemented |
| Ranged Enemy | 2 | Machine enemy capable of firing projectiles from a distance. | Implemented |
| Crusher Enemy | 2 | Larger machine enemy with increased health and damage. | Implemented |
| Health / Damage System | 1 | Allow defenders, enemies and the Stronghold to take damage. | Implemented |
| Health Bars | 2 | Display remaining health for defenders, enemies and the Stronghold. | Implemented |
| Cooldown Indicators | 2 | Display countdown timers for defender placement cooldowns. | Implemented |
| Stronghold Retaliation | 2 | Stronghold deals damage back to Melee and Crusher enemies attacking it. | Implemented |
| Energy Drops | 2 | Defeated enemies have a chance to drop collectible energy. | Implemented |
| Excel / CSV Configuration | 2 | Configure gameplay statistics through Excel using Python and CSV files. | Implemented |
| WaveManager Enemy Selection | 2 | Select enemy types using spawn probabilities configured in Excel. | Implemented |
| Input Mechanics | 1 | Allow players to select defenders, place units and collect energy. | Implemented |
| Sound Effects | 2 | Add sounds for shooting, enemy damage and destruction. | Implemented |
| Destruction Animations | 2 | Add explosion and shrinking effects when units are destroyed. | Implemented |
| Full Wave System | 2 | Introduce numbered waves and wave progression. | Planned |
| Boss Enemy | 3 | Strong enemy intended for later stages of the game. | Planned |
| Multiple Levels | 3 | Add additional levels with increasing difficulty. | Planned |
| Level Completion Screen | 3 | Display a completion screen when the player successfully finishes a level. | Planned |
| Victory Conditions | 3 | Introduce objectives that allow the player to win. | Planned |
| Defender Unlock System | 3 | Unlock additional defenders as the player progresses. | Planned |

## 6 Development Progress
Completed development work includes:
- Project setup#
- Battlefield grid and cell management
- Shooter, Generator, Barricade, and Dual Barrel defenders
- Melee, Ranged, and Crusher enemies
- Projectile collision detection
- Energy management and collection
- Health bar for enemies, defender and the stronghold
- Stronghold retaliations against close-range attackers
- Defender placement cooldowns and visual countdown indicators
- Main menu and Game Over scenes
- Stronghold destruction and restart functionality
- Sound effects and destruction animations
- Excel to CSV gameplay config
- WaveManager integration for enemy spawn logic




