import request from "supertest";
import server from "./server";
import { GitConstructError, GitError } from "simple-git";

import { isDirectory } from "./isDirectory";
import { pull, clone, FolderNotRepository } from "./git";

jest.mock("simple-git", () => {
	class GitConstructError extends Error {}
	class GitError extends Error {}

	return { GitConstructError, GitError };
});

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

	return { GitHubApp };
});

jest.mock("./isDirectory");
jest.mock("./git");

afterEach(() => {
	jest.resetAllMocks();
});

describe("POST /:repository", () => {
	test("pulls changes", async () => {
		(isDirectory as jest.Mock).mockResolvedValue(true);

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(200);
		expect(pull).toHaveBeenCalledTimes(1);
		expect(pull).toHaveBeenCalledWith("token", "folder", "repository");
	});

	test("clones repository", async () => {
		(isDirectory as jest.Mock).mockResolvedValue(false);

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(200);
		expect(clone).toHaveBeenCalledTimes(1);
		expect(clone).toHaveBeenCalledWith("token", "folder", "repository");
	});

	test("responds with status 500 when containing folder does not exist", async () => {
		(isDirectory as jest.Mock).mockResolvedValue(false);
		(clone as jest.Mock).mockRejectedValue(
			new (GitConstructError as unknown as jest.Mock)()
		);

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(500);
		expect(res.text).not.toBe("Internal Server Error");
		expect(res.text).toMatchInlineSnapshot(
			`"Failed to access repository folder. Please contact a system administrator."`
		);
	});

	test("responds with status 500 when folder to pull is not a git repository", async () => {
		(isDirectory as jest.Mock).mockResolvedValue(true);
		(pull as jest.Mock).mockRejectedValue(new FolderNotRepository());

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(500);
		expect(res.text).not.toBe("Internal Server Error");
		expect(res.text).toMatchInlineSnapshot(
			`"Folder exists but has not been initialised as a repository on the server or is not the repo's root."`
		);
	});

	test("responds with status 500 when an internal git error occurs", async () => {
		(isDirectory as jest.Mock).mockResolvedValue(true);
		(pull as jest.Mock).mockRejectedValue(new GitError());

		const res = await request(server).post("/repository");

		expect(res.statusCode).toBe(500);
		expect(res.text).not.toBe("Internal Server Error");
		expect(res.text).toMatchInlineSnapshot(
			`"Failed to access remote repository."`
		);
	});
});
