import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';
import { useSetStripeConfiguration, useIsStripeConfigured } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function PaymentSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfigMutation = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    setConfigMutation.mutate(
      {
        secretKey: secretKey.trim(),
        allowedCountries,
      },
      {
        onSuccess: () => {
          toast.success('Stripe configuration saved successfully');
          setSecretKey('');
        },
        onError: (error) => {
          toast.error(`Failed to save configuration: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isConfigured) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Stripe Payment Setup Required</CardTitle>
            <CardDescription>
              Configure Stripe to enable payment processing for your store
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertDescription>
            To accept payments, you need to configure Stripe with your secret key. You can find this in your{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              Stripe Dashboard
            </a>
            .
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={setConfigMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Your secret key will be stored securely on the blockchain
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              type="text"
              placeholder="US,CA,GB"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              disabled={setConfigMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter 2-letter country codes (e.g., US, CA, GB, AU)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={setConfigMutation.isPending}
          >
            {setConfigMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              'Save Stripe Configuration'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
