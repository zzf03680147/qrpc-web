const cmd = {
  LoginCmd: 0,
  LoginRespCmd: 1,
  AckCmd: 2,
  AckRespCmd: 3,
  SendCmd: 4,
  SendRespCmd: 5,
  OfflineThreadsCmd: 6,
  OfflineThreadsRespCmd: 7,
  ThreadMsgsCmd: 8,
  ThreadMsgsRespCmd: 9,
  NotifiedRespCmd: 10,
  NotifyCmd: 11,
  NotifyRespCmd: 12,
  GetThreadOffsetCmd: 13,
  GetThreadOffsetRespCmd: 14,
  UpdateThreadOffsetCmd: 15,
  UpdateThreadOffsetRespCmd: 16,
  CSEndSessionCmd: 17,
  CSEndSessionRespCmd: 18,
  CSHeartBeatCmd: 19,
  CSHeartBeatRespCmd: 20,
  CSSetStatusCmd: 21,
  CSSetStatusRespCmd: 22,
  CSGetPeerUsersCmd: 23,
  CSGetPeerUsersRespCmd: 24,
  CSGetQueuedThreadsCmd: 25,
  CSGetQueuedThreadsRespCmd: 26,
  CSManualPickCmd: 27,
  CSManualPickRespCmd: 28,
  CSManualSwitchCmd: 29,
  CSManualSwitchRespCmd: 30,
  CSDialUserCmd: 31,
  CSDialUserRespCmd: 32,
  CSEndSessionQCmd: 33,
  CSEndSessionQRespCmd: 34,
  RefreshAPITokenCmd: 35,
  RefreshAPITokenRespCmd: 36,
  DeleteThreadCmd: 37,
  DeleteThreadRespCmd: 38,
  CSKeepSessionCmd: 39,
  SignalStartDirectDialCmd: 41,
  SignalAcceptDialCmd: 43,
  SignalStopDialCmd: 45,
  SignalSendInfoCmd: 47
};

export default cmd;