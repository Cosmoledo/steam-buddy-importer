import fs from "fs";
import path from "path";

import chalk from "chalk";

import {
	Settings,
} from "../index.js";

const filename = "settings.json";

export const getSettings = (): Settings => {
	let SETTINGS: Settings;

	if (!fs.existsSync(filename)) {
		console.log(chalk.green(filename) + chalk.red(" not found"));
		console.log("Searched in " + chalk.green(path.resolve()));
		console.log(chalk.yellow("If you started the compiled version without a terminal, you may need to call it within it."));
		process.exit(1);
	}

	try {
		SETTINGS = JSON.parse(fs.readFileSync(filename) + "");
	} catch (_) {
		console.log(chalk.red("Unable to parse ") + chalk.green(filename));
		process.exit(1);
	}

	if (!fs.existsSync(SETTINGS.folders.input)) {
		console.log(chalk.red("The input folder does not exist: ") + chalk.green(SETTINGS.folders.input));
		process.exit(1);
	}

	return SETTINGS;
};
