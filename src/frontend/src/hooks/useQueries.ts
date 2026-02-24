import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, CartItem, ShoppingItem, StripeConfiguration } from '../backend';

// Query to get all products
export function useProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
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
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

// Query to calculate cart total (computed from cart items and products)
export function useCartTotal() {
  const { data: cartItems = [] } = useCart();
  const { data: products = [] } = useProducts();

  const total = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      return sum + product.price * Number(item.quantity);
    }
    return sum;
  }, 0);

  return { data: total, isLoading: false };
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
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addProduct(data.name, data.category, data.price, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation to update cart (handles add, update quantity, and remove)
export function useUpdateCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateCart(data.productId, data.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Mutation to clear cart
export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
      
      // JSON parsing is critical for Stripe integration
      const session = JSON.parse(result) as CheckoutSession;
      
      // Validate that session has required url field
      if (!session || !session.url || session.url.trim() === '') {
        throw new Error('Stripe session missing url - cannot redirect to checkout');
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
