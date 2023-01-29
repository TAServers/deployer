import path from "path";

import express, { Request, Response, NextFunction } from "express";
import { GitConstructError, GitError } from "simple-git";
import morgan from "morgan";

import { GitHubApp } from "./GitHubApp";
import * as git from "./git";
import { isDirectory } from "./isDirectory";

import config from "./config";

const server = express();
const app = new GitHubApp(config.appId, config.privateKey);

server.use(morgan("combined"));

server.post("/:repository", async (req, res, next) => {
	try {
		const repository = req.params.repository;
		const token = await app.getInstallationToken();

		if (await isDirectory(path.join(config.repositoryFolder, repository))) {
			await git.pull(token, config.repositoryFolder, repository);
			res.sendStatus(200);
		} else {
			await git.clone(token, config.repositoryFolder, repository);
			res.sendStatus(200);
		}
	} catch (err) {
		next(err);
	}
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err);

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

	if (err instanceof GitError) {
		return res.status(500).send("Failed to access remote repository.");
	}

	res.sendStatus(500);
});

export default server;
