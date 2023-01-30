import { FolderNotRepository, pull, clone } from "./git";
import { simpleGit } from "simple-git";

jest.mock("simple-git");

describe("pull", () => {
	test("calls SimpleGit.pull with valid remote url", async () => {
		const remoteMock = jest.fn();
		const pullMock = jest.fn();
		(simpleGit as jest.Mock).mockReturnValue({
			checkIsRepo: async () => true,
			remote: remoteMock,
			pull: pullMock,
		});

		await pull("token", "b", "repository");

		expect(remoteMock).toHaveBeenCalledTimes(1);
		expect(remoteMock).toHaveBeenCalledWith([
			"set-url",
			"origin",
			"https://x-access-token:token@github.com/TAServers/repository.git",
		]);
		expect(pullMock).toHaveBeenCalledTimes(1);
	});

	test("throws FolderNotRepository error when SimpleGit.checkIsRepo returns false", async () => {
		(simpleGit as jest.Mock).mockReturnValue({
			checkIsRepo: async () => false,
			pull: async () => undefined,
		});

		await expect(pull("a", "b", "c")).rejects.toThrow(FolderNotRepository);
	});
});

describe("clone", () => {
	test("calls SimpleGit.clone with valid remote url", async () => {
		const cloneMock = jest.fn();
		(simpleGit as jest.Mock).mockReturnValue({
			checkIsRepo: async () => true,
			clone: cloneMock,
		});

		await clone("token", "b", "repository");

		expect(cloneMock).toHaveBeenCalledTimes(1);
		expect(cloneMock).toHaveBeenCalledWith(
			"https://x-access-token:token@github.com/TAServers/repository.git"
		);
	});
});
