import {
	list
} from './utilities/file/index.js';
import {
	join,
	resolve,
	extname,
} from 'path';
import * as fs from 'fs';
const {
	promises: {
		rename
	}
} = fs;
const badRegex = /(\[2160|\[1080|hdr|4K|REPACK|\[720|HDR|iTunes|BDRip|2160p|1036p|1070p|1080p|720p|BluRay|UHD|\(Bd\)| \(Bd| \(1080| \(2160|\[Dual-Audio\]|\(Dual Audio|HDCam| \[Dual Audio|Dual Audio|DUBBED|AMZN|WEB-DL|WEBDL|NTSC|HEVC|\(HEVC|MULTi|\[Bd\]| \[B| - \[|\[10bit x265)/i;
function recursiveRemoveBad(fileName) {
	if (fileName.search(badRegex) === -1) {
		return fileName;
	} else {
		return recursiveRemoveBad(fileName.split(badRegex)[0].trim());
	}
}
const findWords = ['S H I E L D'];
const replaceWords = ['S.H.I.E.L.D'];
function findReplace(strng) {
	let fixed = strng;
	findWords.forEach((word, index) => {
		fixed = strng.replace(word, replaceWords[index]);
	});
	return fixed;
}
const removeRegex = /(\[MEGA\]|EXTENDED|\(REMASTERED\)|\[Cleo\])/g;
const folder = resolve(`/media/uw/Mitzi1/Anime Movies/`);
(async () => {
	const files = await list(folder);
	if (!files) {
		return console.log('EMPTY OR MISSING FOLDER');
	}
	console.log(`Number of Files detected ${files.length}`);
	let count = 0;
	let countExt = 0;
	for (const itemInitial of files) {
		let item = itemInitial.trim().replace(/ +(?= )/g, '');
		if (item[0] === '~' || item[0] === '.') {
			continue;
		}
		const ext = extname(item);
		if (!item) {
			console.log(item);
			break;
		}
		const dotMatch = item.match(/\.|_/g);
		if (dotMatch && dotMatch.length > 2) {
			item = item.replace(ext, '').replace(/\./g, ' ')
				.replace(/_/g, ' ')
				.trim()
				.replace(/ +(?= )/g, '') + ext;
		}
		if (item.search(badRegex) > -1) {
			item = recursiveRemoveBad(item) + ext;
		}
		if (item.search(removeRegex) > -1) {
			item = item.replace(removeRegex, '').replace(' .', '.');
		}
		const year = item.trim().match(/ (\d\d\d\d)/);
		if (year && !item.match(/ \((\d\d\d\d)\)/)) {
			item = join(item.replace(year[0], ` (${year[0].trim()})`));
		}
		if (!ext || ext.search(/(mkv|avi|mp4|m4v)/i) === -1) {
			if (item) {
				item = `${item.trim()}.mkv`;
			} else {
				item = `${item.trim()}.mkv`;
			}
			countExt++;
		}
		item = findReplace(item);
		item = item.replace(/^\[(.*?)\] /igm, '');
		if (item.includes('-.mkv')) {
			item = item.replace('-.mkv', '.mkv');
		}
		if (item.includes(' -.')) {
			item = item.replace(' -.', '.');
		}
		if (item.includes(' [.')) {
			item = item.replace(' [.', '.');
		}
		if (item.includes(' (.')) {
			item = item.replace(' (.', '.');
		}
		if (item.length === 0) {
			console.log(itemInitial, item, 'length was 0');
			continue;
		}
		if (itemInitial !== item) {
			count++;
			const filePathFixed = join(`${folder}/${item}`);
			const filePath = join(`${folder}/${itemInitial}`);
			console.log(itemInitial, ' => ', item);
			await rename(filePath, filePathFixed.trim());
		}
	}
	console.log(`${count} FILES CHANGED`);
	console.log(`${countExt} FILES EXT CHANGED`);
})();
