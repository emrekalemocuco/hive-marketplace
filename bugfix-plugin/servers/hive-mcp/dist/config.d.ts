import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    JIRA_BASE_URL: z.ZodString;
    JIRA_EMAIL: z.ZodString;
    JIRA_API_TOKEN: z.ZodString;
    SOURCEGRAPH_URL: z.ZodString;
    SOURCEGRAPH_TOKEN: z.ZodString;
}, "strip", z.ZodTypeAny, {
    JIRA_BASE_URL: string;
    JIRA_EMAIL: string;
    JIRA_API_TOKEN: string;
    SOURCEGRAPH_URL: string;
    SOURCEGRAPH_TOKEN: string;
}, {
    JIRA_BASE_URL: string;
    JIRA_EMAIL: string;
    JIRA_API_TOKEN: string;
    SOURCEGRAPH_URL: string;
    SOURCEGRAPH_TOKEN: string;
}>;
export declare const config: {
    JIRA_BASE_URL: string;
    JIRA_EMAIL: string;
    JIRA_API_TOKEN: string;
    SOURCEGRAPH_URL: string;
    SOURCEGRAPH_TOKEN: string;
};
export type Config = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=config.d.ts.map