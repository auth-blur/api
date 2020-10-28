const glob = require("glob");
const prettier = require("prettier");
const fs = require("fs");
const configPath = require.resolve("../../.prettierrc");

const { execFileSync } = require("child_process");

const changedFiles = (() => {
    const exec = (command, args) => {
        console.log("> " + [command].concat(args).join(" "));
        const opt = {
            cwd: process.cwd(),
            env: process.env,
            stdio: "pipe",
            encoding: "utf-8",
        };
        return execFileSync(command, args, opt);
    };
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

const mode = process.argv[2] || "check";
const shouldWrite = ["write", "write-changed"].includes(mode);
const onlyChanged = ["check-changed", "write-changed"].includes(mode);

let didWarn = false;
let didErr = false;

const files = glob
    .sync("*(src|libs|test|scripts)/**/*.*(ts|js)")
    .filter(f => !onlyChanged || changedFiles.has(f));

files.forEach(f => {
    const options = Object.assign(
        {},
        prettier.resolveConfig.sync(f, {
            config: configPath,
        }),
        { parser: "typescript" },
    );

    try {
        const input = fs.readFileSync(f, "utf-8");
        if (shouldWrite) {
            const output = prettier.format(input, options);
            if (output !== input) fs.writeFileSync(f, output, "utf-8");
        } else if (!prettier.check(input, options)) {
            if (didWarn) {
                console.log(
                    [
                        "This project uses prettier to format all code",
                        "Please run `npm run format`",
                        "and add changes to files listed below to your commit: \n",
                    ].join("\n"),
                );
                didWarn = true;
            }
            console.log(f);
        }
    } catch (e) {
        didErr = true;
        console.log("\n" + e.message);
        console.log(f);
    }
});

console.log("Mode:", mode);
console.log("File Size:", files.length);

if (didWarn || didErr) {
    process.exit(1);
}
