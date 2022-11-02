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
      socket.value?.disconnect();
      socketStore.connect();
      connected.value = true;
      socket.value = socketStore.socket;

      subscribeInterviewerEventListener();
      subscribeCandidateEventListener();
    }
  });

  function subscribeInterviewerEventListener() {
    socket.value.on('new-candidate', (name) => {
      console.log('new candidate received');
      candidateStore.push(name);
    });

    socket.value.on('candidate-closed', (name) => {
      console.log('candidate closed received');
      candidateStore.remove(name);
    });

    socket.value.on('next-candidate', () => {
      candidateStore.currentCandidate = candidateStore.front();
      candidateStore.shift();
    });
  }

  function subscribeCandidateEventListener() {
    socket.value.on('ready-for-interview', () => {
      navigateTo('/room/interview');
    });

    socket.value.on('candidate-statistic', (stats) => {
      console.log({ stats });
      waitingStore.updateStats(stats);
    });
    socket.value.on('interview-finished', async () => {
      $msManager.closeTransports();
      await navigateTo('/');
    });
  }

  return { socket, connected };
}
