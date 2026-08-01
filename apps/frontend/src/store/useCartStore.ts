import { create } from 'zustand';
import { apiClient } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
  price: z.number(),
  stock: z.number().optional(),
  images: z.array(z.string()).optional(),
}).catchall(z.any());

const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  product: ProductSchema.optional(),
}).catchall(z.any());

const CartResponseSchema = z.object({
  items: z.array(CartItemSchema).optional(),
}).catchall(z.any());

export type CartItem = z.infer<typeof CartItemSchema>;

interface CartStore {
  items: CartItem[];
  pendingItems: Record<string, boolean>;
  isInitialized: boolean;
  
  loadCart: (isAuthenticated: boolean) => Promise<void>;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  
  totalItems: () => number;
  cartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  pendingItems: {},
  isInitialized: false,

  loadCart: async (isAuthenticated: boolean) => {
    try {
      // Merge local storage items if authenticated
      const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localItems.length > 0 && isAuthenticated) {
        await apiClient.post('/cart/merge', { 
          items: localItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
        });
        localStorage.removeItem('cart');
      }
      
      const res = await apiClient.get('/cart');
      
      try {
        const validatedData = CartResponseSchema.parse(res.data);
        if (validatedData.items) {
          set({ items: validatedData.items, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      } catch (validationError) {
        console.error("Cart API Response Validation Failed:", validationError);
        toast.error("Received invalid cart data from the server.");
        set({ isInitialized: true });
      }

    } catch (e: any) {
      if (e?.response?.status !== 401) {
        console.error("Failed to load server cart", e);
      }
      set({ isInitialized: true });
    }
  },

  addToCart: async (product: any, quantity = 1) => {
    const { pendingItems, items } = get();
    if (pendingItems[product.id]) return;

    set({ pendingItems: { ...pendingItems, [product.id]: true } });
    
    const existingIndex = items.findIndex(i => i.productId === product.id);
    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    const previousItems = [...items];
    const newItems = [...items];
    
    if (existingIndex >= 0) {
      newItems[existingIndex].quantity = newQty;
    } else {
      newItems.push({ productId: product.id, quantity: newQty, product });
    }
    
    set({ items: newItems });

    try {
      await apiClient.post('/cart/items', { productId: product.id, quantity: newQty });
      toast.success(`${product.name} added to cart`);
    } catch (e: any) {
      set({ items: previousItems }); // rollback
      toast.error(e?.response?.data?.message || 'Failed to add to cart');
    }

    set(state => ({ pendingItems: { ...state.pendingItems, [product.id]: false } }));
  },

  updateQuantity: async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return get().removeFromCart(productId);
    }
    
    const { items } = get();
    const previousItems = [...items];
    
    set({ items: items.map(item => item.productId === productId ? { ...item, quantity } : item) });

    try {
      await apiClient.post('/cart/items', { productId, quantity });
    } catch (e: any) {
      set({ items: previousItems });
      toast.error(e?.response?.data?.message || 'Failed to update quantity');
    }
  },

  removeFromCart: async (productId: string) => {
    const { items } = get();
    const previousItems = [...items];
    
    set({ items: items.filter(item => item.productId !== productId) });

    try {
      await apiClient.delete(`/cart/items/${productId}`);
    } catch (e: any) {
      set({ items: previousItems });
      toast.error(e?.response?.data?.message || 'Failed to remove item');
    }
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  
  cartTotal: () => get().items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
}));
