import { sqrt } from "mathjs"

export default class Point3D {
    constructor(public x: number, public y: number, public z: number) {}
    
    static fromString(def: string): Point3D {
        const [x, y, z] = def.split(',')
        return new Point3D(+x, +y, +z)
    }

    toWastl(): string {
        return `${this.x},${this.y},${this.z}`
    }

    clooney(): Point3D {
        return new Point3D(this.x, this.y, this.z)
    }

    add(other: Point3D): Point3D {
        return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z)
    }

    subtract(other: Point3D): Point3D {
        return this.add(other.scale(-1))
    }

    scale(factor: number): Point3D {
        return new Point3D(this.x*factor, this.y*factor, this.z*factor)
    }
    
    toArray(): number[] {
        return [this.x, this.y, this.z]
    }
}