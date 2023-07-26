const fetch = require("node-fetch");
const core = require("@actions/core");

async function checkBranchExistence(owner, repo, branchLabel, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${branchLabel}`;

    const response = await fetch(url, {
        headers: {
            method: "GET",
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 200) {
        return true;
    }

    if (response.status === 404) {
        return false;
    }

    throw new Error(`Unexpected response status ${response.status}`);
}

/**
 *
 * @returns {string[]} The labels for the current PR
 */
function getPrLabels() {
    let labels = [];

    const processEnvPrLabels = process.env.CURRENT_PR_LABELS;

    if (!processEnvPrLabels) {
        throw new Error("No labels found in process.env.CURRENT_PR_LABELS");
    }

    try {
        labels = JSON.parse(processEnvPrLabels);
    } catch (error) {
        throw new Error(
            `Error parsing process.env.CURRENT_PR_LABELS: ${error}`
        );
    }

    return labels;
}

(async function () {
    const prLabels = getPrLabels();

    const owner = "openfin";
    const repo = process.argv[2];
    const token = process.argv[2];

    if (!repo) {
        throw new Error("No repo name provided");
    }
    if (!token) {
        throw new Error("No Github token provided");
    }

    const releaseBranchLabel = branchLabels.find((label) =>
        label.startsWith("release/")
    );

    console.log(`Found release branch label: ${releaseBranchLabel}`);

    if (!releaseBranchLabel) {
        core.setOutput("targetBranchExists", false);
        process.exit(0);
    }

    const branchExists = await checkBranchExistence(
        owner,
        repo,
        releaseBranchLabel,
        token
    );

    if (branchExists) {
        core.setOutput("targetBranchExists", true);
        core.setOutput("targetBranchName", releaseBranchLabel);
    } else {
        core.setOutput("targetBranchExists", false);
    }
})();
