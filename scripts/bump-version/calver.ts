export class CalVer {
  year: number;
  month: number;
  day: number;
  micro?: number;

  constructor(date: Date) {
    this.year = date.getUTCFullYear();
    this.month = date.getUTCMonth() + 1;
    this.day = date.getUTCDate();
  }

  toString() {
    return [this.year, this.month, this.day, this.micro].filter(Boolean).join(
      ".",
    );
  }

  bump(from: string) {
    const [year, month, day, micro] = from.split(".").map((num) =>
      Number.parseInt(num)
    );
    if (this.year === year && this.month === month && this.day === day) {
      this.micro = (micro ?? 0) + 1;
    }
  }
}
