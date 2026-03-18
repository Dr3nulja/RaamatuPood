export type BookWithRelations = {
  id: number;
  title: string;
  price: number;
  rating: number | null;
  cover_image: string | null;
  stock: number;
  author: {
    name: string | null;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
};

export type BooksApiResponse = {
  books: BookWithRelations[];
};

export type CategoryOption = {
  id: number;
  name: string;
};

export type CategoriesApiResponse = {
  categories: CategoryOption[];
};

export type BooksSort = 'price_asc' | 'price_desc' | 'rating_desc';
