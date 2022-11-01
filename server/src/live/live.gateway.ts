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
import { InterviewService } from 'src/interview/interview.service';

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
    private readonly interviewService: InterviewService,
  ) {}

  afterInit(server: Server) {
    this.socketService.injectServer(server);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected: ', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected: ', client.id);
    this.msService.closeUserTransports(client.id);
    client.broadcast.emit('producer-closed', client.id);

    this.interviewService.removeCandidate(client.id);
    this.socketService.broadcastToInterviewerGroup(
      'candidate-closed',
      client.id,
    );

    this.socketService.updateCandidateStatistics(
      this.interviewService.getWaitingList(),
    );
  }

  // ---------- interview endpoints --------------

  @SubscribeMessage('join-interviewer-group')
  async joinInterviewerGroup(@ConnectedSocket() client: Socket) {
    this.socketService.joinInterviewerGroup(client);
  }

  @SubscribeMessage('join-candidate-group')
  handleNewCandidate(@ConnectedSocket() client: Socket) {
    this.interviewService.addToWaitingList(client.id);
    this.socketService.joinCandidateGroup(client);

    // inform new-candidate statistics to every candidate in candidate-group
    const updatedCandidateList = this.interviewService.getWaitingList();
    this.socketService.updateCandidateStatistics(updatedCandidateList);

    this.socketService.broadcastToInterviewerGroup('new-candidate', client.id);
  }

  @SubscribeMessage('next-candidate')
  async handleBeginInterviewRequest() {
    const nextCandidate = this.interviewService.getNextCandidate();
    let readyToBegin = false;

    const previousClient = (
      await this.socketService.findSocketById(
        this.interviewService.previousCandidate,
      )
    )?.[0];
    if (previousClient) {
      this.msService.closeUserTransports(previousClient.id);
      this.socketService.server.emit('producer-closed', previousClient.id);
      this.socketService.toCandidate(previousClient.id, 'interview-finished');
    }

    if (nextCandidate) {
      readyToBegin = true;

      this.interviewService.previousCandidate = nextCandidate;
      this.interviewService.removeCandidate(nextCandidate);
      this.socketService.updateCandidateStatistics(
        this.interviewService.getWaitingList(),
      );

      this.socketService.toCandidate(nextCandidate, 'ready-for-interview');
    }
    this.socketService.broadcastToInterviewerGroup(
      'next-candidate',
      readyToBegin,
    );
  }

  @SubscribeMessage('get-candidate-list')
  getCandidateList() {
    return this.interviewService.getWaitingList();
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
    client.broadcast.emit('new-producer', producerId);
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
