import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationPreferences, updateNotificationPreferences, NotificationPreferences,
  fetchUnreadNotificationsCount, fetchNotifications, markNotificationRead, markAllNotificationsRead
} from '@/lib/api/notifications';

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences, Error>({
    queryKey: ['notification-preferences'],
    queryFn: fetchNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) => updateNotificationPreferences(prefs),
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data);
    },
  });
}

export function useUnreadNotifications(enabled: boolean = true) {
  return useQuery<number, Error>({
    queryKey: ['unread-notifications'],
    queryFn: fetchUnreadNotificationsCount,
    enabled,
  });
}

export function useNotifications(opts: { unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['notifications', opts.unreadOnly ? 'unread' : 'all'],
    queryFn: () => fetchNotifications(opts),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });
}
