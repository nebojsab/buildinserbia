import { getDocumentLibraryState } from "@/lib/documentLibraryState";
import { corsHeaders } from "@/lib/publicSiteCors";

export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  if (!headers.has("Access-Control-Allow-Origin")) {
    return new Response(null, { status: 204 });
  }
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Cache-Control, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const state = await getDocumentLibraryState();
  const body = {
    documents: state.documents,
    categories: state.categories,
  };
  const headers = corsHeaders(request);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { headers });
}
