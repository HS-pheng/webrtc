// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { createWorker } from 'mediasoup';
// import { Router } from 'mediasoup/node/lib/Router';
// import { Worker } from 'mediasoup/node/lib/Worker';

// @Injectable()
// export class RouterService implements OnModuleInit {
//   private worker: Worker;
//   private router: Router;
//   async onModuleInit() {
//     this.worker = await createWorker({
//       rtcMinPort: 40000,
//       rtcMaxPort: 40020,
//       logLevel: 'debug',
//       logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx'],
//     });
//     console.log('got here');
//     this.router = await this.worker.createRouter();
//     console.log(this.router.rtpCapabilities);
//   }

//   getRouterRTPCapabilities() {
//     return this.router.rtpCapabilities;
//   }
//   // for getting the router
// }
