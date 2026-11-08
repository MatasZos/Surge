
## 1. Game Overview

### 1.1 Game Concept

SURGE is a 2D tower-defence game based on Humans VS Machines. 
The Player must defend their stronghold from waves of machines by placing different human defenders on a battlefield grid

Players must manage energy, position defenders effectively, and prevent enemies from reaching and destroying their Stronghold.

The game now includes multiple levels, a full wave progression system and different enemy types including a final Boss Enemy. Players must defeat all the required waves to complete each level and progress through the game.

### 1.2 Genre

2D Tower Defence/Strategy

### 1.3 Inspiration

SURGE is inspired by tower-defence games such as Plants vs. Zombies, in particular its grid-based defender placement, resource management and approaching enemy waves.

#### 1.4 Core Gameplay

The player can:
- Select defenders from a vertical toolbar
- Place defenders on available battlefield grid cells
- Spend energy to place defenders
- Use Shooters and Dual Barrel defenders to attack enemies automatically
- Use Generators to produce additional energy
- Use Barricades to block approaching machines
- Collect energy pickups produced by Generators or dropped by defeated enemies
- Aim is to protect the Stronghold from enemy attacks
- Drag and drop defenders onto available battlefield cells
- Preview defender placement before placing them
- Use Cryo Gunners, Landmines and Scrappers as additional defensive units
- Receive passive energy regeneration over time
- Remove placed defenders using the recall button
- Defend against increasingly difficult enemy waves
- View the current wave number and receive wave notifications
- Prepare for the next wave during intermissions
- Complete levels by defeating the required enemies
- Fight the Overlord Boss Enemy in the final level
- Upgrade placed defenders from Level 1 to Level 2 using energy
- View upgrade costs through a clickable defender upgrade menu
- See a green Level 2 indicator on upgraded defenders
- Increase defender damage, health or energy production through upgrades
- Receive a 50% energy refund when recalling defenders
- Unlock additional defenders as the player progresses through levels
  

## 2 Game Design

### 2.1 Battlefield / Grid

The game uses a 9-column by 5-row grid

The defenders can be placed on available cells, and each cell can hold on defender at a time

Enemies approach the stronghold from the opposite side of the battlefield

The grid tracks occupied cells, allowing destroyed defenders to be removed and replaced.
The battlefield background has been updated with a new industrial design.

The grid size and position were adjusted to match the tiles in the background. The game still uses a 9-column by 5-row grid.

The stronghold is now a separate image instead of being part of the battlefield background. Its width, height and position can be adjusted independently.

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
- Additional defender options including Cryo Gunner, Landmine and Scrapper
- Drag and drop functionality for placing defenders onto the battlefield
- A placement preview showing where defenders can be placed
- Placement messages when a defender cannot be placed
- A recall button for removing placed defenders and freeing up grid cells
- Added a move defender button with an image and styling.
- Added feedback when the player does not have enough energy.

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

Passive energy regeneration has also been implemented. The player now receives energy automatically over time, providing an additional way to gain energy alongside Generators and energy drops from defeated enemies.

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
- The Dual Barrel now uses separate projectile statistics, allowing its projectile damage and speed to be configured independently.
  
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

The Stronghold has also received a new design with thicker armour, turrets and blue lighting.

Its image size and position can now be adjusted in Stronghold.ts without changing the battlefield grid. The existing health and collision systems remain unchanged.

### 2.13 Energy Drops from Defeated Enemies
Enemies have a chance to drop collectible energy when defeated

In the current state:
- Each defeated enemy has a 40% chance to drop an energy pickup
- The pickup appears near the enemy's death position
- Collecting the pickup rewards the player with 20 bonus energy
- Uncollected pickups disappear after a period of time (similarly to how the energy pickup disappears on the Generator)

### 2.14 Enemy Spawning and WaveManager
Enemy spawning is controlled through a full wave progression system.

Enemies spawn in numbered waves rather than continuously, with increasing enemy counts and difficulty.

The current wave number is displayed during gameplay, and notifications inform the player when a new wave begins.

A short intermission takes place between waves, allowing the player to prepare for the next attack.

The WaveManager manages enemy spawning and wave progression throughout the game.

The game now includes a wave progress bar showing how far the player has progressed through the current wave.

Players can also start the next wave early to receive bonus energy instead of waiting for the intermission to finish.

A level indicator has been added so players can see which level they are currently playing.

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
- Separate boss battle music that starts when the Overlord appears.
- The normal background music stops when the boss battle begins.

### 2.18 Cryo Gunner Defender

The Cryo Gunner is another attacking defender that can be placed on the battlefield grid.

It gives the player another option for dealing with approaching machine enemies.

### 2.19 Landmine Defender

The Landmine is a defensive unit that can be placed on available grid cells.

It helps the player deal with approaching enemies and provides another way to protect the Stronghold.

### 2.20 Scrapper Defender

The Scrapper is another defender type available to the player.

It gives the player more options when placing defenders and planning their defence.

### 2.21 Defender Recall System

The recall system allows players to remove defenders and generators that have already been placed.

- Players can use the recall button to remove a unit
- The occupied grid cell becomes available again
- Another defender can then be placed in that cell

### 2.22 Defender Drag and Drop

Players can drag defenders from the toolbar onto available battlefield cells.

- Available cells are highlighted during placement
- A placement preview shows where the defender can be placed
- Messages appear when a defender cannot be placed
- Locked defender indicators for defenders that have not been unlocked yet
- Level based defender unlocking as the player progresses through the game

### 2.23 Multiple Levels and Level Completion

SURGE includes five levels with increasing difficulty.

Each level contains enemy waves that the player must defeat while protecting the Stronghold.

Once the required enemies have been defeated, the level completion condition is triggered.

### 2.24 Overlord Boss Enemy

The Overlord is a Boss Enemy that appears during the final wave of Level 5.

It provides an additional challenge for the player, and defenders from all five lanes can attack it.

The Overlord now has 15,000 health and four different stages based on its remaining health.

- Stage 1 (100%–75%): The boss uses its basic projectile attacks.
- Stage 2 (75%–50%): The boss attacks faster and deals more damage.
- Stage 3 (50%–25%): The boss becomes stronger and introduces laser attacks.
- Stage 4 (Below 25%): The boss uses its fastest and strongest attacks.

The boss also changes colour between stages to show when it becomes more dangerous.

### 2.25 Gameplay Improvements and Bug Fixes

Several improvements have been made to the gameplay.

- Improved enemy detection and collision handling
- Fixed accidental defender placement when collecting energy
- Fixed energy pickups remaining after a Generator was destroyed
- Improved defender placement and cooldown messages
- Refactored GameScene and collision code
- Moved passive energy, drag and drop and energy HUD into separate classes
- Fixed the upgrade menu closing immediately when clicking a defender
- Added click outside detection to automatically close the upgrade menu
- Added energy checks to prevent upgrades when the player has insufficient energy
- Updated the energy HUD after purchasing defender upgrades

### 2.26 Defender Upgrade System

The game now includes a Level 2 upgrade system for placed defenders.

- Players can click on a placed defender to open the upgrade menu
- Defenders can be upgraded from Level 1 to Level 2 using energy
- Each defender has its own upgrade cost controlled through the Excel spreadsheet
- The system checks if the player has enough energy before upgrading
- Once upgraded, the menu displays MAX LEVEL
- Upgraded defenders display a green Level 2 label and outline
- Recalling an upgraded defender resets it back to Level 1 when placed again

The upgrade system gives players more options when deciding how to spend their energy.

### 2.27 Level 2 Defender Upgrades

Each defender receives a different improvement when upgraded to Level 2.

- Shooter: 1.5x projectile damage
- Dual Barrel: 1.5x damage
- Cryo Gunner: 1.5x damage
- Landmine: 1.5x damage
- Scrapper: 1.5x damage against Crushers
- Generator: 1.5x energy generation
- Barricade: 1.5x maximum health

The upgrade multipliers are controlled through the Excel spreadsheet and exported to CSV, allowing the values to be changed without hardcoding them.

### 2.28 Defender Selling and Energy Refund

The recall system has been updated to refund energy when removing defenders.

- Players receive a 50% energy refund when recalling a defender
- The refund is based on the defender's placement cost
- For example, recalling a Shooter costing 100 energy refunds 50 energy
- The occupied grid cell becomes available again
- Recalled defenders can be placed again at Level 1

This allows players to change their defence without losing all the energy spent on placing defenders.

## 2.29 Overlord Shield System

The Overlord activates a shield when its health reaches 75%, 50% and 25%.

While the shield is active, the boss cannot take damage.

Each shield phase summons additional enemy robots:

-75% health: 4 Melee and 2 Ranged enemies.
-50% health: 4 Melee, 3 Ranged and 2 Crusher enemies.
-25% health: 5 Melee, 4 Ranged and 3 Crusher enemies.

The player must defeat all summoned enemies to remove the shield and continue damaging the boss.

## 2.30 Overlord Abilities

The Overlord has different attacks that become stronger as the fight progresses.

-The boss fires projectiles across the battlefield lanes.
-Projectile damage increases during later stages.
-The time between projectile attacks becomes shorter.
-A laser attack has been developed for stages 3 and 4.
-The laser targets one row and displays a warning before firing.
-The laser deals damage to defenders in the targeted row.

The boss abilities are organised into separate TypeScript classes to keep the main game code easier to manage.

## 2.31 Level 3 Defender Upgrades

The defender upgrade system has been expanded to include Level 3 upgrades.

Each defender receives a special ability when upgraded to Level 3.

- Shooter: Electric chain attack.
- Dual Barrel: Explosive rounds.
- Cryo Gunner: Freezes enemies.
- Landmine: Blast ability.
- Barricade: Self-repair ability.
- Scrapper: Rapid recovery.
- Generator: Energy jackpot.

A new visual indicator has also been added to show when a defender reaches Level 3.

## 2.32 Defender Repositioning

A defender repositioning system is being developed.

This allows players to move already placed defenders to different available grid cells instead of removing and replacing them.

The defender toolbar has also been updated with a move button and new styling.

## 3 Player Input/Controls

SURGE is primarily controlled using the mouse.

| Action | Control |
|---|---|
| Drag and Drop Defender - Place | Drag a defender from the toolbar onto an available grid cell |
| Preview Placement | Drag a defender over the battlefield to see available cells |
| Remove Defender | Use the Recall button to remove a placed unit |
| Collect Energy | Left-click an energy pickup |
| Start Game | Click the Play button |
| Restart Game | Click the Restart button on the Game Over screen |
| Return to Main Menu | Click the Main Menu button on the Game Over screen |
| Upgrade Defender | Click a placed defender and select Upgrade from the menu |
| Close Upgrade Menu | Click outside the upgrade menu |
| Start Wave Early | Click the early wave start button |
| Move Defender | Select the move defender option in the toolbar |

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
| `src/boss/` |	Contains Overlord boss phases, shields, reinforcements, laser attacks and visual effects.
| `src/helpers/BattlefieldView.ts` |	Handles the battlefield background, grid display and other battlefield visuals.
| `src/helpers/BossMusic.ts` |	Controls the music played during the Overlord boss fight.
| `src/enemies/BossAbilities.ts` |	Controls the Overlord's projectile attacks and other abilities.
| `src/scenes/` | Contains the Main Menu, Game Scene Game Over scenes and Level Completion Scenes. |
| `src/defenders/` | Contains defender classes such as Shooter, Generator, Barricade Dual Barrel Cryo Gunner, Landmine, Scrapper, Drone, Hijacker and OverLord Boss. |
| `src/enemies/` | Contains Melee, Ranged and Crusher enemy classes, Overlord Boss enemy classes including their movement and combat behaviour. |
| `src/grid/` | Manages the battlefield grid, individual cells and defender placement. |
| `src/managers/` | Contains gameplay managers inclduing energy management and WaveManager for enemy spawning and wave progression. |
| `src/systems/` | Handles collision detection and combat interactions. |
| `src/objects/` | Contains game objects such as the Stronghold and projectiles. |
| `src/ui/` | Contains the defender selection toolbar, cooldown indicators and defender upgrade menu. |
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
The configuration also allows gameplay values to be adjusted as new defenders, enemies and levels are added.

The Excel configuration now also includes individual defender upgrade costs and Level 2 multipliers.
- Each defender has its own upgrade energy cost
- Damage multipliers control Level 2 attacking defenders
- Health multipliers control the Barricade upgrade
- Energy production multipliers control the Generator upgrade
- Scrapper statistics are also included in the spreadsheet
These values are exported to CSV and used by the game, making it easier to balance defender upgrades without changing the main gameplay code.


## 5 Game Features


### 5.1 Implemented Features

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
| Cryo Gunner Defender | 2 | Additional attacking defender. | Implemented |
| Landmine Defender | 2 | Defensive unit placed on the battlefield. | Implemented |
| Scrapper Defender | 2 | Additional defender available to the player. | Implemented |
| Overlord Boss | 3 | Final Boss Enemy in Level 5. | Implemented |
| Passive Energy Regeneration | 2 | Automatically generates energy over time. | Implemented |
| Wave Display and Intermissions | 2 | Displays the current wave and allows preparation between waves. | Implemented |
| Drag and Drop | 2 | Allows defenders to be dragged onto the grid. | Implemented |
| Placement Preview | 2 | Highlights available cells during placement. | Implemented |
| Defender Recall | 2 | Removes placed units and frees up grid cells. | Implemented |
| Full Wave System | 2 | Introduce numbered waves and wave progression. | Implemented |
| Victory Conditions | 3 | Introduce objectives that allow the player to win. | Implemented |
| Level Completion Screen | 3 | Display a completion screen when the player successfully finishes a level. | Implemented |
| Multiple Levels | 3 | Add additional levels with increasing difficulty. | Implemented |
| Defender Upgrade System | 2 | Allow placed defenders to upgrade from Level 1 to Level 3 using energy. | Implemented |
| Defender Upgrade Menu | 2 | Display upgrade costs and MAX LEVEL when fully upgraded. | Implemented |
| Defender Upgrade Indicators | 2 | Display visual indicators for Level 2 and Level 3 defenders. | Implemented |
| Defender Upgrade Costs | 2 | Use individual upgrade costs from the Excel spreadsheet. | Implemented |
| Level 2 Damage Upgrades | 2 | Increase damage for Shooter, Dual Barrel, Cryo Gunner, Landmine and Scrapper. | Implemented |
| Generator and Barricade Upgrades | 2 | Increase Generator energy production and Barricade health by 1.5x. | Implemented |
| Defender Selling | 2 | Refund 50% of placement energy when recalling defenders. | Implemented |
| Defender Unlock System | 3 | Unlock additional defenders as the player progresses through levels. | Implemented |
| Locked Defender Indicators | 3 | Show which defenders are currently locked in the toolbar. | Implemented |
| Increasing Enemy Difficulty | 2 | Increase enemy difficulty as the player progresses through levels. | Implemented |
| Battlefield Redesign | 2 | Updated the battlefield background and grid alignment. | Implemented |
| Stronghold Redesign | 2 | Added a separate stronghold image with adjustable size and position. | Implemented |
| Overlord Boss Stages | 3 | Added four boss stages with increasing difficulty. | Implemented |
| Overlord Shield System | 3 | Added shields at 75%, 50% and 25% health. | Implemented |
| Boss Reinforcements | 3 | Summons additional enemies during shield phases. | Implemented |
| Boss Visual Effects | 2 | Added shield outlines and colour changes between boss stages. | Implemented |
| Boss Music | 2 | Added separate music for the boss fight. | Implemented |
| Boss Laser Attack | 3 | Laser attack that targets a battlefield row. | In Progress |
| Wave Progress Bar | 2 | Displays progress through the current enemy wave. | Implemented |
| Level Indicator | 2 | Displays the player's current level during gameplay. | Implemented |
| Early Wave Start | 2 | Allows players to start waves early for bonus energy. | Implemented |
| Insufficient Energy Feedback | 2 | Displays feedback when the player does not have enough energy. | Implemented |
| Level 3 Defender Upgrades | 2 | Adds special abilities when defenders reach Level 3. | Implemented |
| Shooter Electric Chain | 2 | Level 3 Shooter gains an electric chain attack. | Implemented |
| Dual Barrel Explosive Rounds | 2 | Level 3 Dual Barrel gains explosive rounds. | Implemented |
| Cryo Gunner Freeze | 2 | Level 3 Cryo Gunner can freeze enemies. | Implemented |
| Landmine Blast | 2 | Level 3 Landmine gains a blast ability. | Implemented |
| Barricade Self Repair | 2 | Level 3 Barricade can repair itself. | Implemented |
| Scrapper Rapid Recovery | 2 | Level 3 Scrapper gains rapid recovery. | Implemented |
| Generator Energy Jackpot | 2 | Level 3 Generator gains an energy jackpot ability. | Implemented |
| Level 3 Visual Indicator | 2 | Displays a new indicator for Level 3 defenders. | Implemented |
| Defender Move Button | 2 | Adds a move defender button to the toolbar. | Implemented |



### 5.2 Planned Features

| Feature | Priority | Description | Status |
|---|:---:|---|---|
| Gameplay Balancing | 2 | Adjust gameplay values to improve the overall game balance. | Planned |
| Defender Costs and Cooldowns | 2 | Adjust defender energy costs and placement cooldowns using the Excel spreadsheet. | Planned |
| Pause and Resume | 2 | Allow players to pause and resume the game. | Planned |
| Defender Repositioning | 2 | Allow players to move placed defenders to another available grid cell. | In Progress |


## 6 Development Progress

Completed development work includes:

- Project setup
- Battlefield grid and cell management
- Shooter, Generator, Barricade, and Dual Barrel defenders
- Melee, Ranged, and Crusher enemies
- Projectile collision detection
- Energy management and collection
- Health bar for enemies, defenders and the Stronghold
- Stronghold retaliation against close-range attackers
- Defender placement cooldowns and visual countdown indicators
- Main menu and Game Over scenes
- Stronghold destruction and restart functionality
- Sound effects and destruction animations
- Excel to CSV gameplay configuration
- WaveManager integration for enemy spawn logic
- Full wave progression system with wave display and intermissions
- Five levels with level completion and victory conditions
- Overlord Boss added to the final wave of Level 5
- Cryo Gunner, Landmine and Scrapper defenders
- Defender drag and drop with placement preview
- Defender recall system for removing placed units
- Passive energy regeneration
- Separate projectile statistics for Dual Barrel
- Improved enemy detection and collision handling
- Fixed energy pickup and defender placement bugs
- Refactored GameScene and collision code
- Refactored passive energy, drag and drop and energy HUD into separate classes
- Implemented Level 1 to Level 2 defender upgrades
- Added a clickable defender upgrade menu
- Added individual defender upgrade costs using Excel and CSV
- Added green Level 2 indicators and MAX LEVEL messages
- Implemented 1.5x damage upgrades for attacking defenders
- Added 1.5x energy production for upgraded Generators
- Added 1.5x maximum health for upgraded Barricades
- Added Scrapper upgrade settings to the Excel configuration
- Fixed defender upgrade menu click handling
- Implemented a 50% energy refund when recalling defenders
- Added level-based defender unlocking and locked toolbar indicators
- Added Hijacker and Drone enemy types
- Integrated new enemy types into wave progression
- Added level-based enemy difficulty scaling
- Updated the battlefield background and grid alignment
- Created a separate Stronghold image with adjustable size and position
- Added four Overlord boss stages with increasing difficulty
- Added shield phases at 75%, 50% and 25% boss health
- Added enemy reinforcements during boss shield phases
- Added visual effects for boss shields and stage changes
- Worked on the Overlord laser attack system
- Added separate boss battle music
- Organised boss mechanics into separate TypeScript classes
- Added Level 3 upgrades with special abilities for all seven defenders
- Added electric chain attacks for the Level 3 Shooter
- Added explosive rounds for the Level 3 Dual Barrel
- Added freezing attacks for the Level 3 Cryo Gunner
- Added blast and self-repair abilities for Landmine and Barricade
- Added rapid recovery for Scrapper and energy jackpot for Generator
- Added Level 3 defender visual indicators
- Added a wave progress bar
- Added a level indicator during gameplay
- Added an option to start waves early for bonus energy
- Added feedback when the player has insufficient energy
- Added a move defender button and started implementing defender repositioning



## 7 Game Screenshots

The following screenshots show the current state of SURGE and some of the gameplay features that have been implemented.

### 7.1 Main Menu
<img width="1825" height="1012" alt="image" src="https://github.com/user-attachments/assets/318b7ed1-abf8-48a4-9ac5-ba0db93dc6e5" />


### 7.2 Gameplay
<img width="949" height="537" alt="image" src="https://github.com/user-attachments/assets/2e9eb255-4b4a-4b5e-93f1-931e98127f8a" />

### 7.3 Wave Progression
<img width="235" height="96" alt="image" src="https://github.com/user-attachments/assets/84a3eacb-a771-475a-92a8-442d77a2fd76" />

### 7.4 Overlord Boss
<img width="202" height="246" alt="image" src="https://github.com/user-attachments/assets/e091e1bb-ea1f-4243-be13-eab09fb05d43" />

### 7.5 Level Completion
<img width="1565" height="882" alt="LevelComplete" src="https://github.com/user-attachments/assets/a4e8e867-fc7b-4039-b334-0c0cd75ff8e6" />

### 7.6 Victory Screen
<img width="1427" height="842" alt="Victory" src="https://github.com/user-attachments/assets/a2e3dbcf-a62e-426c-b019-ce0c44c6e8c3" />

### 7.7 Defender Upgrade Menu
<img width="1630" height="895" alt="image" src="https://github.com/user-attachments/assets/e27ab62f-c47d-4fad-8cac-cd6db0d35d35" />

### 7.8 Level 2 Defender - MAX LEVEL
<img width="1680" height="967" alt="image" src="https://github.com/user-attachments/assets/f131bc42-b51b-4ee7-9355-d0fbd0559ed7" />

### 7.9 Defender Unlock System
<img width="1706" height="985" alt="image" src="https://github.com/user-attachments/assets/9aa11586-3d52-4b68-85d1-8d69e1c5b985" />



## 8 Gameplay Hints and Tips

Here are some tips to help players defend their Stronghold:

- Place Generators early to produce additional energy.
- Use Shooters and Dual Barrels to attack approaching enemies.
- Place Barricades in front of attacking defenders to protect them.
- Collect energy pickups whenever they appear.
- Keep an eye on defender placement cooldowns.
- Use the recall button to remove defenders that are no longer needed.
- Prepare your defence during the breaks between waves.
- Try different defender combinations when dealing with stronger enemies.
- Make sure all five lanes are defended when fighting the Overlord Boss.
- Upgrade defenders to Level 2 to increase their effectiveness.
- Upgrade Generators to produce 1.5x more energy.
- Upgrade Barricades to increase their health by 1.5x.
- Use Level 2 Scrappers against Crushers for additional damage.
- Recall defenders that are no longer needed to receive a 50% energy refund.
- Save enough energy for upgrades as enemy waves become more difficult.
- Unlock additional defenders by progressing through levels.


## 9 Development Team

SURGE is being developed as part of our Game Development project.

The team members are:

- Vladyslav Brykaylo B00162071
- Matas Zostautas B00163914
- Mateusz Kietrys B00160065


## 10 Resources and Credits

### 10.1 Core Technologies and Development Resources

- Phaser Official Documentation : https://docs.phaser.io/
  Main framework used for game objects, scenes, input, graphics, movement and sound.

- Phaser 4 Learning Guide - Matt Smith : https://docs.phaser.io/
  Educational reference covering Phaser 4, TypeScript, Deno, scenes, game loops and game development with Celbridge.

- TypeScript Handbook - Classes: https://www.typescriptlang.org/docs/handbook/2/classes.html
  Relevant to the inheritance structure used by Enemy, Defender and their subclasses.
  
- TypeScript Handbook - Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  Type checking and instanceof, used to distinguish different defender and enemy behaviours.

- TypeScript Handbook - Everyday Types: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
  Arrays, object types, interfaces types used throughout the project.

- Deno Documentation - Configuration: https://docs.deno.com/runtime/fundamentals/configuration/
  Project tasks, import mappings and the deno.json configuration.


- Deno Documentation - Type Checking: https://docs.deno.com/runtime/reference/cli/check/
  Reference for checking TypeScript code with deno check.
  
- Deno Documentation - Linting: https://docs.deno.com/runtime/reference/cli/lint/
  Code-quality checks using deno lint.

### 10.2 Phase Game Systems and Methods

- Scene Management: https://docs.phaser.io/phaser/concepts/scenes
  Main Menu, Game Scene, Game Over and Level Completion transitions.
  
- Game Objects: https://docs.phaser.io/phaser/concepts/gameobjects
  Creating and controlling defenders, enemies, projectiles and UI objects.
  
- Input and Dragging: https://docs.phaser.io/phaser/concepts/input
  Defender selection, drag-and-drop placement, grid interactions and energy collection.
  
- Geometry and Intersection Detection: https://docs.phaser.io/phaser/concepts/geometry
  Detecting collisions between projectiles, enemies, defenders and the Stronghold using rectangle intersection checks.
  
- Timers and Delayed Events: https://docs.phaser.io/phaser/concepts/time
  Defender firing cooldowns, enemy attacks, generator production, wave intermissions and delayed actions.
  
- Event Handling: https://docs.phaser.io/phaser/concepts/events
  Communication between gameplay systems using events and callbacks, including projectile creation and level progression.

- Graphics: https://docs.phaser.io/phaser/concepts/gameobjects/graphics
  Drawing health bars, placement indicators, outlines and other gameplay UI elements.
  
- Tweens: https://docs.phaser.io/phaser/concepts/tweens
  Visual effects such as explosions, fading and other animated changes to game objects.

- Asset Loading: https://docs.phaser.io/phaser/concepts/loader
  Loading defender sprites, enemy textures, backgrounds, projectiles and sound effects.

- Audio: https://docs.phaser.io/phaser/concepts/audio
  Playing background music and sound effects, including volume adjustments.

- Scale Manager: https://docs.phaser.io/phaser/concepts/scale-manager
  Adjusting the game display to fit the available browser or preview window.

### 10.3 Gameplay Logic

- Random Number Generator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  Random enemy selection and the probability of energy pickups being dropped.

- Finite State Machines: https://gameprogrammingpatterns.com/state.html
  The HijackerEnemy uses different phases for waiting, descending, grabbing, ascending and escaping.

- Observer and Event Driven Gameplay Logic: https://gameprogrammingpatterns.com/observer.html
  Using events instead of requiring all functionality to be handled in one class.

- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  Loading external gameplay configuration files when the game starts.

- JavaScript Timers: https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
  Used for repeated timed callbacks, including some destruction animation behaviour.

- Python CSV Module: https://docs.python.org/3/library/csv.html Exporting Excel gameplay values into CSV files for use by the game.


### 10.4 Weighted Enemy Spawning and Wave Budgets
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

### 10.5 Grid Placement and Collision Detection
- https://docs.phaser.io/phaser/concepts/geometry

### 10.6 Gameplay Inspiration
- https://www.ea.com/games/plants-vs-zombies/plants-vs-zombies


### 10.7 Defender Upgrade System
- Phaser Input: https://docs.phaser.io/phaser/concepts/input
  Used for detecting clicks on placed defenders and opening the upgrade menu.

- TypeScript Classes: https://www.typescriptlang.org/docs/handbook/2/classes.html
  Used for organising defender upgrade logic into separate classes.

- Python CSV Module: https://docs.python.org/3/library/csv.html
  Used for exporting defender upgrade costs and multipliers from Excel into CSV files.
  

## 11 Licence

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
