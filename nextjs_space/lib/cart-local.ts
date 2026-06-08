const CART_KEY = "electro_bazaar_guest_cart";

export interface GuestCartItem {
  id: string;
  productId: string;
  quantity: number;
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read guest cart", e);
    return [];
  }
}

export function saveGuestCart(cart: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch custom event to notify components (like Header) to update counts
    window.dispatchEvent(new Event("guest-cart-change"));
  } catch (e) {
    console.error("Failed to save guest cart", e);
  }
}

export function addToGuestCart(productId: string, quantity: number = 1): GuestCartItem[] {
  const cart = getGuestCart();
  const existingIndex = cart.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: "guest_" + Math.random().toString(36).substring(2, 9),
      productId,
      quantity,
    });
  }

  saveGuestCart(cart);
  return cart;
}

export function updateGuestCartQty(productId: string, quantity: number): GuestCartItem[] {
  let cart = getGuestCart();
  if (quantity < 1) {
    return removeFromGuestCart(productId);
  }

  cart = cart.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  );

  saveGuestCart(cart);
  return cart;
}

export function removeFromGuestCart(productId: string): GuestCartItem[] {
  const cart = getGuestCart().filter((item) => item.productId !== productId);
  saveGuestCart(cart);
  return cart;
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("guest-cart-change"));
  } catch (e) {
    console.error("Failed to clear guest cart", e);
  }
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}
