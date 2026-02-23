import { useNavigate } from '@tanstack/react-router';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              We couldn't process your payment. This could be due to insufficient funds, an expired card, or the payment was cancelled.
            </p>

            <div className="rounded-lg border border-border bg-background p-6">
              <h3 className="mb-2 font-semibold">What You Can Do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground text-left">
                <li>• Check your card details and try again</li>
                <li>• Ensure you have sufficient funds</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/payment' })}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/cart' })}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
