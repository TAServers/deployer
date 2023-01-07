import * as fs from "fs/promises";
import { isDirectory } from "./isDirectory";

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
