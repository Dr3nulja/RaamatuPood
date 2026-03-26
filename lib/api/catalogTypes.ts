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

export type ReviewItem = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    name: string | null;
  };
};

export type ReviewsApiResponse = {
  reviews: ReviewItem[];
  reviewCount: number;
  averageRating: number;
  canReview: boolean;
  hasReviewed: boolean;
  isAuthenticated: boolean;
};

export type CreateReviewApiResponse = {
  review: ReviewItem;
  averageRating: number;
};
