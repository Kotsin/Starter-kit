import { RmqRecordBuilder } from '@nestjs/microservices';
import { RmqRecordOptions } from '@nestjs/microservices/record-builders/rmq.record-builder';

export async function createRmqMessage(
  traceId: string,
  serviceToken: string,
  request?: any,
  opts?: RmqRecordOptions,
): Promise<any> {
  const headers = {
    traceId,
    'x-service-token': serviceToken,
  };
  let messageBody: any;

  if (
    request !== undefined &&
    request !== null &&
    typeof request === 'object'
  ) {
    messageBody = {
      ...request,
      traceId,
    };
  } else {
    messageBody = request;
  }

  return new RmqRecordBuilder(messageBody)
    .setOptions({
      headers,
      ...opts,
    })
    .build();
}
