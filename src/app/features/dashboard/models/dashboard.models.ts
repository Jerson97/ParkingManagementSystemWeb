export interface DashboardSummaryResponse {
  readonly totalSpaces: number;
  readonly availableSpaces: number;
  readonly occupiedSpaces: number;
  readonly reservedSpaces: number;
  readonly activeSubscriptions: number;
  readonly expiredSubscriptions: number;
  readonly todayRevenue: number;
  readonly closedTicketsToday: number;
}
