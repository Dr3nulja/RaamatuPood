import MetadataManager from '@/components/admin/MetadataManager';

export default function AdminAuthorsPage() {
  return (
    <MetadataManager
      title="Authors"
      description="Manage author records used across the catalog and book forms."
      entityLabel="Author"
      listEndpoint="/api/authors"
      itemLabel="Author"
      collectionKey="authors"
    />
  );
}