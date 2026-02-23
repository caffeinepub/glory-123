import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, CartItem, PaymentMethod } from '../backend';

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

// Mutation to checkout
export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethod: PaymentMethod) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.checkout(paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
    },
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
