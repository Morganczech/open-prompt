
import { NextRequest, NextResponse } from "next/server";
import { fetchFromGitHub, saveToGitHub } from "@/lib/githubSync";

// Force dynamic to ensure we don't cache this route incorrectly on Netlify
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const owner = process.env.REPO_OWNER;
        const repo = process.env.REPO_NAME;
        const path = process.env.REPO_PATH || 'prompt-builder-data.json';

        if (!owner || !repo) {
            return NextResponse.json({ error: "Missing GitHub repository configuration (REPO_OWNER, REPO_NAME)." }, { status: 500 });
        }

        const data = await fetchFromGitHub(owner, repo, path);
        return NextResponse.json(data || {});
    } catch (error: any) {
        console.error("API GET /sync error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const owner = process.env.REPO_OWNER;
        const repo = process.env.REPO_NAME;
        const path = process.env.REPO_PATH || 'prompt-builder-data.json';

        if (!owner || !repo) {
            return NextResponse.json({ error: "Missing GitHub repository configuration (REPO_OWNER, REPO_NAME)." }, { status: 500 });
        }

        const body = await req.json();
        const { components, prompts, lastUpdated } = body;

        if (!components || !prompts) {
            return NextResponse.json({ error: "Invalid payload. Missing components or prompts." }, { status: 400 });
        }

        const syncData = {
            components,
            prompts,
            lastUpdated: lastUpdated || new Date().toISOString(),
        };

        await saveToGitHub(owner, repo, path, syncData);

        return NextResponse.json({ success: true, message: "Saved to GitHub" });
    } catch (error: any) {
        console.error("API POST /sync error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
