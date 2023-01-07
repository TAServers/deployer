import * as fs from "fs/promises";
import * as fsSync from "fs";

export async function isDirectory(path: string) {
	try {
		return (await fs.lstat(path)).isDirectory();
	} catch {
		return false;
	}
}

export function isDirectorySync(path: string) {
	try {
		return fsSync.lstatSync(path).isDirectory();
	} catch {
		return false;
	}
}
