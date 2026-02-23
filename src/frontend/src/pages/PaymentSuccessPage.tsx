import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear cart data after successful payment
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
  }, [queryClient]);

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>

            <div className="rounded-lg border border-border bg-background p-6">
              <h3 className="mb-2 font-semibold">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ You will receive an order confirmation email</li>
                <li>✓ Your order is being prepared for shipment</li>
                <li>✓ Track your order status in your account</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/' })}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Continue Shopping
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/cart' })}
                className="gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                View Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
