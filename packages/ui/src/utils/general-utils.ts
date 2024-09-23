import { range } from "lodash";

/**
 * Braids an array such that the second half of the array is woven into the first half.
 * Useful if you have a sorted list that you want to display within a CSS grid column where the
 * items should display sorted verticallu
 *
 * const arr = [1, 2, 3, 4, 5, 6];
 * const braided = braidArray(arr); // [1, 4, 2, 5, 3, 6]
 *
 * 'arr' would display as
 *
 * 1   2
 * 3   4
 * 5   6
 *
 * 'braided' would instead display as
 *
 * 1  4
 * 2  5
 * 3  6
 */
export function braidArray<T>(arr: T[]): T[] {
  const halfPoint = Math.ceil(arr.length / 2);
  const firstHalf = arr.slice(0, halfPoint);
  const secondHalf = arr.slice(halfPoint);
  const result: T[] = [];
  for (let i = 0; i < Math.max(firstHalf.length, secondHalf.length); i++) {
    if (firstHalf[i] != null) {
      result.push(firstHalf[i]);
    }
    if (secondHalf[i] != null) {
      result.push(secondHalf[i]);
    }
  }
  return result;
}

/**
 * Filters duplicate elements out of an array, preserving original order for
 * the first occurrence of each value.
 */
export const distinct = <T, U extends null | undefined>(ts: T[] | U): T[] | U =>
  ts ? [...new Set<T>(ts)] : ts;

/**
 * Returns the array of natural numbers in the range [1 .. endpoint].
 *
 * @param endpoint - final value in the closed range of natural numbers
 * @returns array of number
 */
export function naturals(endpoint: number): number[] {
  return endpoint < 1 ? [] : range(Math.floor(endpoint)).map((it) => it + 1);
}
