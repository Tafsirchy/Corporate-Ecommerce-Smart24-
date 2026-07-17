'use client';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
                <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product?.name || 'Loading...'}</h3>
                  <p className="text-gray-500 text-sm mb-2">Unit Price: ৳{item.product?.price || 0}</p>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="text-right flex flex-col justify-between h-full">
                  <p className="font-bold text-lg">৳{(item.product?.price || 0) * item.quantity}</p>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 text-sm hover:underline mt-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">৳{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="text-sm text-gray-500">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{cartTotal}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full block text-center bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
