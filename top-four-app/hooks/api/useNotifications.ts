import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationPreferences, updateNotificationPreferences, NotificationPreferences, fetchUnreadNotificationsCount } from '@/lib/api/notifications';

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
