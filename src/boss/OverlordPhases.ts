export class OverlordPhases {
    phase = 1;
    shieldActive = false;

    update(health: number, maxHealth: number): boolean {
        if (this.shieldActive || this.phase >= 4) return false;

        const healthPercent = health / maxHealth;
        const threshold = 1 - this.phase * 0.25;

        if (healthPercent > threshold) return false;

        this.shieldActive = true;
        return true;
    }

    completeShield(): void {
        if (!this.shieldActive) return;

        this.shieldActive = false;
        this.phase++;
    }
}
