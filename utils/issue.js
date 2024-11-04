const core = require('@actions/core');
const github = require('@actions/github');

async function findExistingIssue(octokit, owner, repo, issueTitle) {
    try {
        // Prepare the search query
        // We need to escape any special characters in the title
        const escapedTitle = issueTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const query = `repo:${owner}/${repo} is:issue is:open in:title "${escapedTitle}"`;

        core.debug(`Searching for issues with query: ${query}`);

        const searchResult = await octokit.rest.search.issuesAndPullRequests({
            q: query,
            per_page: 1, // We only need the first match
            sort: 'updated',
            order: 'desc'
        });

        // If we found a matching issue, return it
        if (searchResult.data.total_count > 0) {
            const issue = searchResult.data.items[0];
            core.debug(`Found existing issue: #${issue.number}`);
            return issue;
        }

        core.debug('No existing issue found');
        return null;
    } catch (error) {
        core.warning(`Failed to search for existing issues: ${error.message}`);
        // Log detailed error information for debugging
        if (error.response) {
            core.debug(`Status: ${error.response.status}`);
            core.debug(`Response body: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

export async function createOrUpdateIssue(record, assignees) {
    try {
        const token = core.getInput('github-token');
        const octokit = github.getOctokit(token);

        // Get repository information from context
        const context = github.context;
        const { owner, repo } = context.repo;

        // Generate issue title
        const issueTitle = `🚨 Domain ${record.checkType} Alert: ${record.name} Expiring Domains Detected`;

        // Generate issue body with timestamp in issue content
        const issueBody = await generateIssueContent(record);

        // Parse assignees string to array
        const assigneesList = assignees
            .split(',')
            .map(a => a.trim())
            .filter(a => a !== '');

        // Search for existing issue using the improved search function
        const existingIssue = await findExistingIssue(octokit, owner, repo, issueTitle);

        let issueData;
        if (existingIssue) {
            // Update existing issue
            issueData = await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: existingIssue.number,
                body: issueBody,
                assignees: assigneesList
            });
            core.info(`Updated existing issue #${existingIssue.number}: ${existingIssue.html_url}`);
        } else {
            // Create labels based on check type
            const labels = [`domain-${record.checkType}-check`, 'automated', 'maintenance'];

            // Create new issue
            issueData = await octokit.rest.issues.create({
                owner,
                repo,
                title: issueTitle,
                body: issueBody,
                labels: labels,
                assignees: assigneesList
            });
            core.info(`Created new issue: ${issueData.data.html_url}`);
        }

        const issue = existingIssue || issueData.data;
        core.setOutput('issue_url', issue.html_url);
        core.setOutput('issue_number', issue.number);

        return issue;
    } catch (error) {
        core.error('Failed to create/update issue:');
        core.error(error);
        throw error;
    }
}

// Helper function to generate issue body
export async function generateIssueContent(record) {
    const now = new Date().toISOString().split('T')[0];
    let issueBody = `## Domain ${record.checkType} Check Results\n\n`;
    issueBody += `Last Updated: ${now}\n\n`;
    issueBody += `The following domains require attention:\n\n`;
    issueBody += `| Domain | Days Left | Expiry Date |\n`;
    issueBody += `|--------|-----------|-------------|\n`;
    issueBody += `| ${record.name} | ${record.daysLeft} | ${record.expireDate} |\n`;

    if (!!record.extra) {
        issueBody += "\n### Extra Info\n"
	issueBody += `${record.extra}\n`
    }

    issueBody += `\n### Action Required\n`;
    issueBody += `Please review these domains and take necessary action to prevent service interruption.\n\n`;
    issueBody += `---\n*This issue is automatically updated by GitHub Actions*`;

    return issueBody;
}
