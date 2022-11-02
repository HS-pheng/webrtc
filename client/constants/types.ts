import { Consumer } from 'mediasoup-client/lib/Consumer';

export interface Peer {
  uid: string;
  consumer: Consumer;
}

export interface ICreateConsumer {
  id: string;
  producerId: string;
  kind: 'video' | 'audio';
  rtpParameters: any;
  appData: any;
}

export interface IPeerConsumers {
  audioConsumer?: Consumer;
  videoConsumer?: Consumer;
}

export interface candidateStats {
  listNumber: string;
  candidateListSize: string;
}
