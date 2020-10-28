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
