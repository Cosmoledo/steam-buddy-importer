import fs from "fs";
import path from "path";

import chalk from "chalk";
import stringSimilarity from "string-similarity";

import getLogger from "./Logger.js";
import {
	getLongestString,
	getProgressBar,
	plural,
	prompt,
} from "./methods.js";
import {
	start as printRoms,
} from "./options/print-roms.js";
import {
	start as buildFolderStructure,
} from "./options/build-folder-structure.js";
import {
	getSettings,
} from "./settings.js";
import {
	SUPPORTED_PLATFORMS,
} from "./Platforms.js";
import {
	FolderContent,
	Pairs,
	Platforms,
	RomPair,
} from "../index.js";

export const SETTINGS = getSettings();
export const Logger = getLogger();

export const MAIN_MENU_OPTIONS = [
	"Print ROMs and images",
	"Build folder structure",
];

// Load all platforms and categories
const platforms = {
	invalid: ([] as string[]),
	valid: ([] as string[]),
};

fs.readdirSync(SETTINGS.folders.input)
	.forEach(folder => {
		if (SUPPORTED_PLATFORMS[folder])
			platforms.valid.push(folder);
		else
			platforms.invalid.push(folder);
	});

// Log invalid platforms
if (platforms.invalid.length > 0) {
	Logger.all(chalk.red(`Folder${plural(platforms.invalid.length, "")} ${chalk.green(platforms.invalid.join(chalk.red(", ")))} ${plural(platforms.invalid.length, "is", "are")} not a platform.`));
	Logger.all(chalk.yellow("Look at ") + chalk.green("src/Platforms.ts") + chalk.yellow(". Maybe you just need to rename the folder.\n"));
}

export const longestPlatform = getLongestString(platforms.valid.map(s => SUPPORTED_PLATFORMS[s]));

// Load platforms and find roms and images
const foundPlatforms: Platforms = {};

platforms.valid
	.sort()
	.forEach(platform => {
		const content: FolderContent = {
			images: [],
			roms: [],
		};

		fs.readdirSync(path.join(SETTINGS.folders.input, platform))
			.forEach(file => {
				if (SETTINGS.imageExtensions.some(ext => path.extname(file) === ext))
					content.images.push(file);
				else
					content.roms.push(file);
			});

		Logger.all(`Searched ${chalk.green(SUPPORTED_PLATFORMS[platform].padStart(longestPlatform, " "))} | ${chalk.cyan(content.roms.length.toString().padStart(4, " ") + " ROM" + plural(content.roms.length))} | ${chalk.magenta(content.images.length.toString().padStart(4, " ") + " Image" + plural(content.images.length))}`);

		foundPlatforms[platform] = content;
	});

Logger.all();

// Match roms with images
const pairs: Pairs = {};

const bar = getProgressBar("Matching files");
bar.start(0, 0);

for (const platform in foundPlatforms) {
	const element = foundPlatforms[platform];

	if (!pairs[platform])
		pairs[platform] = [];

	const images = element.images.map(img => path.parse(img).name.toLowerCase());
	const imagesIndexed: [string, number][] = images.map((img, index) => [img, index]);
	bar.setTotal(bar.getTotal() + (images.length === 0 ? 0 : element.roms.length));

	element.roms.forEach(rom => {
		let name = path.parse(rom).name;

		const entry: RomPair = {
			rom,
			name,
		};

		name = name.toLowerCase();

		if (images.length > 0) {
			const exact = imagesIndexed.find(indexed => indexed[0] === name);
			if (exact)
				entry.images = [{
					name: element.images[exact[1]],
					rating: 1,
				}];
			else {
				entry.images = stringSimilarity.findBestMatch(name, images).ratings
					.map((match, index) => ({
						name: element.images[index],
						rating: match.rating
					}))
					.filter(match => match.rating > 0.4)
					.sort((m1, m2) => m2.rating - m1.rating);

				const bestMatch = entry.images.filter(match => match.rating === 1);

				if (bestMatch.length === 1)
					entry.images = [bestMatch[0]];
			}
			bar.increment();
		}

		pairs[platform].push(entry);
	});
}

bar.stop();

// Get input from user, what he wants to do
prompt([{
	type: "rawlist",
	name: "action",
	message: "What would you like to do? (Please follow given order)",
	choices: MAIN_MENU_OPTIONS,
}]).then(({
	action
}) => {
	const index = MAIN_MENU_OPTIONS.indexOf(action);

	switch (index) {
		case 0:
			printRoms(pairs);
			break;

		case 1:
			buildFolderStructure(pairs);
			break;
	}
});
