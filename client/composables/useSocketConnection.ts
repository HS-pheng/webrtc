import { useCandidateStore } from '~~/stores/useCandidateStore';
import { useWaitingStore } from '~~/stores/useWaitingStore';
import { useWebsocket } from '~~/stores/useWebsocket';

export function useSocketConnection() {
  const socketStore = useWebsocket();
  const socket = ref(socketStore.socket);
  const connected = ref(socketStore.connected);
  const candidateStore = useCandidateStore();
  const waitingStore = useWaitingStore();
  const { $msManager } = useNuxtApp();

  tryOnMounted(() => {
    if (!connected.value) {
      socketStore.connect();
      connected.value = true;
      socket.value = socketStore.socket;

      subscribeInterviewerEventListener();
      subscribeCandidateEventListener();
    }
  });

  function subscribeInterviewerEventListener() {
    socket.value.on('add-to-waiting', (uid: string) => {
      candidateStore.push(uid);
    });

    socket.value.on('candidate-closed', (uid: string) => {
      candidateStore.remove(uid);
      if (uid === candidateStore.currentCandidate)
        candidateStore.removeCurrentCandidate();
    });

    socket.value.on('remove-from-waiting', (uid: string) => {
      candidateStore.remove(uid);
    });

    socket.value.on('next-candidate', () => {
      candidateStore.currentCandidate = candidateStore.front();
      candidateStore.shift();
    });

    socket.value.on('no-candidate', () => {
      candidateStore.currentCandidate = '';
    });
  }

  function subscribeCandidateEventListener() {
    socket.value.on('ready-for-interview', () => {
      return navigateTo({
        path: '/room/interview',
        query: {
          interviewer: 'false',
        },
      });
    });

    socket.value.on('candidate-statistic', (stats) => {
      waitingStore.updateStats(stats);
    });
    socket.value.on('interview-finished', () => {
      const interviewEventBroadcaster = useEventBus('interviewEvents');
      interviewEventBroadcaster.emit('interview-finished');
      $msManager.closeTransports();
    });
  }

  function disconnectSocket() {
    socketStore.connected = false;
    socket.value.disconnect();
  }

  return { socket, connected, disconnectSocket };
}
