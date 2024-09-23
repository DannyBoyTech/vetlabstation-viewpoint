interface RandomNumOptions {
  minIncl?: number;
  maxExcl: number;
  intsOnly?: boolean;
}

type NumberRange = Omit<RandomNumOptions, "intsOnly">;

/**
 * Generates a random number (not necessarily integer) in [minIncl, maxExcl).
 *
 * @param options
 * @returns random number in range as specified via options
 */
function randomNum(options: RandomNumOptions): number {
  const intsOnly = options.intsOnly ?? false;
  const min =
    options.minIncl == null
      ? 0
      : intsOnly
      ? Math.ceil(options.minIncl)
      : options.minIncl;
  const max = intsOnly ? Math.floor(options.maxExcl) : options.maxExcl;

  if (min >= max) {
    throw Error("maximum of range must be greater than its minimum");
  }

  const val = Math.random() * (max - min) + min;

  return intsOnly ? Math.floor(val) : val;
}

/**
 * Generates a random double in range [minIncl, maxExcl).
 */
function randomDouble(range: NumberRange): number {
  return randomNum({ ...range, intsOnly: false });
}

/**
 * Generates a random integer in range [minIncl, maxExcl).
 */
function randomInteger(options: NumberRange): number {
  return randomNum({ ...options, intsOnly: true });
}

/**
 * Generates an array of values by calling the passed value function the
 * specified number of times.
 *
 */
const randomArrayOf = <T>({
  length = randomInteger({ maxExcl: 50 }),
  valueFn,
}: {
  length?: number;
  valueFn: (index: number) => T;
}): T[] => Array.from({ length }, (_, i) => valueFn(i));

/**
 * Selects a random item from the provided array.
 *
 * @param items array of possible selections
 * @returns a random item from the array
 */
const randomFrom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)] as T;

/**
 * Generates a string of digits with the specified length in digits.
 *
 * @param length
 * @returns
 */
function randomNumericString(length: number) {
  if (length <= 0) return "";

  let str = "";
  for (let i = 0; i < length; i++) {
    str += randomInteger({ minIncl: 0, maxExcl: 10 });
  }

  return str;
}

export type { NumberRange };
export {
  randomInteger,
  randomDouble,
  randomFrom,
  randomArrayOf,
  randomNumericString,
};
