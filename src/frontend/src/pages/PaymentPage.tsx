import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CreditCard, Banknote, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartTotal, useCheckout } from '../hooks/useQueries';
import { toast } from 'sonner';

const UPI_ID = '9892246308-2@axl';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { data: total = 0 } = useCartTotal();
  const checkoutMutation = useCheckout();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteOrder = () => {
    const method =
      paymentMethod === 'cod'
        ? { __kind__: 'cashOnDelivery' as const, cashOnDelivery: null }
        : { __kind__: 'upi' as const, upi: UPI_ID };

    checkoutMutation.mutate(method, {
      onSuccess: () => {
        navigate({ to: '/order-success' });
      },
      onError: () => {
        toast.error('Failed to complete order');
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Payment</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'upi')}>
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <Banknote className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pay with cash when your order is delivered to your doorstep.
                      </p>
                    </Label>
                  </div>

                  {/* UPI Payment */}
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                    <RadioGroupItem value="upi" id="upi" className="mt-1" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-semibold">UPI Payment</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pay instantly using any UPI app like Google Pay, PhonePe, or Paytm.
                      </p>
                      {paymentMethod === 'upi' && (
                        <div className="mt-4 rounded-lg bg-muted p-4">
                          <p className="text-sm font-medium mb-2">UPI ID:</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                              {UPI_ID}
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleCopyUPI}
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Please complete the payment and then click "Complete Order" below.
                          </p>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              </RadioGroup>
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
                <span className="font-medium">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCompleteOrder}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Complete Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
