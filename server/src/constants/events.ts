export const GatewayEvents = {
  JOIN_GROUP: 'join-group',
  NEXT_CANDIDATE: 'next-candidate',
  GET_CANDIDATE_LIST: 'get-candidate-list',
  LEAVE_WAITING_LIST: 'leave-waiting-list',
  SETUP_TRANSPORT: 'setup-transport',
  CONNECT_TRANSPORT: 'connect-transport',
  PRODUCE: 'produce',
  JOIN_INTERVIEW_ROOM: 'join-interview-room',
  GET_NEW_PRODUCER: 'get-new-producer',
  RESUME_CONSUMER: 'resume-consumer',
  GET_PEERS_INFO: 'get-peers-info',
  MEDIA_STATE_CHANGED: 'media-state-changed',
} as const;

export const CommunicationEvents = {
  NO_CANDIDATE: 'no-candidate',
  REMOVE_FROM_WAITING: 'remove-from-waiting',
  NEW_PRODUCER: 'new-producer',
  PRODUCER_CLOSED: 'producer-closed',
  CANDIDATE_CLOSED: 'candidate-closed',
  ADD_TO_WAITING: 'add-to-waiting',
  INTERVIEW_FINISHED: 'interview-finished',
  READY_FOR_INTERVIEW: 'ready-for-interview',
  NEXT_CANDIDATE: 'next-candidate',
  NEW_PEER_INFO: 'new-peer-info',
  PEER_PRODUCER_STATE_CHANGED: 'peer-producer-state-changed',
} as const;
