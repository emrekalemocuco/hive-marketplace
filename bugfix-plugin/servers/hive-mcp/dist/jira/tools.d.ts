import { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Default fields to fetch for Jira issues to keep response size manageable
 * These cover the most essential information without bloating the response
 * Intentionally excludes:
 * - description (can be very large, request explicitly if needed)
 * - comment (use jira_get_comments tool instead)
 * - attachment (use jira_list_attachments tool instead)
 * - Large optional fields (labels, components, etc. - request explicitly if needed)
 */
export declare const DEFAULT_JIRA_FIELDS: string[];
/**
 * Jira MCP Tools
 */
export declare const jiraGetIssueTool: Tool;
export declare function handleJiraGetIssue(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare const jiraGetCommentsTool: Tool;
export declare function handleJiraGetComments(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare const jiraAddCommentTool: Tool;
export declare function handleJiraAddComment(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare const jiraListAttachmentsTool: Tool;
export declare function handleJiraListAttachments(args: any): Promise<{
    content: ({
        type: "text";
        text: string;
        data?: undefined;
        mimeType?: undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string | undefined;
        text?: undefined;
    })[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare const jiraReadAttachmentTool: Tool;
export declare function handleJiraReadAttachment(args: any): Promise<{
    content: ({
        type: "text";
        text: string;
        data?: undefined;
        mimeType?: undefined;
    } | {
        type: "image";
        data: string;
        mimeType: string | undefined;
        text?: undefined;
    })[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
export declare const jiraTools: {
    [x: string]: unknown;
    name: string;
    inputSchema: {
        [x: string]: unknown;
        type: "object";
        properties?: {
            [x: string]: unknown;
        } | undefined;
        required?: string[] | undefined;
    };
    description?: string | undefined;
    title?: string | undefined;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
    icons?: {
        [x: string]: unknown;
        src: string;
        mimeType?: string | undefined;
        sizes?: string[] | undefined;
    }[] | undefined;
    outputSchema?: {
        [x: string]: unknown;
        type: "object";
        properties?: {
            [x: string]: unknown;
        } | undefined;
        required?: string[] | undefined;
    } | undefined;
    annotations?: {
        [x: string]: unknown;
        title?: string | undefined;
        readOnlyHint?: boolean | undefined;
        destructiveHint?: boolean | undefined;
        idempotentHint?: boolean | undefined;
        openWorldHint?: boolean | undefined;
    } | undefined;
}[];
export declare const jiraHandlers: {
    jira_get_issue: typeof handleJiraGetIssue;
    jira_get_comments: typeof handleJiraGetComments;
    jira_add_comment: typeof handleJiraAddComment;
    jira_list_attachments: typeof handleJiraListAttachments;
    jira_read_attachment: typeof handleJiraReadAttachment;
};
//# sourceMappingURL=tools.d.ts.map