import { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Sourcegraph MCP Tools
 */
export declare const sourcegraphSearchCodeTool: Tool;
export declare function handleSourcegraphSearchCode(args: any): Promise<{
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
export declare const sourcegraphDeepSearchTool: Tool;
export declare function handleSourcegraphDeepSearch(args: any): Promise<{
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
export declare const sourcegraphTools: {
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
export declare const sourcegraphHandlers: {
    sourcegraph_search_code: typeof handleSourcegraphSearchCode;
    sourcegraph_deep_search: typeof handleSourcegraphDeepSearch;
};
//# sourceMappingURL=tools.d.ts.map