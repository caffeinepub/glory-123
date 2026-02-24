import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '../hooks/useQueries';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <img
          src="/assets/generated/hero-banner.dim_1920x600.png"
          alt="GLORY 123 Store"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/80 to-transparent">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
              Welcome to GLORY 123
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover our premium collection
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-64 animate-pulse bg-muted" />
                <CardHeader>
                  <div className="h-6 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={Number(product.id)}
                className="group overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="relative h-64 overflow-hidden bg-muted">
                  {product.imageData ? (
                    <img
                      src={product.imageData}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <Badge className="absolute right-2 top-2 capitalize">
                    {product.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <p className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => navigate({ to: `/product/${product.id}` })}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
