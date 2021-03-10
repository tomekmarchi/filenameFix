import {
	listFolders
} from './utilities/file/index.js';
import {
	join,
	resolve,
} from 'path';
import * as fs from 'fs';
const {
	promises: {
		rename
	}
} = fs;
const badRegex = /(\[2160|\[1080|hdr|4K|REPACK|\[720|HDR|iTunes|BDRip|2160p|1036p|1070p|1080p|720p|BluRay|UHD|\(Bd\)| \(Bd| \(1080| \(2160|\(Dual Audio|HDCam| \[Dual Audio|Dual Audio|DUBBED|AMZN|WEB-DL|WEBDL|NTSC|HEVC|\(HEVC|MULTi|Season|S0|\[Bd\]| \[B| - \[|\[10bit x265)/i;
function recursiveRemoveBad(fileName) {
	if (fileName.search(badRegex) === -1) {
		return fileName;
	} else {
		return recursiveRemoveBad(fileName.split(badRegex)[0].trim());
	}
}
const removeRegex = /(\[MEGA\]|EXTENDED|\(REMASTERED\)|\[Cleo\])/g;
const folder = resolve(`/media/uw/Pookie1/shows/`);
const findWords = ['S H I E L D'];
const replaceWords = ['S.H.I.E.L.D'];
function findReplace(strng) {
	let fixed = strng;
	findWords.forEach((word, index) => {
		fixed = strng.replace(word, replaceWords[index]);
	});
	return fixed;
}
(async () => {
	const files = await listFolders(folder);
	if (!files) {
		return console.log('EMPTY OR MISSING FOLDER');
	}
	console.log(`Number of Files detected ${files.length}`);
	let count = 0;
	const countExt = 0;
	for (const itemInitial of files) {
		let item = itemInitial.trim().replace(/ +(?= )/g, '');
		if (item[0] === '~' || item[0] === '.') {
			continue;
		}
		if (!item) {
			console.log(item);
			break;
		}
		const dotMatch = item.match(/\.|_/g);
		if (dotMatch && dotMatch.length > 1) {
			item = item.replace(/\./g, ' ')
				.replace(/_/g, ' ')
				.trim()
				.replace(/ +(?= )/g, '');
		}
		if (item.search(badRegex) > -1) {
			item = recursiveRemoveBad(item);
		}
		if (item.search(removeRegex) > -1) {
			item = item.replace(removeRegex, '').replace(' .', '.');
		}
		const year = item.trim().match(/ (\d\d\d\d)/);
		if (year) {
			item = join(item.replace(year[0], ` (${year[0].trim()})`));
		}
		const lastchar = item[item.length - 1];
		if (lastchar === '-' || lastchar === '[' || lastchar === '(') {
			console.log(lastchar, 'LAST');
			item = item.slice(0, item.length - 2);
		}
		item = findReplace(item);
		item = item.replace(/^\[(.*?)\] /igm, '');
		if (item.length === 0) {
			continue;
		}
		if (itemInitial !== item) {
			count++;
			const filePathFixed = join(`${folder}/${item}`);
			const filePath = join(`${folder}/${itemInitial}`);
			console.log(itemInitial, ' => ', item);
			//await rename(filePath, filePathFixed.trim());
		}
	}
	console.log(`${count} FILES CHANGED`);
	console.log(`${countExt} FILES EXT CHANGED`);
})();
