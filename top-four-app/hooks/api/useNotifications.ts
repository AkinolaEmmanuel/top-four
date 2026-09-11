import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchNotificationPreferences, updateNotificationPreferences, NotificationPreferences,
  fetchUnreadNotificationsCount, fetchNotifications, markNotificationRead, markAllNotificationsRead,
  NotificationsPage,
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

// The list endpoint pages at 20 -- an account with more history than that
// (settlements, corrections, reminders piling up across leagues over time)
// previously had everything past the first 20 silently unreachable, with no
// "load more" affordance at all. Notifications can genuinely accumulate
// without bound over an account's lifetime (unlike e.g. the leagues list,
// capped in practice around a few dozen), so this follows pages on demand
// via a real "load more" rather than eagerly fetching the entire history
// up front.
export function useNotifications(opts: { unreadOnly?: boolean } = {}) {
  const query = useInfiniteQuery<NotificationsPage>({
    queryKey: ['notifications', opts.unreadOnly ? 'unread' : 'all'],
    queryFn: ({ pageParam }) => fetchNotifications({ ...opts, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
  return {
    data: query.data ? { items: query.data.pages.flatMap(p => p.items) } : undefined,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
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
