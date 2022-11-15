import { useCandidateStore } from '~~/stores/useCandidateStore';
import { useHandshakePayload } from '~~/stores/useHandshakePayload';
import { useWaitingStore } from '~~/stores/useWaitingStore';
import { useWebsocket } from '~~/stores/useWebsocket';
import { CommunicationEvents, BusEvents } from '~~/constants/socketEvents';
import { NO_CURRENT_CANDIDATE } from '~~/constants/message';
import { usePeerStore } from '~~/stores/usePeerStore';
import { IPeerInfo } from '~~/constants/types';

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
    }
  });

  function subscribeInterviewerEventListener() {
    socket.value.on(CommunicationEvents.ADD_TO_WAITING, (uid: string) => {
      candidateStore.push(uid);
    });

    socket.value.on(CommunicationEvents.CANDIDATE_CLOSED, (uid: string) => {
      console.log('candidate closed');
      candidateStore.remove(uid);
      if (uid === candidateStore.currentCandidate)
        candidateStore.removeCurrentCandidate();
    });

    socket.value.on(CommunicationEvents.REMOVE_FROM_WAITING, (uid: string) => {
      candidateStore.remove(uid);
    });

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

  function disconnectSocket() {
    socketStore.connected = false;
    socket.value.disconnect();
  }

  return { socket, disconnectSocket, connected };
}
