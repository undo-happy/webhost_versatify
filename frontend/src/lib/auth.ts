import { useAuth, useUser } from '@clerk/clerk-react';

export type AuthLevel = 'none' | 'optional' | 'required' | 'strict';

export type AuthState = {
  isAuthenticated: boolean;
  user: {
    userId?: string;
    email?: string;
  } | null;
  canPublish: boolean;
  canSave: boolean;
  canQueue: boolean;
  limitations: string[];
};

/**
 * 인증 상태와 권한을 관리하는 훅
 * 체험 모드와 로그인 모드를 구분하여 기능 제한
 */
export function useAuthState(): AuthState {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const authState: AuthState = {
    isAuthenticated: isSignedIn || false,
    user: isSignedIn && user ? {
      userId: userId || user.id,
      email: user.primaryEmailAddress?.emailAddress
    } : null,
    canPublish: isSignedIn || false,
    canSave: isSignedIn || false, 
    canQueue: isSignedIn || false,
    limitations: []
  };

  // 체험 모드일 때 제한사항 추가
  if (!isSignedIn) {
    authState.limitations = [
      '로그인하면 실제 블로그에 발행할 수 있습니다',
      '로그인하면 생성한 콘텐츠를 저장할 수 있습니다',
      '로그인하면 발행 큐 기능을 사용할 수 있습니다'
    ];
  }

  return authState;
}

/**
 * 특정 기능에 대한 권한 체크
 */
export function checkFeatureAccess(feature: string, authState: AuthState): {
  allowed: boolean;
  reason?: string;
  action?: string;
} {
  if (!authState.isAuthenticated) {
    switch (feature) {
      case 'generate':
      case 'preview':
      case 'edit':
        return { allowed: true };
      
      case 'publish':
        return { 
          allowed: false, 
          reason: '실제 발행하려면 로그인이 필요합니다',
          action: 'login'
        };
      
      case 'save':
        return { 
          allowed: false, 
          reason: '콘텐츠를 저장하려면 로그인이 필요합니다',
          action: 'login'
        };
      
      case 'queue':
        return { 
          allowed: false, 
          reason: '큐 기능을 사용하려면 로그인이 필요합니다',
          action: 'login'
        };
      
      default:
        return { allowed: false };
    }
  }
  
  // 로그인된 사용자는 모든 기능 사용 가능
  return { allowed: true };
}