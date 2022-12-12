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
  isInterviewer: string;
}

export interface IPeer {
  peerInfo: IPeerInfo;
  consumers: Consumer[];
  displayConsumer: Consumer | null;
}

export interface candidateStats {
  listNumber: string;
  candidateListSize: string;
}

export interface candidateInfo {
  id: string;
  username: string;
}

export interface ListingInfo {
  id: string;
  title: string;
  description: string;
}
