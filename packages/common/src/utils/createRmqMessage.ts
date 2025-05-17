import { RmqRecordBuilder } from '@nestjs/microservices';
import { RmqRecordOptions } from '@nestjs/microservices/record-builders/rmq.record-builder';

export async function createRmqMessage(
  traceId: string,
  request?: any,
  opts?: RmqRecordOptions,
): Promise<any> {
  return new RmqRecordBuilder(request)
    .setOptions({
      headers: {
        traceId,
      },
      ...opts,
    })
    .build();
}
