import { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
/**
 * Resource templates for Jira
 */
export declare const jiraResourceTemplates: ResourceTemplate[];
/**
 * List available Jira resources
 */
export declare function listJiraResources(): Promise<Resource[]>;
/**
 * Read a Jira resource by URI
 */
export declare function readJiraResource(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType?: string;
        text?: string;
        blob?: string;
    }>;
}>;
//# sourceMappingURL=resources.d.ts.map