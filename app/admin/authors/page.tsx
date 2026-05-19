import MetadataManager from '@/components/admin/MetadataManager';
import { createServerTranslator, detectServerLocale } from '@/lib/i18n/server';

export default async function AdminAuthorsPage() {
  const locale = await detectServerLocale();
  const { t } = createServerTranslator(locale);

  return (
    <MetadataManager
      title={t('admin.authors.title')}
      description={t('admin.authors.description')}
      entityLabel={t('admin.authors.entity')}
      listEndpoint="/api/authors"
      itemLabel={t('admin.authors.item')}
      collectionKey="authors"
    />
  );
}