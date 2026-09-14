import { useMutation } from '@tanstack/react-query';
import {
  changeDisplayName,
  changePassword,
  requestEmailChange,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  resendVerificationEmail,
  confirmEmailChange,
} from '@/lib/api/auth';
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

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: confirmPasswordReset,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: resendVerificationEmail,
  });
}

export function useConfirmEmailChange() {
  return useMutation({
    mutationFn: confirmEmailChange,
  });
}
