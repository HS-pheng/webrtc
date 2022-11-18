import { useCandidateStore } from '~~/stores/useCandidateStore';
import { useHandshakePayload } from '~~/stores/useHandshakePayload';
import { useWaitingStore } from '~~/stores/useWaitingStore';
import { useWebsocket } from '~~/stores/useWebsocket';
import {
  CommunicationEvents,
  BusEvents,
  MsEvents,
} from '~~/constants/socketEvents';
import { NO_CURRENT_CANDIDATE } from '~~/constants/message';
import { usePeerStore } from '~~/stores/usePeerStore';
import { candidateInfo, IPeerInfo } from '~~/constants/types';

export function useSocketConnection() {
  const socketStore = useWebsocket();
  const socket = ref(socketStore.socket);
  const connected = ref(socketStore.connected);
  const candidateStore = useCandidateStore();
  const waitingStore = useWaitingStore();
  const peerStore = usePeerStore();
  const handshakePayload = useHandshakePayload();
  const { $msManager } = useNuxtApp();

  tryOnMounted(() => {
    if (!connected.value) {
      socket.value?.disconnect();

      socketStore.connect({ username: handshakePayload.username });
      socketStore.socket.on('connect', () => {
        connected.value = true;
      });
      socket.value = socketStore.socket;

      subscribeGeneralEventListener();
      subscribeInterviewerEventListener();
      subscribeCandidateEventListener();
      subscribeMediaSoupListener();
    }
  });

  function subscribeInterviewerEventListener() {
    socket.value.on(
      CommunicationEvents.ADD_TO_WAITING,
      (candidate: candidateInfo) => {
        candidateStore.push(candidate);
      },
    );

    socket.value.on(
      CommunicationEvents.CANDIDATE_CLOSED,
      (candidateId: string) => {
        candidateStore.remove(candidateId);
        if (candidateId === candidateStore.currentCandidate.id)
          candidateStore.removeCurrentCandidate();
      },
    );

    socket.value.on(
      CommunicationEvents.REMOVE_FROM_WAITING,
      (candidateId: string) => {
        candidateStore.remove(candidateId);
      },
    );

    socket.value.on(CommunicationEvents.NEXT_CANDIDATE, () => {
      candidateStore.currentCandidate = candidateStore.front();
      candidateStore.shift();
    });

    socket.value.on(CommunicationEvents.NO_CANDIDATE, () => {
      candidateStore.currentCandidate = NO_CURRENT_CANDIDATE;
    });
  }

  function subscribeCandidateEventListener() {
    socket.value.on(CommunicationEvents.READY_FOR_INTERVIEW, () => {
      return navigateTo({
        path: '/room/interview',
        query: {
          interviewer: 'false',
        },
      });
    });

    socket.value.on(CommunicationEvents.CANDIDATE_STATISTIC, (stats) => {
      waitingStore.updateStats(stats);
    });

    socket.value.on(CommunicationEvents.INTERVIEW_FINISHED, () => {
      const interviewEventBroadcaster = useEventBus(BusEvents.INTERVIEW_EVENTS);
      interviewEventBroadcaster.emit(BusEvents.INTERVIEW_FINISHED);
      $msManager.closeTransports();
    });
  }

  function subscribeGeneralEventListener() {
    socket.value.on(
      CommunicationEvents.NEW_PEER_INFO,
      (peer: { id: string; info: IPeerInfo }) => {
        peerStore.addPeerInfo(peer.info, peer.id);
      },
    );
  }

  function subscribeMediaSoupListener() {
    socket.value.on(MsEvents.NEW_PRODUCER, async (producerId) => {
      const consumer = await $msManager.handleNewPeerProducer(producerId);
      peerStore.addPeerConsumer(consumer);
    });

    socket.value.on(MsEvents.PRODUCER_CLOSED, (producerClientId) => {
      peerStore.removePeer(producerClientId);
    });
  }

  function disconnectSocket() {
    socketStore.connected = false;
    socket.value.disconnect();
  }

  return { socket, disconnectSocket, connected };
}
