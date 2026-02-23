import { useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, useCartTotal, useProducts, useAddToCart } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading: cartLoading } = useCart();
  const { data: total = 0, isLoading: totalLoading } = useCartTotal();
  const { data: products = [] } = useProducts('');
  const addToCartMutation = useAddToCart();

  const cartWithProducts = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const handleQuantityChange = (productId: bigint, newQuantity: number) => {
    if (newQuantity < 1) return;
    addToCartMutation.mutate({ productId, quantity: BigInt(newQuantity) });
  };

  // Get product image - use uploaded image if available, otherwise fallback to placeholder
  const getProductImageSrc = (productId: bigint, product?: typeof products[0]) => {
    if (product?.imageData) {
      return `data:image/png;base64,${product.imageData}`;
    }
    return `/assets/generated/product-placeholder-${(Number(productId) % 3) + 1}.dim_400x400.png`;
  };

  if (cartLoading || totalLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
        <p className="mb-6 text-muted-foreground">
          Add some products to get started!
        </p>
        <Button onClick={() => navigate({ to: '/' })}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartWithProducts.map((item) => {
            if (!item.product) return null;
            return (
              <Card key={Number(item.productId)}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={getProductImageSrc(item.productId, item.product)}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product.category}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ₹{item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-border p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleQuantityChange(item.productId, Number(item.quantity) - 1)
                          }
                          disabled={Number(item.quantity) <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {Number(item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleQuantityChange(item.productId, Number(item.quantity) + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{(item.product.price * Number(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate({ to: '/payment' })}
              >
                Proceed to Payment
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
