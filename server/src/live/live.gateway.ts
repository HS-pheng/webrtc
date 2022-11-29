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
import { GatewayEvents } from 'src/constants/events';
import { CommunicationEvents } from 'src/constants/events';
import { candidateInfo, IPeerInfo } from 'src/constants/types';
import { extrackHandshakeData } from 'src/utils/utils';

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
    client.data.handshakeData = extrackHandshakeData(
      client.handshake.query,
    ) as IPeerInfo;
    console.log('Client connected: ', client.data.handshakeData.username);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('Client disconnected:', client.id);
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

    const candidateInfo: candidateInfo = {
      id: client.id,
      username: client.data.handshakeData.username,
    };
    this.waitingListService.addToWaitingList(candidateInfo);
    await client.join(candidateGroup);
    await this.liveService.announceNewCandidate(client);
  }

  @SubscribeMessage(GatewayEvents.NEXT_CANDIDATE)
  async handleNextCandidateRequest() {
    const nextCandidate = this.waitingListService.getNextCandidate();

    this.liveService.removeCurrentCandidate();

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
    const candidateId = client.id;
    this.waitingListService.removeCandidate(candidateId);

    this.socketService.updateCandidateStatistics(
      this.waitingListService.getWaitingList(),
    );

    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.REMOVE_FROM_WAITING,
      client.id,
    );
  }

  @SubscribeMessage(GatewayEvents.GET_PEERS_INFO)
  async getPeersInfo(@ConnectedSocket() client: Socket) {
    return this.socketService.getPeersInfoExcept(client);
  }

  // ---------- mediasoup endpoints --------------
  @SubscribeMessage(GatewayEvents.SETUP_TRANSPORT)
  async setupTransport(
    @MessageBody() body: { setUpMode: 'send' | 'recv' | 'both' },
    @ConnectedSocket() client: Socket,
  ) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.setupTransport(setUpMode, client);
    return setUpParams;
  }

  @SubscribeMessage(GatewayEvents.CONNECT_TRANSPORT)
  async connectTransport(@MessageBody() body: any): Promise<boolean> {
    const { dtlsParameters, transportId } = body;
    return this.msService.connectTransport(dtlsParameters, transportId);
  }

  @SubscribeMessage(GatewayEvents.PRODUCE)
  async produce(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ): Promise<string | null> {
    const { transportId, ...params } = body;
    const producerId = await this.msService.produce(params, transportId);

    this.socketService.toInterviewRoomExceptSender(
      client,
      CommunicationEvents.NEW_PEER_INFO,
      { info: client.data.handshakeData, id: client.id },
    );

    this.socketService.toInterviewRoomExceptSender(
      client,
      CommunicationEvents.NEW_PRODUCER,
      producerId,
    );

    return producerId;
  }

  @SubscribeMessage(GatewayEvents.JOIN_INTERVIEW_ROOM)
  async transportConsume(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { rtpCapabilities, transportId } = body;
    return this.msService.joinRoom(rtpCapabilities, transportId, client);
  }

  @SubscribeMessage(GatewayEvents.GET_NEW_PRODUCER)
  async getNewProducer(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { producerId, rtpCapabilities, transportId } = body;
    return this.msService.getNewProducer(
      producerId,
      transportId,
      rtpCapabilities,
      client,
    );
  }

  @SubscribeMessage(GatewayEvents.MEDIA_STATE_CHANGED)
  async toggleMediaProducer(
    @MessageBody() body: { producerId: string; state: 'on' | 'off' },
    @ConnectedSocket() client: Socket,
  ) {
    const { producerId, state } = body;

    await this.msService.toggleProducer(producerId, state, client);

    this.socketService.toInterviewRoomExceptSender(
      client,
      CommunicationEvents.PEER_PRODUCER_STATE_CHANGED,
      {
        peerId: client.id,
        producerId,
        state,
      },
    );
  }

  @SubscribeMessage(GatewayEvents.RESUME_CONSUMER)
  async resumeConsumer(@MessageBody() body: any): Promise<boolean> {
    const { consumerId } = body;
    return this.msService.resumeConsumer(consumerId);
  }
}
