import { useCandidateStore } from '~~/stores/useCandidateStore';
import { useHandshakePayload } from '~~/stores/useHandshakePayload';
import { useWaitingStore } from '~~/stores/useWaitingStore';
import { useWebsocket } from '~~/stores/useWebsocket';
import {
  CommunicationEvents,
  BusEvents,
  MsEvents,
} from '~~/constants/socketEvents';
import { EMPTY_CANDIDATE } from '~~/constants/constant';
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

      const { username, isInterviewer } = handshakePayload;
      socketStore.connect({ username, isInterviewer });
      socketStore.socket!.on('connect', () => {
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
    socket.value!.on(
      CommunicationEvents.ADD_TO_WAITING,
      (candidate: candidateInfo) => {
        candidateStore.push(candidate);
      },
    );

    socket.value!.on(
      CommunicationEvents.CANDIDATE_CLOSED,
      (candidateId: string) => {
        candidateStore.remove(candidateId);
        if (candidateId === candidateStore.currentCandidate.id)
          candidateStore.removeCurrentCandidate();
      },
    );

    socket.value!.on(
      CommunicationEvents.REMOVE_FROM_WAITING,
      (candidateId: string) => {
        candidateStore.remove(candidateId);
      },
    );

    socket.value!.on(CommunicationEvents.NEXT_CANDIDATE, () => {
      candidateStore.currentCandidate = candidateStore.front();
      candidateStore.shift();
    });

    socket.value!.on(CommunicationEvents.NO_CANDIDATE, () => {
      candidateStore.currentCandidate = EMPTY_CANDIDATE;
    });
  }

  function subscribeCandidateEventListener() {
    socket.value!.on(CommunicationEvents.READY_FOR_INTERVIEW, () => {
      return navigateTo({
        path: '/room/interview',
        query: {
          interviewer: 'false',
        },
      });
    });

    socket.value!.on(CommunicationEvents.CANDIDATE_STATISTIC, (stats) => {
      waitingStore.updateStats(stats);
    });

    socket.value!.on(CommunicationEvents.INTERVIEW_FINISHED, () => {
      const interviewEventBroadcaster = useEventBus(BusEvents.INTERVIEW_EVENTS);
      interviewEventBroadcaster.emit(BusEvents.INTERVIEW_FINISHED);
      $msManager.closeTransports();
    });
  }

  function subscribeGeneralEventListener() {
    socket.value!.on(
      CommunicationEvents.NEW_PEER_INFO,
      (peer: { id: string; info: IPeerInfo }) => {
        peerStore.addPeerInfo(peer.info, peer.id);
      },
    );

    socket.value!.on('presenter-starts', async (producerId) => {
      const consumer = await $msManager.handleNewPeerProducer(producerId);
      peerStore.presenterScreen = consumer;
    });

    socket.value!.on('presenter-stops', () => {
      peerStore.presenterScreen!.close();
      peerStore.presenterScreen = null;
    });
  }

  function subscribeMediaSoupListener() {
    socket.value!.on(MsEvents.NEW_PRODUCER, async (producerId) => {
      const consumer = await $msManager.handleNewPeerProducer(producerId);
      peerStore.addPeerConsumer(consumer);
    });

    socket.value!.on(MsEvents.PRODUCER_CLOSED, (producerClientId) => {
      if (
        peerStore.presenterScreen?.appData.producerClientId === producerClientId
      ) {
        peerStore.presenterScreen?.close();
        peerStore.presenterScreen = null;
      }
      peerStore.removePeer(producerClientId);
    });

    socket.value!.on(
      MsEvents.PEER_PRODUCER_STATE_CHANGED,
      ({ peerId, producerId, state }) => {
        peerStore.updateConsumerState(peerId, producerId, state);
      },
    );
  }

  function disconnectSocket() {
    socketStore.connected = false;
    socket.value!.disconnect();
  }

  return { socket, disconnectSocket, connected };
}
