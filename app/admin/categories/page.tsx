import MetadataManager from '@/components/admin/MetadataManager';

export default function AdminCategoriesPage() {
  return (
    <MetadataManager
      title="Categories"
      description="Manage categories used in the bookstore navigation and book editor."
      entityLabel="Category"
      listEndpoint="/api/categories"
      itemLabel="Category"
      collectionKey="categories"
    />
  );
}