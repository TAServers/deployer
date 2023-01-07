import request from "supertest";
import server from "./server";

import { isDirectory } from "./isDirectory";
import { pull, clone } from "./git";

jest.mock("./config", () => ({
	appId: 1234,
	privateKey: "jest",
	repositoryFolder: "folder",
}));

jest.mock("./GitHubApp", () => {
	class GitHubApp {
		async getInstallationToken() {
			return "token";
		}
	}

	return {
		GitHubApp,
	};
});

jest.mock("./isDirectory");
jest.mock("./git");

afterEach(() => {
	jest.resetAllMocks();
});

describe("POST /:repository", () => {
	test("pulls changes", async () => {
		(isDirectory as jest.Mock).mockReturnValue(true);

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(200);
		expect(pull).toHaveBeenCalledTimes(1);
		expect(pull).toHaveBeenCalledWith("token", "folder", "repository");
	});

	test("clones repository", async () => {
		(isDirectory as jest.Mock).mockReturnValue(false);

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(200);
		expect(clone).toHaveBeenCalledTimes(1);
		expect(clone).toHaveBeenCalledWith("token", "folder", "repository");
	});
});
