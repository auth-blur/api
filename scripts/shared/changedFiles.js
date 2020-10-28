const exec = require("./exec");

const changedFiles = (() => {
    const execGit = args =>
        exec("git", args)
            .trim()
            .toString()
            .split("\n");
    const mergeBase = execGit(["merge-base", "HEAD", "master"]);
    return new Set([
        ...execGit(["diff", "--name-only", "--diff-filter=ACMRTUB", mergeBase]),
        ...execGit(["ls-files", "--others", "--exclude-standard"]),
    ]);
})();

module.exports = changedFiles;
