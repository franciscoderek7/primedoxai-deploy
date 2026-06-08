import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  sku: string
  module_key: string
  loop: 'A' | 'B'
  name: string
  short_desc: string
  price_cents: number
  currency: string
  product_type: 'one_time' | 'subscription_monthly' | 'subscription_annual' | 'lifetime'
  image_url?: string
}

export interface CartItem {
  id: string
  product: CartProduct
  quantity: number
}

interface CartState {
  items: CartItem[]
  coupon_code: string | null
  discount_cents: number
  session_id: string | null

  // Computed
  loop_a_subtotal: number
  loop_b_subtotal: number
  grand_total_cents: number
  item_count: number

  // Actions
  addItem: (product: CartProduct) => void
  removeItem: (item_id: string) => void
  updateQuantity: (item_id: string, quantity: number) => void
  applyCoupon: (code: string, discount_cents: number) => void
  clearCart: () => void
  setSessionId: (id: string) => void
}

function generateItemId() {
  return Math.random().toString(36).slice(2, 10)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon_code: null,
      discount_cents: 0,
      session_id: null,
      loop_a_subtotal: 0,
      loop_b_subtotal: 0,
      grand_total_cents: 0,
      item_count: 0,

      addItem: (product) => {
        const items = get().items
        const existing = items.find(i => i.product.sku === product.sku)
        let nextItems: CartItem[]
        if (existing) {
          nextItems = items.map(i =>
            i.product.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i
          )
        } else {
          nextItems = [...items, { id: generateItemId(), product, quantity: 1 }]
        }
        set(recompute({ items: nextItems }))
      },

      removeItem: (item_id) => {
        const nextItems = get().items.filter(i => i.id !== item_id)
        set(recompute({ items: nextItems }))
      },

      updateQuantity: (item_id, quantity) => {
        if (quantity < 1) { get().removeItem(item_id); return }
        const nextItems = get().items.map(i =>
          i.id === item_id ? { ...i, quantity } : i
        )
        set(recompute({ items: nextItems }))
      },

      applyCoupon: (code, discount_cents) => {
        const state = get()
        set(recompute({ ...state, coupon_code: code, discount_cents }))
      },

      clearCart: () => set({
        items: [], coupon_code: null, discount_cents: 0,
        loop_a_subtotal: 0, loop_b_subtotal: 0, grand_total_cents: 0, item_count: 0,
      }),

      setSessionId: (id) => set({ session_id: id }),
    }),
    { name: 'fhi-cart-v1' }
  )
)

function recompute(partial: Partial<CartState> & { items: CartItem[] }): Partial<CartState> {
  const items = partial.items
  const discount_cents = partial.discount_cents ?? 0
  const loop_a_subtotal = items
    .filter(i => i.product.loop === 'A')
    .reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0)
  const loop_b_subtotal = items
    .filter(i => i.product.loop === 'B')
    .reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0)
  const grand_total_cents = loop_a_subtotal + loop_b_subtotal - discount_cents
  const item_count = items.reduce((sum, i) => sum + i.quantity, 0)
  return { ...partial, loop_a_subtotal, loop_b_subtotal, grand_total_cents, item_count }
}
