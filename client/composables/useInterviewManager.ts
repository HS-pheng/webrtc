import { useWebsocket } from '~~/stores/useWebsocket';
import { InterviewRequests } from '~~/constants/socketEvents';

export function useInterviewManager() {
  const socketStore = useWebsocket();

  const requestNextCandidate = () => {
    socketStore.socket.emit(InterviewRequests.NEXT_CANDIDATE, {});
  };

  const getCandidateList = () => {
    return socketStore.socket.request(InterviewRequests.GET_CANDIDATE_LIST, {});
  };

  const joinGroup = (type: 'interviewer' | 'candidate') => {
    socketStore.socket.emit(InterviewRequests.JOIN_GROUP, type);
  };

  const leaveWaitingList = () => {
    socketStore.socket.emit(InterviewRequests.LEAVE_WAITING_LIST);
  };

  return {
    requestNextCandidate,
    getCandidateList,
    joinGroup,
    leaveWaitingList,
  };
}
