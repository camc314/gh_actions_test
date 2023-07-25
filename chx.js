const fetch = require("node-fetch");

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

// read new line separated labels from stdin
function readFromStdin() {
    return new Promise((resolve, reject) => {
        let data = "";

        process.stdin.on("readable", () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                data += chunk;
            }
        });

        process.stdin.on("end", () => {
            resolve(data);
        });

        process.stdin.on("error", (err) => {
            reject(err);
        });
    });
}

(async function () {
    const owner = "openfin";
    const repo = process.argv[2];

    const stdin = await readFromStdin();
    console.log(`Stdin: "${stdin}"`);
    const branchLabels = stdin.split("\n");
    console.log(`Stdin (split): "${branchLabels}"`);
    const releaseBranchLabel = branchLabels.find((label) =>
        label.startsWith("release/")
    );

    console.log(`Release branch label: ${releaseBranchLabel}`);

    if (!releaseBranchLabel) {
        console.error("Fail - No valid release branch label found");
        process.exit(1); // Exit with an error
    }

    const token = process.argv[3];

    checkBranchExistence(owner, repo, releaseBranchLabel, token)
        .then((branchExists) => {
            if (branchExists) {
                console.log("Success");
            } else {
                console.error("Fail - Release branch does not exist");
                process.exit(1); // Exit with an error
            }
        })
        .catch((error) => {
            console.error("Fail - Error occurred", error);
            process.exit(1); // Exit with an error
        });
})();
