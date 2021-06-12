import path from "path";

import chalk from "chalk";

import {
	formatRomName,
	generateBanner,
	getLongestString,
	getProgressBar,
	isComleteRoomPair,
	isMissingBanners,
	prompt,
} from "../methods.js";
import {
	Logger,
	SETTINGS,
} from "../index.js";
import {
	Pairs,
	RomPairBanner,
} from "../../index.js";
import {
	SUPPORTED_PLATFORMS,
} from "../Platforms.js";

export function start(pairs: Pairs): void {
	const maxRomName = getLongestString(Object.values(pairs).map(a => a.map(b => b.rom).flat()).flat());

	for (const platform in pairs) {
		const romPairs = pairs[platform];

		const donePairs = romPairs.filter(isComleteRoomPair).length;

		Logger.all("Listing: " + chalk.green(SUPPORTED_PLATFORMS[platform]) + ` ${donePairs}/${romPairs.length} (${(romPairs.length === 0 ? 0 : donePairs / romPairs.length * 100).toFixed(2)}%)`);

		romPairs.forEach(romPair => {
			if (isComleteRoomPair(romPair))
				Logger.all(chalk.bgGreen("   ") + " " + chalk.cyan(romPair.rom.padEnd(maxRomName, " ")) + " | " + chalk.magenta((romPair.banners as RomPairBanner[])[0].name));
			else if (romPair.banners && romPair.banners.length > 0) {
				Logger.all(chalk.bgYellow("   ") + " " + chalk.cyan(romPair.rom));

				romPair.banners.forEach(bannerPair => {
					Logger.all(chalk.bgYellow("   ") + " " + " ".repeat(maxRomName) + " | " + (bannerPair.rating * 100).toFixed(2).padStart(5, " ") + "% " + chalk.magenta(bannerPair.name));
				});
			} else
				Logger.all(chalk.bgRed("   ") + " " + chalk.cyan(romPair.rom));
		});

		Logger.all();
	}

	if (isMissingBanners(pairs)) {
		Logger.all(chalk.red("You are missing banners."));
		Logger.all(chalk.yellow("You need all green (100% filename match) to proceed to the next step."));
		Logger.all();
	} else {
		Logger.all(chalk.green("No banner is missing. Congratulations"));
		Logger.all();
		return;
	}

	const choices = [
		"No",
		"Only Red",
		"All"
	];

	prompt([{
		type: "rawlist",
		name: "generate",
		message: "Generate missing banners?",
		choices,
		filter: (val) => choices.indexOf(val),
	}]).then(async ({
		generate
	}) => {
		if (generate === 0)
			return;

		const bar = getProgressBar("Generating banners");
		bar.start(0, 0);

		const files: string[][] = [];
		for (const platform in pairs)
			files.push(...pairs[platform]
				.filter(romPair => {
					if (isComleteRoomPair(romPair))
						return false;

					const red = !romPair.banners || romPair.banners.length === 0;

					return generate === 1 ? red : true;
				})
				.map(romPair => [platform, romPair.name])
			);

		bar.setTotal(files.length);

		let worker = Math.min(files.length, 200);

		function start() {
			if (files.length === 0) {
				worker--;
				if (worker === 0)
					bar.stop();
				return;
			}

			const index = Math.random() * files.length | 0;
			const [platform, name] = files[index];
			files.splice(index, 1);

			const dst = path.join(SETTINGS.folders.input, platform, name + ".png");

			generateBanner(formatRomName(name), dst, () => {
				bar.increment();
				start();
			});
		}

		for (let i = 0; i < worker; i++)
			start();
	});
}
