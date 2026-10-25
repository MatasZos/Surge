import type { Defender } from "../defenders/Defender.ts";
export class Cell {
    occupant: Defender | null;

    constructor() {
        this.occupant = null;
    }

    setOccupant(o: Defender | null): void {
        this.occupant = o;
    }

    clear(): void {
        this.occupant = null;
    }

    isEmpty(): boolean {
        return this.occupant === null;
    }
}
