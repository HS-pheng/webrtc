import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransport';
import * as mediasoup from 'mediasoup';
import { Router } from 'mediasoup/node/lib/Router';
import { Producer } from 'mediasoup/node/lib/Producer';
import { Consumer } from 'mediasoup/node/lib/Consumer';

export const extractTransportData = (transport: WebRtcTransport) => {
  if (!transport) return undefined;
  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };
};

export const setUpObservers = (): void => {
  mediasoup.observer.on('newworker', (worker) => {
    console.log('new worker created [worker.pid:%d]', worker.pid);

    worker.observer.on('close', () => {
      console.log('worker closed [worker.pid:%d]', worker.pid);
    });

    worker.observer.on('newrouter', (router: Router) => {
      console.log(
        'new router created [worker.pid:%d, router.id:%s]',
        worker.pid,
        router.id,
      );

      router.observer.on('close', () => {
        console.log('router closed [router.id:%s]', router.id);
      });

      router.observer.on('newtransport', (transport: WebRtcTransport) => {
        console.log(
          'new transport created [worker.pid:%d, router.id:%s, transport.id:%s]',
          worker.pid,
          router.id,
          transport.id,
        );

        transport.observer.on('close', () => {
          console.log('transport closed [transport.id:%s]', transport.id);
        });

        transport.observer.on('icestatechange', (icestate) => {
          console.log('transport ICE state changed to', icestate);
        });

        transport.observer.on('newproducer', (producer: Producer) => {
          console.log(
            'new producer created [worker.pid:%d, router.id:%s, transport.id:%s, producer.id:%s]',
            worker.pid,
            router.id,
            transport.id,
            producer.id,
          );

          producer.observer.on('close', () => {
            console.log('producer closed [producer.id:%s]', producer.id);
          });
        });

        transport.observer.on('newconsumer', (consumer: Consumer) => {
          console.log(
            'new consumer created [worker.pid:%d, router.id:%s, transport.id:%s, consumer.id:%s]',
            worker.pid,
            router.id,
            transport.id,
            consumer.id,
          );

          consumer.observer.on('close', () => {
            console.log('consumer closed [consumer.id:%s]', consumer.id);
          });
        });
      });
    });
  });
};

// definition of queue class. should have push, pop, front, back, size methods
export class Queue<T> {
  content: T[] = [];

  constructor(elementArray?: T[]) {
    elementArray?.forEach((e) => this.content.push(e));
  }

  push(e: T) {
    this.content.push(e);
  }

  pop() {
    this.content.shift();
  }

  front() {
    const frontElement = this.content[0];
    if (!frontElement) return null;
    return frontElement;
  }

  back() {
    return this.content[this.content.length - 1];
  }

  size() {
    return this.content.length;
  }

  remove(name) {
    const index = this.content.indexOf(name);
    if (index >= 0) {
      this.content.splice(index, 1);
      return true;
    }
    return false;
  }
}
