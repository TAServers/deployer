import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

export class ConfigError extends Error {}

class Config {
	appId: string;
	privateKey: string;
	repositoryFolder: string;

	constructor() {
		const appId = process.env.APP_ID;
		const privateKeyPath = process.env.PRIVATE_KEY;
		const repositoryFolder = process.env.REPOSITORY_FOLDER as string;

		if (!appId) {
			throw new ConfigError("Environment variable APP_ID not set");
		}

		if (!privateKeyPath) {
			throw new ConfigError("Environment variable PRIVATE_KEY not set");
		}

		if (!repositoryFolder) {
			throw new ConfigError("Environment variable REPOSITORY_FOLDER not set");
		}

		this.appId = appId;
		this.repositoryFolder = repositoryFolder;

		try {
			this.privateKey = fs.readFileSync(privateKeyPath).toString();
		} catch {
			throw new ConfigError("Failed to read private key");
		}
	}
}

export default new Config();
