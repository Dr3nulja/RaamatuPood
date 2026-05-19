import MetadataManager from '@/components/admin/MetadataManager';
import { createServerTranslator, detectServerLocale } from '@/lib/i18n/server';

export default async function AdminCategoriesPage() {
  const locale = await detectServerLocale();
  const { t } = createServerTranslator(locale);

  return (
    <MetadataManager
      title={t('admin.categories.title')}
      description={t('admin.categories.description')}
      entityLabel={t('admin.categories.entity')}
      listEndpoint="/api/categories"
      itemLabel={t('admin.categories.item')}
      collectionKey="categories"
    />
  );
}