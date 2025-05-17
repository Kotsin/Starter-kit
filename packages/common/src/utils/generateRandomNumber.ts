/**Generate random number between min(inclusive) and max(exclusive) parameters
 * @param min left border of range default(1)
 * @param max right border of range default(10)
 * */

export function generateRandomNumber(min = 1, max = 10): number {
  if (!min || !max) {
    console.error(
      `Undefined parameter: min=${min}, max=${max}`,
      'generateRandomNumber',
    );
  }

  let result = Math.floor(Math.random() * (max - min + 1)) + min;

  if (result < 1) {
    console.error(
      `Generated number less then 1, min=${min}, max=${max}, result=${result}`,
    );
    result = 1;
  }

  return result;
}
