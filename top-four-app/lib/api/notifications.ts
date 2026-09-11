import { apiFetch } from './fetcher';
import type { Api } from './types';

/**
 * The wire reads preferences in snake_case and writes them in camelCase. This
 * module is the one place that asymmetry is handled, so the rest of the app
 * only ever sees camelCase.
 */
export interface NotificationPreferences {
  roundReminder: boolean;
  customQuestionAdmin: boolean;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await apiFetch<Api<'NotificationPreferencesResponseDto'>>('/me/notification-preferences');
  return {
    roundReminder: response.data.round_reminder,
    customQuestionAdmin: response.data.custom_question_admin,
  };
}

export async function updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const payload: Api<'UpdateNotificationPreferencesDto'> = {};
  if (prefs.roundReminder !== undefined) payload.roundReminder = prefs.roundReminder;
  if (prefs.customQuestionAdmin !== undefined) payload.customQuestionAdmin = prefs.customQuestionAdmin;

  const response = await apiFetch<Api<'NotificationPreferencesResponseDto'>>('/me/notification-preferences', {
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
  const response = await apiFetch<Api<'NotificationUnreadCountResponseDto'>>('/notifications/unread-count');
  return response.data?.unread ?? 0;
}

/**
 * UNTYPED UPSTREAM: `NotificationItemDto.kind` and `.category` are declared as
 * plain strings, though the domain holds both as closed sets (see
 * `notification/domain/notification-kind.ts`). The unions below are that source
 * of truth, verified against it — without them every screen that branches on a
 * kind does so on an open string. Backend fix: declare both with `enum:`.
 */
export type NotificationKind =
  | 'league.join_request.received' | 'league.join_request.approved' | 'league.join_request.rejected'
  | 'league.role.changed' | 'league.membership.removed' | 'league.round.reminder'
  | 'league.results.settled' | 'league.results.corrected' | 'league.completed' | 'league.cancelled'
  | 'league.fixture.moved' | 'league.custom_question.resolve_reminder' | 'league.custom_question.auto_voided'
  | 'account.password.changed' | 'account.email.changed' | 'account.password_reset.completed';

export type NotificationCategory =
  | 'membership' | 'round_reminder' | 'correction' | 'custom_question_admin' | 'account_security' | 'results' | 'fixture_moved';

export type NotificationItem = Omit<Api<'NotificationItemDto'>, 'kind' | 'category'> & {
  kind: NotificationKind;
  category: NotificationCategory;
};

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
  const response = await apiFetch<Api<'NotificationMarkAllReadResponseDto'>>('/notifications/read-all', { method: 'POST' });
  return response.data?.read ?? 0;
}
