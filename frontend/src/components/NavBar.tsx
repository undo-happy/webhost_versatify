import { SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../lib/auth';

export default function NavBar() {
  const auth = useAuthState();
  const isClerkEnabled = (((import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY) || '').startsWith('pk_');
  return (
    <header className="nav">
      <div className="container row between center">
        <div className="brand row center" style={{ gap: 12 }}>
          <div className="brand-logo" />
          <strong>Versatify</strong>
        </div>
        <nav className="row center gap">
          <a href="#features">기능</a>
          <a href="#pricing">요금제</a>
          <a href="#testimonials">후기</a>
          <Link to="/blog" className="ghost">블로그</Link>
          <Link to="/contact" className="ghost">문의</Link>
          <Link to="/app" className="ghost">콘솔</Link>
          {isClerkEnabled ? (
            auth.isAuthenticated ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="primary">로그인</button>
              </SignInButton>
            )
          ) : (
            <button className="secondary" disabled>로그인(데모)</button>
          )}
        </nav>
      </div>
    </header>
  );
}
