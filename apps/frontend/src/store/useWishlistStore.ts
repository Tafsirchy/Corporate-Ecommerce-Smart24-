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

const WishlistItemSchema = z.object({
  productId: z.string(),
  product: ProductSchema.optional(),
}).catchall(z.any());

const WishlistResponseSchema = z.object({
  items: z.array(WishlistItemSchema).optional(),
}).catchall(z.any());

type WishlistItem = z.infer<typeof WishlistItemSchema>;

interface WishlistStore {
  items: WishlistItem[];
  pendingItems: Record<string, boolean>;
  isInitialized: boolean;
  
  loadWishlist: (isAuthenticated: boolean) => Promise<void>;
  toggleWishlist: (product: any, isAuthenticated: boolean) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  pendingItems: {},
  isInitialized: false,

  loadWishlist: async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      try {
        const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (localItems.length > 0) {
          await apiClient.post('/wishlist/merge', { 
            productIds: localItems.map((i: any) => i.productId)
          });
          localStorage.removeItem('wishlist');
        }
        
        const res = await apiClient.get('/wishlist');
        
        try {
          const validatedData = WishlistResponseSchema.parse(res.data);
          if (validatedData.items) {
            set({ items: validatedData.items, isInitialized: true });
          } else {
            set({ isInitialized: true });
          }
        } catch (validationError) {
          console.error("Wishlist API Response Validation Failed:", validationError);
          toast.error("Received invalid wishlist data from the server.");
          set({ isInitialized: true });
        }

      } catch (e: any) {
        if (e?.response?.status !== 401) {
          console.error("Failed to load server wishlist", e);
        }
        set({ isInitialized: true });
      }
    } else {
      const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
      set({ items: localItems, isInitialized: true });
    }
  },

  isInWishlist: (productId: string) => get().items.some(item => item.productId === productId),

  toggleWishlist: async (product: any, isAuthenticated: boolean) => {
    const { pendingItems, items, isInWishlist } = get();
    if (pendingItems[product.id]) return;

    const exists = isInWishlist(product.id);
    set({ pendingItems: { ...pendingItems, [product.id]: true } });
    
    // Optimistic UI
    const previousItems = [...items];
    let newItems;
    if (exists) {
      newItems = items.filter(i => i.productId !== product.id);
    } else {
      newItems = [...items, { productId: product.id, product }];
    }
    set({ items: newItems });

    if (isAuthenticated) {
      try {
        if (exists) {
          await apiClient.delete(`/wishlist/items/${product.id}`);
        } else {
          await apiClient.post('/wishlist/items', { productId: product.id });
          toast.success(`${product.name} saved to wishlist`);
        }
      } catch (e: any) {
        set({ items: previousItems }); // rollback
        toast.error(e?.response?.data?.message || 'Failed to update wishlist');
      }
    } else {
      // Sync local storage
      localStorage.setItem('wishlist', JSON.stringify(newItems));
      if (!exists) {
        toast.success(`${product.name} saved to wishlist`);
      }
    }

    set(state => ({ pendingItems: { ...state.pendingItems, [product.id]: false } }));
  }
}));
