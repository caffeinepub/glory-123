import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useProducts, useAddToCart, useAddReview } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams({ from: '/product/$id' });
  const navigate = useNavigate();
  const { data: products = [] } = useProducts('');
  const addToCartMutation = useAddToCart();
  const addReviewMutation = useAddReview();
  const [reviewText, setReviewText] = useState('');

  const product = products.find((p) => String(p.id) === id);

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate(
      { productId: product.id, quantity: BigInt(1) },
      {
        onSuccess: () => {
          toast.success('Added to cart!');
        },
        onError: () => {
          toast.error('Failed to add to cart');
        },
      }
    );
  };

  const handleSubmitReview = () => {
    if (!product || !reviewText.trim()) return;
    addReviewMutation.mutate(
      { productId: product.id, review: reviewText },
      {
        onSuccess: () => {
          toast.success('Review submitted!');
          setReviewText('');
        },
        onError: () => {
          toast.error('Failed to submit review');
        },
      }
    );
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const productImage = `/assets/generated/product-placeholder-${(Number(product.id) % 3) + 1}.dim_400x400.png`;

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
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-medium text-primary">{product.category}</div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="mb-6 text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
          
          <p className="mb-8 text-muted-foreground leading-relaxed">{product.description}</p>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="mb-4"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>

          <Separator className="my-8" />

          {/* Product Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product ID:</span>
              <span className="font-medium">{String(product.id)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reviews:</span>
              <span className="font-medium">{product.reviews.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

        {/* Add Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts about this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim() || addReviewMutation.isPending}
              >
                {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {product.reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{review}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
