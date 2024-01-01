export function padNumber(x: number): string {
    return `${x.toString().padStart(2, '0')}`
}

export function firstMissingInSequence(sequence: number[]) {
    const missingValue = sequence.findIndex((x, i) => x != i + 1)

    return missingValue >= 0 ? missingValue + 1 : sequence.length + 1
}