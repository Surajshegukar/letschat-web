export type ServiceWorkerStatus = "checking" | "active" | "waiting" | "none" | "error" | "unsupported";

export interface PushDiagnosticsState {
  permission: NotificationPermission;
  swStatus: ServiceWorkerStatus;
  hasSubscription: boolean;
  isRefreshing: boolean;
  debugLog: string[];
}
