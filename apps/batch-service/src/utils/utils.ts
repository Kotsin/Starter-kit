export function measurePerformance(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    const start = process.hrtime.bigint();
    const result = await originalMethod.apply(this, args);
    const end = process.hrtime.bigint();

    const executionTime = Number(end - start) / 1e6;

    console.log(
      `Method "${propertyKey}" executed in ${executionTime.toFixed(2)} ms`,
    );

    return result;
  };

  return descriptor;
}
