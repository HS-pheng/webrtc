import { useWebsocket } from '~~/stores/useWebsocket';
import { InterviewRequests } from '~~/constants/socketEvents';
import { usePeerStore } from '~~/stores/usePeerStore';
import { candidateInfo, IPeerInfo } from '~~/constants/types';

export function useInterviewManager() {
  const socketStore = useWebsocket();
  const peerStore = usePeerStore();

  const requestNextCandidate = (roomId: string) => {
    socketStore.socket!.emit(InterviewRequests.NEXT_CANDIDATE, roomId);
  };

  const getCandidateList = (): Promise<candidateInfo[]> => {
    return socketStore.socket!.request(
      InterviewRequests.GET_CANDIDATE_LIST,
      {},
    );
  };

  const joinGroup = (type: 'interviewer' | 'candidate') => {
    socketStore.socket!.emit(InterviewRequests.JOIN_GROUP, type);
  };

  const leaveWaitingList = () => {
    socketStore.socket!.emit(InterviewRequests.LEAVE_WAITING_LIST);
  };

  const loadPeersInfo = async () => {
    const peersInfo: { [peerId: string]: IPeerInfo } =
      await socketStore.socket!.request(InterviewRequests.GET_PEERS_INFO, {});

    console.log(peersInfo);

    Object.entries(peersInfo).forEach(([peerId, peerInfo]) =>
      peerStore.addPeerInfo(peerInfo, peerId),
    );
  };

  return {
    requestNextCandidate,
    getCandidateList,
    joinGroup,
    leaveWaitingList,
    loadPeersInfo,
  };
}
