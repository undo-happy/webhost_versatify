import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import Settings from './pages/Settings';
import Home from './pages/Home';
import Queue from './pages/Queue';
import Layout from './components/Layout';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Layout />}> 
          <Route index element={<Dashboard />} />
          <Route path="generate" element={<Generate />} />
          <Route path="history" element={<History />} />
          <Route path="queue" element={<Queue />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
