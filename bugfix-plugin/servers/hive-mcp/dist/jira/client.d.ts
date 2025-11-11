import { JiraIssue, JiraAttachment, JiraComment, JiraCommentsResponse } from './types.js';
export declare class JiraClient {
    private client;
    private baseURL;
    constructor();
    /**
     * Get issue details by issue key or ID
     * @param issueIdOrKey - The issue key (e.g., PROJ-123) or ID
     * @param fields - Optional array of field names to fetch. If not specified, fetches all fields.
     */
    getIssue(issueIdOrKey: string, fields?: string[]): Promise<JiraIssue>;
    /**
     * Download attachment by attachment ID
     * Returns the attachment metadata and content as base64
     */
    downloadAttachment(attachmentId: string): Promise<{
        metadata: JiraAttachment;
        content: string;
        contentBase64: string;
    }>;
    /**
     * Get comments for an issue with pagination support
     * @param issueIdOrKey - The issue key (e.g., PROJ-123) or ID
     * @param startAt - The index of the first result to return (default: 0)
     * @param maxResults - The maximum number of comments to return (default: 5, max: 100)
     */
    getComments(issueIdOrKey: string, startAt?: number, maxResults?: number): Promise<JiraCommentsResponse>;
    /**
     * Add a comment to an issue
     */
    addComment(issueIdOrKey: string, commentText: string): Promise<JiraComment>;
}
//# sourceMappingURL=client.d.ts.map