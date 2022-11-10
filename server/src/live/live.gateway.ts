import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
} from '@nestjs/websockets';
import { SocketService } from '../socket/socket.service';
import { Socket, Server } from 'socket.io';
import { MsService } from 'src/mediasoup/ms.service';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { interviewerGroup, candidateGroup } from 'src/socket/socket.constant';
import { LiveService } from './live.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LiveGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly socketService: SocketService,
    private readonly msService: MsService,
    private readonly waitingListService: WaitingListService,
    private readonly liveService: LiveService,
  ) {}

  afterInit(server: Server) {
    this.socketService.injectServer(server);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected:', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected:', client.id);
    this.liveService.msDisconnectionCleanup(client);
    this.liveService.interviewDisconnectionCleanup(client);
  }

  // ---------- interview endpoints --------------

  @SubscribeMessage('join-interviewer-group')
  async joinInterviewerGroup(@ConnectedSocket() client: Socket) {
    client.join(interviewerGroup);
  }

  @SubscribeMessage('join-candidate-group')
  async handleNewCandidate(@ConnectedSocket() client: Socket) {
    this.waitingListService.addToWaitingList(client.id);
    await client.join(candidateGroup);
    await this.liveService.announceNewCandidate(client);
  }

  @SubscribeMessage('next-candidate')
  async handleNextCandidateRequest() {
    const nextCandidate = this.waitingListService.getNextCandidate();

    this.liveService.removeCurrentCandidate();

    nextCandidate
      ? this.liveService.announceMovingToNextCandidate(nextCandidate)
      : this.socketService.send(interviewerGroup, 'no-candidate');
  }

  @SubscribeMessage('get-candidate-list')
  getCandidateList() {
    return this.waitingListService.getWaitingList();
  }

  @SubscribeMessage('leave-waiting-list')
  removeFromWaitingList(@ConnectedSocket() client: Socket) {
    this.waitingListService.removeCandidate(client.id);
    this.socketService.updateCandidateStatistics(
      this.waitingListService.getWaitingList(),
    );
    this.socketService.send(interviewerGroup, 'remove-from-waiting', client.id);
  }

  // ---------- mediasoup endpoints --------------

  @SubscribeMessage('setup-transport')
  async setupTransport(
    @MessageBody() body: { setUpMode: string },
    @ConnectedSocket() client,
  ) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.setupTransport(
      setUpMode,
      client.id,
    );
    return setUpParams;
  }

  @SubscribeMessage('connect-transport')
  async connectTransport(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters, transportId } = body;
    return this.msService.connectTransport(dtlsParameters, transportId);
  }

  @SubscribeMessage('produce')
  async produce(
    @MessageBody() body,
    @ConnectedSocket() client: Socket,
  ): Promise<string | null> {
    const { transportId, ...params } = body;
    const producerId = await this.msService.produce(params, transportId);

    const currentCandidate = this.waitingListService.currentCandidate;
    client
      .to(interviewerGroup)
      .to(currentCandidate)
      .emit('new-producer', producerId);

    return producerId;
  }

  @SubscribeMessage('join-interview-room')
  async transportConsume(@MessageBody() body, @ConnectedSocket() client) {
    const { rtpCapabilities, transportId } = body;
    return this.msService.joinRoom(rtpCapabilities, transportId, client.id);
  }

  @SubscribeMessage('get-new-producer')
  async getNewProducer(@MessageBody() body, @ConnectedSocket() client) {
    const { producerId, rtpCapabilities, transportId } = body;
    return this.msService.getNewProducer(
      producerId,
      transportId,
      rtpCapabilities,
      client.id,
    );
  }

  @SubscribeMessage('resume-consumer')
  async resumeConsumer(@MessageBody() body): Promise<boolean> {
    const { consumerId } = body;
    return this.msService.resumeConsumer(consumerId);
  }
}
