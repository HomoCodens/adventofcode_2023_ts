export function padNumber(x: number): string {
    return `${x.toString().padStart(2, '0')}`
}