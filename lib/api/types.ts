export type ApiErrorResponse = {
  error: string;
  code?: string;
};

export type CartBookItemDto = {
  id: number;
  title: string;
  author?: string;
  price: number;
  cover_image?: string;
  quantity: number;
  stock: number;
};

export type CartResponse = {
  items: CartBookItemDto[];
};

export type ShippingMethodDto = {
  id: number;
  name: string | null;
  price: number | null;
};

export type OrderItemDto = {
  id: number;
  book_id: number | null;
  title: string;
  quantity: number;
  price: number;
};

export type AddressDto = {
  id: number;
  country: string | null;
  city: string | null;
  street: string | null;
  postal_code: string | null;
};

export type OrderHistoryItemDto = {
  id: number;
  total_price: number;
  status: string;
  stripe_payment_id: string | null;
  created_at: string;
  address: AddressDto | null;
  shipping_method: ShippingMethodDto | null;
  order_items: OrderItemDto[];
};

export type OrdersHistoryResponse = {
  orders: OrderHistoryItemDto[];
};

export type CheckoutSuccessResponse = {
  ok: true;
  orderId: number;
  stripePaymentId: string;
  checkoutUrl: string;
};

export type CheckoutErrorCode =
  | 'unauthorized'
  | 'user_not_found'
  | 'missing_fields'
  | 'empty_cart'
  | 'invalid_shipping_method'
  | 'stock_exceeded'
  | 'checkout_failed';

export type CheckoutErrorResponse = {
  ok: false;
  error: string;
  code: CheckoutErrorCode;
  details?: string;
};

export type CheckoutResponse = CheckoutSuccessResponse | CheckoutErrorResponse;
