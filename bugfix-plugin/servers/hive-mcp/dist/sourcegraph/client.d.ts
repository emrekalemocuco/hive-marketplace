import { SourcegraphSearchResult, SourcegraphSearchQuery, DeepSearchConversation } from './types.js';
export declare class SourcegraphClient {
    private graphqlClient;
    private restClient;
    constructor();
    /**
     * Search code using Sourcegraph's GraphQL API
     */
    searchCode(searchQuery: SourcegraphSearchQuery): Promise<SourcegraphSearchResult>;
    /**
     * Deep Search API - AI-powered code search using REST API
     * Creates a conversation and waits for the answer
     *
     * Reference: https://sourcegraph.com/docs/deep-search/api
     */
    deepSearch(question: string, options?: {
        maxPollAttempts?: number;
        pollIntervalMs?: number;
    }): Promise<DeepSearchConversation>;
    /**
     * Get a Deep Search conversation by ID
     */
    getDeepSearchConversation(conversationId: number): Promise<DeepSearchConversation>;
    /**
     * Add a follow-up question to an existing Deep Search conversation
     */
    addDeepSearchFollowup(conversationId: number, question: string, options?: {
        maxPollAttempts?: number;
        pollIntervalMs?: number;
    }): Promise<DeepSearchConversation>;
}
//# sourceMappingURL=client.d.ts.map