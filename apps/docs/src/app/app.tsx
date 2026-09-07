import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ArticlePage } from './pages/ArticlePage';
import { ChangelogPage } from './pages/ChangelogPage';
import { Landing } from './pages/Landing';
import { NotFound } from './pages/NotFound';
import { SearchPage } from './pages/SearchPage';
import { ThemeProvider } from './state/theme';

export function App() {
  return (
    <ThemeProvider>
      <Header />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Navigate to="/docs/installation" replace />} />
          <Route path="/docs/:slug" element={<ArticlePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
