import * as fs from "fs/promises";

export async function isDirectory(path: string) {
	try {
		return (await fs.lstat(path)).isDirectory();
	} catch {
		return false;
	}
}
