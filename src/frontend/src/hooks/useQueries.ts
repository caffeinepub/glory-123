import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, CartItem, ShoppingItem, StripeConfiguration } from '../backend';

// Query to search products (we'll use this for "get all" by passing empty string)
export function useProducts(searchTerm: string = '') {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

// Query to get cart items
export function useCart() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.viewCart();
    },
    enabled: !!actor && !isFetching,
  });
}

// Query to calculate cart total
export function useCartTotal() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['cartTotal'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.calculateTotal();
    },
    enabled: !!actor && !isFetching,
  });
}

// Query to check if Stripe is configured
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutation to add product
export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      category: string; 
      price: number; 
      description: string;
      imageData?: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // First, add the product
      const productId = await actor.addProduct(data.name, data.category, data.price, data.description);
      
      // If imageData is provided, upload it
      if (data.imageData) {
        await actor.uploadProductImage(productId, data.imageData);
      }
      
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation to add review
export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; review: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addReview(data.productId, data.review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation to add to cart
export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addToCart(data.productId, data.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
    },
  });
}

// Mutation to update cart quantity
export function useUpdateCartQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; newQuantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCartQuantity(data.productId, data.newQuantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
    },
  });
}

// Mutation to set Stripe configuration
export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

// Checkout session type
export type CheckoutSession = {
  id: string;
  url: string;
};

// Mutation to create Stripe checkout session
export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      // JSON parsing is important!
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

// Helper function to convert cart items to shopping items
export function convertCartToShoppingItems(
  cartItems: CartItem[],
  products: Product[]
): ShoppingItem[] {
  return cartItems.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) {
      throw new Error(`Product not found: ${cartItem.productId}`);
    }
    return {
      currency: 'usd',
      productName: product.name,
      productDescription: product.description,
      priceInCents: BigInt(Math.round(product.price * 100)),
      quantity: cartItem.quantity,
    };
  });
}

// Mutation to verify admin password
export function useAdminLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // TODO: Replace with actual backend call when implemented
      // For now, using a temporary client-side check
      // This should be: return actor.verifyAdminPassword(password);
      
      // Temporary hardcoded password check (INSECURE - for demo only)
      // In production, this MUST be replaced with backend verification
      const isValid = password === 'admin123';
      
      if (!isValid) {
        throw new Error('Invalid password');
      }
      
      return isValid;
    },
  });
}
