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
import { GatewayEvents } from 'src/types/events';
import { CommunicationEvents } from 'src/types/events';

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
    client.data.username = client.handshake.query.name;
    console.log('This client just connected: ', client.data.username);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected:', client.id);
    this.liveService.msDisconnectionCleanup(client);
    this.liveService.interviewDisconnectionCleanup(client);
  }

  // ---------- interview endpoints --------------

  @SubscribeMessage(GatewayEvents.JOIN_GROUP)
  async handleJoinRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() type: 'interviewer' | 'candidate',
  ) {
    if (type === 'interviewer') {
      return client.join(interviewerGroup);
    }
    this.waitingListService.addToWaitingList(client.id);
    await client.join(candidateGroup);
    await this.liveService.announceNewCandidate(client);
  }

  @SubscribeMessage(GatewayEvents.NEXT_CANDIDATE)
  async handleNextCandidateRequest() {
    const nextCandidate = this.waitingListService.getNextCandidate();

    this.liveService.removeCurrentCandidate();

    console.log('next candidate', nextCandidate);
    nextCandidate
      ? this.liveService.announceMovingToNextCandidate(nextCandidate)
      : this.socketService.send(
          interviewerGroup,
          CommunicationEvents.NO_CANDIDATE,
        );
  }

  @SubscribeMessage(GatewayEvents.GET_CANDIDATE_LIST)
  getCandidateList() {
    return this.waitingListService.getWaitingList();
  }

  @SubscribeMessage(GatewayEvents.LEAVE_WAITING_LIST)
  removeFromWaitingList(@ConnectedSocket() client: Socket) {
    this.waitingListService.removeCandidate(client.id);

    this.socketService.updateCandidateStatistics(
      this.waitingListService.getWaitingList(),
    );

    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.REMOVE_FROM_WAITING,
      client.id,
    );
  }

  // ---------- mediasoup endpoints --------------

  @SubscribeMessage(GatewayEvents.SETUP_TRANSPORT)
  async setupTransport(
    @MessageBody() body: { setUpMode: string },
    @ConnectedSocket() client,
  ) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.setupTransport(setUpMode, client);
    return setUpParams;
  }

  @SubscribeMessage(GatewayEvents.CONNECT_TRANSPORT)
  async connectTransport(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters, transportId } = body;
    return this.msService.connectTransport(dtlsParameters, transportId);
  }

  @SubscribeMessage(GatewayEvents.PRODUCE)
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
      .emit(CommunicationEvents.NEW_PRODUCER, producerId);

    return producerId;
  }

  @SubscribeMessage(GatewayEvents.JOIN_INTERVIEW_ROOM)
  async transportConsume(
    @MessageBody() body,
    @ConnectedSocket() client: Socket,
  ) {
    const { rtpCapabilities, transportId } = body;
    return this.msService.joinRoom(rtpCapabilities, transportId, client);
  }

  @SubscribeMessage(GatewayEvents.GET_NEW_PRODUCER)
  async getNewProducer(@MessageBody() body, @ConnectedSocket() client: Socket) {
    const { producerId, rtpCapabilities, transportId } = body;
    return this.msService.getNewProducer(
      producerId,
      transportId,
      rtpCapabilities,
      client,
    );
  }

  @SubscribeMessage(GatewayEvents.RESUME_CONSUMER)
  async resumeConsumer(@MessageBody() body): Promise<boolean> {
    const { consumerId } = body;
    return this.msService.resumeConsumer(consumerId);
  }
}
