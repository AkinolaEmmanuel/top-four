import { useMutation } from '@tanstack/react-query';
import { changeDisplayName, changePassword, requestEmailChange } from '@/lib/api/auth';
import { useAuth } from '@/context/auth-context';

export function useUpdateDisplayName() {
  const { refetchUser } = useAuth();
  
  return useMutation({
    mutationFn: changeDisplayName,
    onSuccess: () => {
      refetchUser();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: requestEmailChange,
  });
}
