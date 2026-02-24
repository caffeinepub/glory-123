import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCartTotal, useCart, useProducts, useCreateCheckoutSession, convertCartToShoppingItems } from '../hooks/useQueries';
import { toast } from 'sonner';
import PaymentSetup from '../components/PaymentSetup';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { data: total = 0 } = useCartTotal();
  const { data: cartItems = [] } = useCart();
  const { data: products = [] } = useProducts();
  const createCheckoutSession = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripePayment = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert cart items to shopping items
      const shoppingItems = convertCartToShoppingItems(cartItems, products);

      // Create checkout session
      const session = await createCheckoutSession.mutateAsync(shoppingItems);

      // Double-check session URL exists before redirect
      if (!session || !session.url || session.url.trim() === '') {
        throw new Error('Stripe session missing url - cannot redirect to checkout');
      }

      // Redirect to Stripe checkout using window.location.href (not router navigation)
      window.location.href = session.url;
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Stripe checkout error:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Payment</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentSetup />

          <Card>
            <CardHeader>
              <CardTitle>Secure Payment with Stripe</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Your payment is processed securely through Stripe. We accept all major credit and debit cards.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-6 bg-muted/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Credit or Debit Card</h3>
                      <p className="text-sm text-muted-foreground">
                        Secure payment powered by Stripe
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>✓ Secure SSL encryption</p>
                    <p>✓ PCI DSS compliant</p>
                    <p>✓ Instant payment confirmation</p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStripePayment}
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Secure Payment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">Stripe</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to Stripe's secure checkout
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
