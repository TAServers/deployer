import { App } from "octokit";

export class GitHubApp {
	app: App;

	constructor(appId: string | number, privateKey: string) {
		this.app = new App({ appId, privateKey });
	}

	async getInstallationToken() {
		const {
			data: { id },
		} = await this.app.octokit.rest.apps.getOrgInstallation({
			org: "TAServers",
		});

		const {
			data: { token },
		} = await this.app.octokit.rest.apps.createInstallationAccessToken({
			installation_id: id,
		});

		return token;
	}
}
