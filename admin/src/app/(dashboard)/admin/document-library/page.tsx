import { DOCUMENT_CATEGORIES_BY_LOCALE } from "@shared/content/repository";
import { ContentAdminManager } from "@/components/content/ContentAdminManager";
import { getServerContentByType } from "@/lib/contentStoreServer";

export default async function AdminDocumentLibraryPage() {
  const initialItems = await getServerContentByType("document");
  return (
    <ContentAdminManager
      title="Document Library"
      description="Create, edit, preview, and manage planning documents for the public Documents hub."
      type="document"
      categoryOptions={DOCUMENT_CATEGORIES_BY_LOCALE}
      ctaVerb="document"
      initialItems={initialItems}
      backupUrl="/api/backup/documents"
      backupLabel="Backup all documents"
    />
  );
}
