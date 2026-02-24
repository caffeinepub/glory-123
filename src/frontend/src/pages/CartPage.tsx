import { useNavigate } from '@tanstack/react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, useProducts, useUpdateCart, useCartTotal } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading: cartLoading } = useCart();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: total = 0 } = useCartTotal();
  const updateCart = useUpdateCart();

  const isLoading = cartLoading || productsLoading;

  const handleUpdateQuantity = async (productId: bigint, currentQuantity: bigint, change: number) => {
    const newQuantity = Number(currentQuantity) + change;
    
    if (newQuantity < 0) return;

    try {
      await updateCart.mutateAsync({
        productId,
        quantity: BigInt(newQuantity),
      });
      
      if (newQuantity === 0) {
        toast.success('Item removed from cart');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId: bigint) => {
    try {
      await updateCart.mutateAsync({
        productId,
        quantity: BigInt(0),
      });
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-32 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
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
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;

            const itemTotal = product.price * Number(item.quantity);

            return (
              <Card key={Number(item.productId)}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product.imageData ? (
                        <img
                          src={product.imageData}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {product.category}
                        </p>
                        <p className="mt-1 font-semibold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                            disabled={updateCart.isPending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {Number(item.quantity)}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                            disabled={updateCart.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            ${itemTotal.toFixed(2)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={updateCart.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
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
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate({ to: '/payment' })}
              >
                Proceed to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
