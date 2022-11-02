import { useWebsocket } from '~~/stores/useWebsocket';

export function useInterviewManager() {
  const socketStore = useWebsocket();

  const requestNextCandidate = () => {
    socketStore.socket.emit('next-candidate', {});
  };

  const getCandidateList = () => {
    return socketStore.socket.request('get-candidate-list', {});
  };

  const joinGroup = (type: 'interviewer' | 'candidate') => {
    if (type === 'interviewer') {
      socketStore.socket.emit('join-interviewer-group');
    } else socketStore.socket.emit('join-candidate-group');
  };

  return {
    requestNextCandidate,
    getCandidateList,
    joinGroup,
  };
}
