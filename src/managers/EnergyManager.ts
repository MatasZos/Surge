export class EnergyManager {

    private energy: number;

    constructor(startingEnergy: number = 200) {
        this.energy = startingEnergy;
    }

    // Get the player's current energy
    getEnergy(): number {
        return this.energy;
    }

    // Check whether the player can afford a defender
    canAfford(cost: number): boolean {
        return this.energy >= cost;
    }

    // Spend energy when placing a defender
    spendEnergy(cost: number): boolean {

        if (!this.canAfford(cost)) {
            return false;
        }

        this.energy -= cost;
        return true;
    }

    // Add energy collected from generators
    addEnergy(amount: number): void {
        this.energy += amount;
    }
}
