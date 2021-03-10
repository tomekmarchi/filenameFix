import * as fs from 'fs';
const {
	promises: {
		writeFile,
		readFile,
		readdir
	}
} = fs;
import {
	normalize,
	join,
	resolve
} from 'path';
const {
	parse: jsonParse
} = JSON;
async function write(filePath, contents, encode) {
	await writeFile(normalize(filePath), contents, encode);
}
async function read(filePath, encode) {
	const file = await readFile(normalize(filePath), encode);
	return file;
}
async function copy(source, destination, config) {
	let file = await read(source);
	if (config) {
		if (config.prepend) {
			file = config.prepend + file;
		}
		if (config.append) {
			file = file + config.append;
		}
	}
	await write(normalize(destination), file);
}
async function readJson(filePath) {
	return jsonParse(await readFile(normalize(filePath)));
}
async function list(directory) {
	const folderPath = normalize(directory);
	const files = await readdir(folderPath, {
		withFileTypes: true
	});
	return files.filter((dirent) => {
		return dirent.isFile();
	}).map((dirent) => {
		return dirent.name;
	});
}
async function listFolders(directory) {
	const folderPath = normalize(directory);
	const files = await readdir(folderPath, {
		withFileTypes: true
	});
	return files.filter((dirent) => {
		return !dirent.isFile();
	}).map((dirent) => {
		return dirent.name;
	});
}
async function lsFiles(subFolder) {
	const folderPath = join(`${resolve()}/${subFolder}`);
	return list(folderPath);
}
export {
	write,
	read,
	copy,
	readJson,
	list,
	listFolders,
	lsFiles,
};
