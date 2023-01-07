import * as fs from "fs";
import path from "path";

import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import { GitConstructError } from "simple-git";

import { GitHubApp } from "./GitHubApp";
import * as git from "./git";
import { isDirectory, isDirectorySync } from "./isDirectory";

dotenv.config();

const server = express();
const port = process.env.PORT ?? 3000;
const appId = process.env.APP_ID;
const privateKeyPath = process.env.PRIVATE_KEY;
const repoFolder = process.env.REPOSITORY_FOLDER as string;

if (!appId) {
	throw new Error("Environment variable APP_ID not set");
}

if (!privateKeyPath) {
	throw new Error("Environment variable PRIVATE_KEY not set");
}

if (!repoFolder) {
	throw new Error("Environment variable REPOSITORY_FOLDER not set");
}
if (!isDirectorySync(repoFolder)) {
	throw new Error("REPOSITORY_FOLDER is not a directory");
}

const privateKey = fs.readFileSync(privateKeyPath).toString();
const app = new GitHubApp(appId, privateKey);

server.get("/:repository", async (req, res) => {
	const repository = req.params.repository;
	const token = await app.getInstallationToken();

	if (await isDirectory(path.join(repoFolder, repository))) {
		await git.pull(token, repoFolder, repository);
		res.sendStatus(200);
	} else {
		await git.clone(token, repoFolder, repository);
		res.sendStatus(200);
	}
});

server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof git.FolderNotRepository) {
		return res
			.status(500)
			.send(
				"Folder exists but has not been initialised as a repository on the server or is not the repo's root."
			);
	}

	if (err instanceof GitConstructError) {
		return res
			.status(500)
			.send(
				"Failed to access repository folder. Please contact a system administrator."
			);
	}

	console.error(err);
	res.sendStatus(500);
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
