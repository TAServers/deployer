import express from "express";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { App } from "octokit";

dotenv.config();

const server = express();
const port = process.env.PORT;
const appId = process.env.APP_ID;
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY).toString();

const app = new App({ appId, privateKey });

server.get("/", async (req, res) => {
	const {
		data: { id },
	} = await app.octokit.rest.apps.getOrgInstallation({
		org: "TAServers",
	});

	const {
		data: { token },
	} = await app.octokit.rest.apps.createInstallationAccessToken({
		installation_id: id,
	});

	res.send(token);
});

server.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});
