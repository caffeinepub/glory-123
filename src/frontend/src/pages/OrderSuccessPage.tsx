import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold">Order Placed Successfully!</h1>
          <p className="mb-8 text-muted-foreground">
            Thank you for your order. We'll process it shortly and keep you updated.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: '/' })}
            >
              <Package className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate({ to: '/cart' })}
            >
              View Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
