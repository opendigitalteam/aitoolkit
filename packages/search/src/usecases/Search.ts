import { SearchResult } from "../domains/SearchResult";
import GoogleCustomSearchGateway from "../gateways/GoogleCustomSearchGateway";

type SearchRequest = {
  gateway: GoogleCustomSearchGateway;
  query: string;
};

// type SearchWithCacheRequest = {
//   domain: Domain;
//   query: string;
// };

type SearchResponse =
  | {
      ok: true;
      results: SearchResult[];
      totalResults: number;
      rawResults: any;
      fromCache?: boolean;
    }
  | {
      ok: false;
      totalResults: undefined;
      results: undefined;
      rawResults: undefined;
    };

export default async function Search(
  request: SearchRequest
): Promise<SearchResponse> {
  try {
    const { results, totalResults, rawResults } = await request.gateway.search(
      request.query
    );
    return {
      ok: true,
      totalResults,
      results,
      rawResults,
    };
  } catch (err) {
    console.error("Error searching", err);
    return {
      ok: false,
      results: undefined,
      totalResults: undefined,
      rawResults: undefined,
    };
  }
}

// export async function SearchWithCache(
//   request: SearchWithCacheRequest,
// ): Promise<SearchResponse> {
//   const rawDataGateway = new RawDataS3Gateway();

//   const rawData = await rawDataGateway.getRawDataByDomainAndRelatedEntitySafely(
//     request.domain,
//     "SearchResult",
//     request.query,
//   );

//   if (rawData) {
//     return { ok: true, fromCache: true, results: rawData.raw.results };
//   }

//   const response = await Search(request);

//   if (response.ok) {
//     await SaveRawData({
//       domain: request.domain,
//       relatedEntityName: "SearchResult",
//       relatedEntityReference: request.query,
//       rawData: response,
//     });
//   }

//   return response;
// }
