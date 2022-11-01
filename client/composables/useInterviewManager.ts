import { useWebsocket } from '~~/stores/useWebsocket';

export function useInterviewManager() {
  const socketStore = useWebsocket();

  const requestNextCandidate = () => {
    socketStore.socket.request('next-candidate', {});
  };

  const getCandidateList = () => {
    return socketStore.socket.request('get-candidate-list', {});
  };

  const joinInterviewerGroup = () => {
    socketStore.socket.request('join-interviewer-group', {});
  };

  const joinCandidateGroup = () => {
    socketStore.socket.emit('join-candidate-group');
  };

  return {
    requestNextCandidate,
    getCandidateList,
    joinInterviewerGroup,
    joinCandidateGroup,
  };
}
