import dayjs from "dayjs";

function parseIvlsDob(birthDate?: number[]): string | undefined {
  if (birthDate && birthDate[0] && birthDate[1] && birthDate[2]) {
    const birthDateLocal = dayjs()
      .year(birthDate[0])
      .month(birthDate[1] - 1)
      .date(birthDate[2]);
    return birthDateLocal.format("YYYY-MM-DD");
  }
  return undefined;
}

function toIvlsDob(dob?: string): number[] | undefined {
  if (dob) {
    const parts = dob.split("-");
    if (parts.length === 3) {
      return parts.map((part) => parseInt(part));
    }
  }
  return undefined;
}

export { parseIvlsDob, toIvlsDob };
