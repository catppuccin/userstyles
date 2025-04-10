export class CalVer {
  year: number;
  month: number;
  day: number;
  micro?: number;

  constructor(date: string) {
    const [year, month, day, micro] = date
      .split(".")
      .map((num) => Number.parseInt(num));
    this.year = year;
    this.month = month;
    this.day = day;
    this.micro = micro ?? undefined;
  }

  toString() {
    return `${this.year}.${this.month.toString().padStart(2, "0")}.${this.day
      .toString()
      .padStart(2, "0")}${this.micro ? "." + this.micro : ""}`;
  }

  incrementWith(date: Date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    if (this.year === year && this.month === month && this.day === day) {
      this.micro = (this.micro ?? 0) + 1;
    } else {
      this.year = year;
      this.month = month;
      this.day = day;
      this.micro = undefined;
    }
  }
}
