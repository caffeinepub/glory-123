import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';
import Footer from './components/Footer';

// Layout component with Header and Footer
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProductListPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$id',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: PaymentPage,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-success',
  component: OrderSuccessPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productDetailRoute,
  cartRoute,
  paymentRoute,
  orderSuccessRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
