import { apiFetch } from './fetcher';

export interface NotificationPreferences {
  roundReminder: boolean;
  customQuestionAdmin: boolean;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await apiFetch<{ data: { round_reminder: boolean; custom_question_admin: boolean } }>('/me/notification-preferences');
  return {
    roundReminder: response.data.round_reminder,
    customQuestionAdmin: response.data.custom_question_admin,
  };
}

export async function updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const payload: any = {};
  if (prefs.roundReminder !== undefined) payload.roundReminder = prefs.roundReminder;
  if (prefs.customQuestionAdmin !== undefined) payload.customQuestionAdmin = prefs.customQuestionAdmin;

  const response = await apiFetch<{ data: { round_reminder: boolean; custom_question_admin: boolean } }>('/me/notification-preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return {
    roundReminder: response.data.round_reminder,
    customQuestionAdmin: response.data.custom_question_admin,
  };
}

export async function fetchUnreadNotificationsCount(): Promise<number> {
  const response = await apiFetch<{ data: { unread: number } }>('/notifications/unread-count');
  return response.data.unread || 0;
}

export type NotificationKind =
  | 'league.join_request.received' | 'league.join_request.approved' | 'league.join_request.rejected'
  | 'league.role.changed' | 'league.membership.removed' | 'league.round.reminder'
  | 'league.results.settled' | 'league.results.corrected' | 'league.completed' | 'league.cancelled'
  | 'league.fixture.moved' | 'league.custom_question.resolve_reminder' | 'league.custom_question.auto_voided'
  | 'account.password.changed' | 'account.email.changed' | 'account.password_reset.completed';

export type NotificationCategory =
  | 'membership' | 'round_reminder' | 'correction' | 'custom_question_admin' | 'account_security' | 'results' | 'fixture_moved';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  leagueId: string | null;
  subject: { kind: string; id: string };
  data: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationsPage {
  items: NotificationItem[];
  nextCursor: string | null;
}

export async function fetchNotifications(opts: { cursor?: string; unreadOnly?: boolean } = {}): Promise<NotificationsPage> {
  const query = new URLSearchParams();
  if (opts.cursor) query.set('cursor', opts.cursor);
  if (opts.unreadOnly) query.set('filter', 'unread');
  const qs = query.toString();
  const response = await apiFetch<{ data: NotificationItem[]; nextCursor: string | null }>(`/notifications${qs ? `?${qs}` : ''}`);
  return { items: response.data, nextCursor: response.nextCursor };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiFetch<void>(`/notifications/${notificationId}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await apiFetch<{ data: { read: number } }>('/notifications/read-all', { method: 'POST' });
  return response.data.read;
}
