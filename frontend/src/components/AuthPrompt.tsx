import { SignInButton } from '@clerk/clerk-react';

interface AuthPromptProps {
  reason: string;
  action?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AuthPrompt({ reason, action = 'login', size = 'md' }: AuthPromptProps) {
  const buttonSize = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  
  return (
    <div className="auth-prompt" style={{ 
      textAlign: 'center', 
      padding: 'var(--space-6)',
      background: 'var(--gradient-subtle)',
      border: '1px solid var(--color-primary-light)',
      borderRadius: 'var(--radius-lg)',
      margin: 'var(--space-4) 0'
    }}>
      <p style={{ 
        color: 'var(--color-gray-700)', 
        marginBottom: 'var(--space-4)',
        fontSize: size === 'sm' ? 'var(--font-size-sm)' : 'var(--font-size-base)'
      }}>
        {reason}
      </p>
      
      {action === 'login' && (
        <SignInButton mode="modal">
          <button className={`btn btn-primary ${buttonSize}`}>
            🔐 로그인하기
          </button>
        </SignInButton>
      )}
    </div>
  );
}