import * as fs from "fs/promises";
import * as fsSync from "fs";
import { isDirectory, isDirectorySync } from "./isDirectory";

jest.mock("fs/promises");
jest.mock("fs");

describe("isDirectory", () => {
	test("returns true when path is directory", async () => {
		(fs.lstat as jest.Mock).mockResolvedValue({
			isDirectory: () => true,
		});

		const received = await isDirectory("some/path");

		expect(received).toBe(true);
	});

	test("returns false when path is not a directory", async () => {
		(fs.lstat as jest.Mock).mockResolvedValue({
			isDirectory: () => false,
		});

		const received = await isDirectory("some/path");

		expect(received).toBe(false);
	});

	test("returns false when error is thrown", async () => {
		(fs.lstat as jest.Mock).mockRejectedValue(new Error());

		const received = await isDirectory("some/path");

		expect(received).toBe(false);
	});
});

describe("isDirectorySync", () => {
	test("returns true when path is directory", async () => {
		(fsSync.lstatSync as jest.Mock).mockReturnValue({
			isDirectory: () => true,
		});

		const received = isDirectorySync("some/path");

		expect(received).toBe(true);
	});

	test("returns false when path is not a directory", async () => {
		(fsSync.lstatSync as jest.Mock).mockReturnValue({
			isDirectory: () => false,
		});

		const received = isDirectorySync("some/path");

		expect(received).toBe(false);
	});

	test("returns false when error is thrown", async () => {
		(fsSync.lstatSync as jest.Mock).mockImplementation(() => {
			throw new Error();
		});

		const received = isDirectorySync("some/path");

		expect(received).toBe(false);
	});
});
