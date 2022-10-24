import { Consumer } from 'mediasoup-client/lib/Consumer';

export interface Peer {
  uid: string;
  consumer: Consumer;
}
