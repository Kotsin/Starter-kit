export async function doWithCatch(fn: () => void): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error(e, 'doWithCatch');
  }
}
