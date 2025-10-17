const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// === CONFIG ===
const repoUrl = "https://github.com/bhaskar-gusain/akhila.git";
const localDir = "./git"; // local clone directory
const tsFile = "main.ts";       // file to transpile
const transpiler = "./con.js";  // your transpiler script
const outputCpp = "main.cpp";

// === STEP 1: Clone or pull repo ===
if (!fs.existsSync(localDir)) {
	console.log("Cloning repo...");
	execSync(`git clone ${repoUrl} ${localDir}`, { stdio: "inherit" });
} else {
	console.log("Pulling latest changes...");
	execSync(`git -C ${localDir} pull origin master`, { stdio: "inherit" });
}

// === STEP 2: Check if .ts file exists ===
const tsPath = path.join(localDir, tsFile);
if (!fs.existsSync(tsPath)) {
	console.error(`TypeScript file not found: ${tsPath}`);
	process.exit(1);
}

// === STEP 3: Copy .ts to transpiler working dir ===
const tsCopyPath = path.join(__dirname, tsFile);
fs.copyFileSync(tsPath, tsCopyPath);
console.log(`Copied ${tsFile} to transpiler directory.`);

// === STEP 4: Run transpiler ===
console.log("Running transpiler...");
execSync(`node ${transpiler}`, { stdio: "inherit" });

// === STEP 5: Move generated main.cpp to repo dir (optional) ===
const cppPath = path.join(__dirname, outputCpp);
const cppDest = path.join(localDir, outputCpp);
fs.copyFileSync(cppPath, cppDest);
console.log(`Generated ${outputCpp} copied to repo folder.`);

console.log("Automation complete.");


try {
	execSync("bash ./docker.sh", { stdio: "inherit" });
	console.log("Shell script executed successfully!");
} catch (err) {
	console.error("Error executing script:", err.message);
}
