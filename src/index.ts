import express from "express";
import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import {
	simpleGit,
	CheckRepoActions,
	GitConstructError,
	SimpleGit,
} from "simple-git";
import { GitHubApp } from "./GitHubApp";

dotenv.config();

const server = express();
const port = process.env.PORT;
const appId = process.env.APP_ID;
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY).toString();
const repoFolder = process.env.REPOSITORY_FOLDER;

const app = new GitHubApp(appId, privateKey);

server.get("/:repository", async (req, res) => {
	const repository = req.params.repository;

	let git: SimpleGit;

	try {
		git = simpleGit(path.join(repoFolder, repository));
	} catch (err) {
		if (err instanceof GitConstructError) {
			return res
				.status(400)
				.send(`Repository "${repository}" has not been created on the server.`);
		}

		console.error(err);
		return res.sendStatus(500);
	}

	if (!(await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))) {
		return res
			.status(400)
			.send(
				`"${repository}" has not been initialised as a repository on the server or is not the repo's root.`
			);
	}

	const token = await app.getInstallationToken();

	try {
		await git.pull(
			`https://x-access-token:${token}@github.com/TAServers/${repository}.git`
		);
	} catch (err) {
		console.error(err);
		return res.status(500).send("Failed to pull repository.");
	}

	res.sendStatus(200);
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
