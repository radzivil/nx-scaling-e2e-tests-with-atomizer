import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Cart } from './pages/Cart';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';
import { ProductDetail } from './pages/ProductDetail';
import { ShopProvider } from './state/store';

export function App() {
  return (
    <ShopProvider>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </ShopProvider>
  );
}

export default App;
