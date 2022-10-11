import { Injectable } from '@nestjs/common';
import { createWorker } from 'mediasoup';

@Injectable()
export class AppService {
  async getHello() {
    // Test
    const worker = await createWorker();
    const server = await worker.createWebRtcServer({ listenInfos: [{ ip: '127.0.0.1', protocol: 'udp', port: 40000 }] })
    const router = await worker.createRouter()
    const transport = await router.createWebRtcTransport({ webRtcServer: server })
    console.warn(transport)
    return 'Hello World!!';
  }
}
