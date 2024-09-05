import { SearchResult, SearchResults } from "../domains/SearchResult";

export default class GoogleCustomSearchGateway {
  constructor(private options: { apiKey: string; engineId: string }) {}

  private buildUrl(query: string): string {
    const searchParams = new URLSearchParams({
      key: this.options.apiKey,
      cx: this.options.engineId,
      q: query,
    });
    return `https://www.googleapis.com/customsearch/v1?${searchParams}`;
  }

  async search(query: string): Promise<SearchResults> {
    const response = await fetch(this.buildUrl(query));
    const data = await response.json();

    if (!data.searchInformation) {
      console.error(
        "Error searching with Google",
        response.status,
        JSON.stringify(data, null, 2)
      );
      return {
        results: [],
        totalResults: 0,
      };
    }

    console.debug(
      "Searching with Google",
      query,
      data.searchInformation.totalResults
    );

    if (data.items && data.items.length > 0) {
      return SearchResults.parse({
        results: data.items.map((item: any) => {
          return SearchResult.parse({
            title: item.title,
            url: item.link,
            description: item.snippet,
            googlePageMap: item.pagemap,
          });
        }),
        totalResults: Number(data.searchInformation.totalResults),
        rawResults: data,
      });
    }

    return SearchResults.parse({
      results: [],
      totalResults: 0,
    });
  }
}
