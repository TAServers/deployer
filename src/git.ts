import path from "path";
import { simpleGit, CheckRepoActions } from "simple-git";

export class FolderNotRepository extends Error {}

export async function pull(token: string, folder: string, repository: string) {
	const git = simpleGit(path.join(folder, repository));

	if (!(await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))) {
		throw new FolderNotRepository();
	}

	await git.remote([
		"set-url",
		"origin",
		`https://x-access-token:${token}@github.com/TAServers/${repository}.git`,
	]);
	await git.pull();
}

export async function clone(token: string, folder: string, repository: string) {
	const git = simpleGit(folder);

	await git.clone(
		`https://x-access-token:${token}@github.com/TAServers/${repository}.git`
	);
}
