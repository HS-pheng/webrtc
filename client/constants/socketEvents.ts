export const InterviewRequests = {
  NEXT_CANDIDATE: 'next-candidate',
  GET_CANDIDATE_LIST: 'get-candidate-list',
  GET_PEERS_INFO: 'get-peers-info',
  JOIN_GROUP: 'join-group',
  LEAVE_WAITING_LIST: 'leave-waiting-list',
} as const;

export const CommunicationEvents = {
  ADD_TO_WAITING: 'add-to-waiting',
  REMOVE_FROM_WAITING: 'remove-from-waiting',
  CANDIDATE_CLOSED: 'candidate-closed',
  NEXT_CANDIDATE: 'next-candidate',
  NO_CANDIDATE: 'no-candidate',
  READY_FOR_INTERVIEW: 'ready-for-interview',
  CANDIDATE_STATISTIC: 'candidate-statistic',
  INTERVIEW_FINISHED: 'interview-finished',
  NEW_PEER_INFO: 'new-peer-info',
  MEDIA_STATE_CHANGED: 'media-state-changed',
  STOP_SHARING: 'stop-sharing',
} as const;

export const BusEvents = {
  INTERVIEW_EVENTS: 'interviewEvents',
  INTERVIEW_FINISHED: 'interview-finished',
} as const;

export const MsEvents = {
  NEW_PRODUCER: 'new-producer',
  PRODUCER_CLOSED: 'producer-closed',
  PEER_PRODUCER_STATE_CHANGED: 'peer-producer-state-changed',
};
