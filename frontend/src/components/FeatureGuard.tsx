import type { ReactNode } from 'react';
import { useAuthState, checkFeatureAccess } from '../lib/auth';
import AuthPrompt from './AuthPrompt';

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showPrompt?: boolean;
}

/**
 * 기능별 접근 권한을 제어하는 컴포넌트
 * 권한이 없으면 로그인 프롬프트를 표시하거나 비활성화
 */
export default function FeatureGuard({ 
  feature, 
  children, 
  fallback, 
  showPrompt = true 
}: FeatureGuardProps) {
  const authState = useAuthState();
  const access = checkFeatureAccess(feature, authState);

  if (access.allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showPrompt && access.reason) {
    return <AuthPrompt reason={access.reason} action={access.action} size="sm" />;
  }

  return null;
}