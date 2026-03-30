export type AdminBook = {
  id: number;
  title: string;
  price: number;
  stock: number;
  description: string | null;
  cover_image: string | null;
  author_id: number | null;
  category_id: number | null;
  author_name: string | null;
  category_name: string | null;
};

export type AdminAuthorOption = {
  id: number;
  name: string;
};

export type AdminCategoryOption = {
  id: number;
  name: string;
};

export type AdminBooksResponse = {
  books: AdminBook[];
  authors: AdminAuthorOption[];
  categories: AdminCategoryOption[];
};

export type AdminOrderBookItem = {
  id: number;
  book_id: number | null;
  title: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: number;
  user_email: string;
  total_price: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: AdminOrderBookItem[];
};

export type AdminOrdersResponse = {
  orders: AdminOrder[];
};
