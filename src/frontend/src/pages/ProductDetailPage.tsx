import { useParams, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProducts, useUpdateCart } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams({ from: '/product/$id' });
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const updateCart = useUpdateCart();

  const product = products.find((p) => p.id === BigInt(id));

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await updateCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-96 rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-6 w-1/4 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Product Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="overflow-hidden rounded-lg bg-muted">
          {product.imageData ? (
            <img
              src={product.imageData}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-96 items-center justify-center">
              <ShoppingCart className="h-32 w-32 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-3 capitalize">{product.category}</Badge>
            <h1 className="mb-2 text-4xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Separator />

          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={updateCart.isPending}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {updateCart.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-medium text-green-600">In Stock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
