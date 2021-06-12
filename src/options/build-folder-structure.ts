import fs from "fs";
import path from "path";

import chalk from "chalk";
import prettyBytes from "pretty-bytes";
import YAML from "yaml";

import {
	getProgressBar,
	isMissingBanners,
	prompt,
} from "../methods.js";
import {
	Logger,
	longestPlatform,
	MAIN_MENU_OPTIONS,
	SETTINGS,
} from "../index.js";
import {
	Pairs,
	RomPairBanner,
	YAMLEntry,
} from "../../index.js";
import {
	SUPPORTED_PLATFORMS,
} from "../Platforms.js";

function calcFileSize(pairs: Pairs) {
	let size = 0;

	for (const platform in pairs)
		size += pairs[platform].reduce((size, pair) => size + fs.statSync(path.join(SETTINGS.folders.input, platform, pair.rom)).size, 0);

	return size;
}

export function start(pairs: Pairs): void {
	const size = calcFileSize(pairs);

	if (isMissingBanners(pairs)) {
		Logger.all(chalk.red("Some ROMs do not have a banner. Please run ") + chalk.green(MAIN_MENU_OPTIONS[0]) + chalk.red(" first."));
		return;
	}

	prompt([{
		type: "rawlist",
		name: "action",
		message: `How should we get the data to the needed structure? (~${prettyBytes(size)})`,
		choices: ["Copy", "Move"],
	}]).then(({
		action
	}) => {
		transferFiles(pairs, action === "Copy");
		createYAML(pairs);
	});
}

function transferFiles(pairs: Pairs, copyData: boolean) {
	for (const platform in pairs) {
		const romPairs = pairs[platform];

		const dstRom = path.join(SETTINGS.folders.output, "steam-buddy", "content", platform);
		const dstBanner = path.join(SETTINGS.folders.output, "steam-buddy", "banners", platform);

		fs.mkdirSync(dstRom, {
			recursive: true
		});
		fs.mkdirSync(dstBanner, {
			recursive: true
		});

		const bar = getProgressBar((copyData ? "Copying" : "Moving") + " " + chalk.green(SUPPORTED_PLATFORMS[platform].padStart(longestPlatform, " ")));

		bar.start(romPairs.length, 0);

		romPairs.forEach(romPair => {
			const srcRom = path.join(SETTINGS.folders.input, platform, romPair.rom);
			const srcBanner = path.join(SETTINGS.folders.input, platform, (romPair.banners as RomPairBanner[])[0].name);

			fs.copyFileSync(srcBanner, path.join(dstBanner, (romPair.banners as RomPairBanner[])[0].name));

			if (copyData)
				fs.copyFileSync(srcRom, path.join(dstRom, romPair.rom));
			else
				fs.renameSync(srcRom, path.join(dstRom, romPair.rom));

			bar.increment();
		});

		if (!copyData)
			romPairs.forEach(romPair => {
				const srcBanner = path.join(SETTINGS.folders.input, platform, (romPair.banners as RomPairBanner[])[0].name);

				if (fs.existsSync(srcBanner))
					fs.unlinkSync(srcBanner);
			});

		(bar as any).stop(false);
	}

	Logger.all();
}

function createYAML(pairs: Pairs) {
	const dst = path.join(SETTINGS.folders.output, "steam-shortcuts");

	fs.mkdirSync(dst, {
		recursive: true
	});

	for (const platform in pairs) {
		const entries: YAMLEntry[] = pairs[platform].map(romPair => ({
			banner: `${SETTINGS.folders.steam_buddy}/banners/${platform}/${(romPair.banners as RomPairBanner[])[0].name}`,
			cmd: platform,
			dir: `"${SETTINGS.folders.steam_buddy}/content/${platform}"`,
			hidden: false,
			name: romPair.name,
			params: `"${romPair.rom}"`,
			tags: [SUPPORTED_PLATFORMS[platform]],
		}));

		const configFile = `steam-buddy.${platform}.yaml`;
		const configFilePath = path.join(SETTINGS.folders.input, configFile);

		if (fs.existsSync(configFilePath)) {
			const existingROMs = YAML.parse(fs.readFileSync(configFilePath) + "");
			entries.push(...existingROMs);
		}

		fs.writeFileSync(path.join(dst, configFile), YAML.stringify(entries));
	}
}
