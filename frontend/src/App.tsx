import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Studio from './pages/Studio'

export default function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <div className="container header-inner">
          <Link className="brand" to="/">Versatify</Link>
          <nav className="nav">
            <Link to="/">홈</Link>
            <Link to="/studio">스튜디오</Link>
          </nav>
          <div className="auth">
            <SignedOut>
              <SignInButton>로그인</SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} Versatify</div>
      </footer>
    </BrowserRouter>
  )
}