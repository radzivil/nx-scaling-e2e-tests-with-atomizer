import { Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { RequireAuth } from './components/RequireAuth';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { OrderDetail } from './pages/OrderDetail';
import { Orders } from './pages/Orders';
import { ProductEdit } from './pages/ProductEdit';
import { Products } from './pages/Products';
import { SettingsPage } from './pages/SettingsPage';
import { Users } from './pages/Users';
import { AdminProvider } from './state/store';

const guarded = (element: React.ReactElement) => <RequireAuth>{element}</RequireAuth>;

export function App() {
  return (
    <AdminProvider>
      <Nav />
      <main className="app-shell">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={guarded(<Dashboard />)} />
          <Route path="/products" element={guarded(<Products />)} />
          <Route path="/products/:id" element={guarded(<ProductEdit />)} />
          <Route path="/orders" element={guarded(<Orders />)} />
          <Route path="/orders/:id" element={guarded(<OrderDetail />)} />
          <Route path="/users" element={guarded(<Users />)} />
          <Route path="/settings" element={guarded(<SettingsPage />)} />
        </Routes>
      </main>
    </AdminProvider>
  );
}

export default App;
