import { Consumer } from 'mediasoup-client/lib/Consumer';

export interface ICreateConsumer {
  id: string;
  producerId: string;
  kind: 'video' | 'audio';
  rtpParameters: any;
  appData: any;
}

export interface IPeerInfo {
  username: string;
}

export interface IPeer {
  peerInfo?: IPeerInfo;
  consumers?: Consumer[];
}

export interface candidateStats {
  listNumber: string;
  candidateListSize: string;
}
