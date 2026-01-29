import { Octokit } from "@octokit/rest";

// Initialize Octokit with the auth token
// Note: In a real environment, this should be a server-side only file to protect the token
// However, since this is a local/private app "Save/Load", we use it in API routes.

const getOctokit = () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN is not defined in environment variables.");
    }
    return new Octokit({ auth: token });
};

interface SyncData {
    components: any[];
    prompts: any[];
    lastUpdated: string;
}

export const fetchFromGitHub = async (owner: string, repo: string, path: string): Promise<SyncData | null> => {
    try {
        const octokit = getOctokit();
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });

        if (Array.isArray(data)) {
            throw new Error("Target path is a directory, not a file.");
        }

        if (!('content' in data)) {
            throw new Error("No content found in file.");
        }

        const content = Buffer.from(data.content, "base64").toString("utf-8");
        return JSON.parse(content);
    } catch (error: any) {
        if (error.status === 404) {
            console.log("File not found on GitHub, returning null.");
            return null;
        }
        console.error("Error fetching from GitHub:", error);
        throw error;
    }
};

export const saveToGitHub = async (owner: string, repo: string, path: string, content: SyncData, message: string = "Update from Prompt Builder") => {
    const octokit = getOctokit();

    // 1. Get current SHA if file exists (needed for update)
    let sha: string | undefined;
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });
        if (!Array.isArray(data) && 'sha' in data) {
            sha = data.sha;
        }
    } catch (error: any) {
        if (error.status !== 404) { // Ignore 404 (file doesn't exist yet)
            throw error;
        }
    }

    // 2. Create or Update file
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha,
    });
};
