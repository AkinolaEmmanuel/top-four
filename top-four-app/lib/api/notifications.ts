import { apiFetch } from './fetcher';

export interface NotificationPreferences {
  roundReminder: boolean;
  customQuestionAdmin: boolean;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiFetch<any>('/me/notification-preferences');
  return {
    roundReminder: data.round_reminder,
    customQuestionAdmin: data.custom_question_admin,
  };
}

export async function updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const payload: any = {};
  if (prefs.roundReminder !== undefined) payload.roundReminder = prefs.roundReminder;
  if (prefs.customQuestionAdmin !== undefined) payload.customQuestionAdmin = prefs.customQuestionAdmin;

  const data = await apiFetch<any>('/me/notification-preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return {
    roundReminder: data.round_reminder,
    customQuestionAdmin: data.custom_question_admin,
  };
}

export async function fetchUnreadNotificationsCount(): Promise<number> {
  const data = await apiFetch<any>('/notifications/unread-count');
  return data.unread || 0;
}
