import {
	Font
} from "@jimp/plugin-print";
import chalk from "chalk";
import cliProgress from "cli-progress";
import inquirer from "inquirer";
import Jimp from "jimp";

import {
	Pairs,
	RomPair,
} from "../index.js";
import {
	echoStream,
} from "./EchoStream.js";
import {
	Logger,
} from "./index.js";

export const plural = (value: number, sin = " ", plu = "s"): string => value === 1 ? sin : plu;

export const getLongestString = (array: string[]): number => array.map(s => s.length).sort((a, b) => a - b).pop() as number;

export const isComleteRoomPair = (pair: RomPair): boolean => pair.images ? pair.images.length === 1 && pair.images[0].rating === 1 : false;

export const formatRomName = (name: string): string => name.replace(/(\(|\[).(\]|\))/g, "").trim();

const promptBase = inquirer.createPromptModule({
	output: echoStream as unknown as NodeJS.WriteStream,
});

export const prompt = (questions: inquirer.QuestionCollection < any > ): Promise < any > => new Promise(res => promptBase(questions)
	.then(answer => {
		echoStream.logLastMessage();
		res(answer);
	})
);

export const getProgressBar = (title: string): cliProgress.SingleBar => {
	const bar = new cliProgress.SingleBar({
		format: `${title} | ${chalk.blue("{bar}")} | {percentage}% | {value}/{total}`,
		hideCursor: true,
		stream: echoStream
	}, cliProgress.Presets.shades_classic);

	const stop = bar.stop.bind(bar);
	bar.stop = (newLine = true) => {
		bar.update(bar.getTotal());
		stop();
		echoStream.logLastMessage();
		if (newLine)
			Logger.all();
	};

	return bar;
};

export const isMissingImages = (pairs: Pairs): boolean => {
	for (const platform in pairs) {
		const content = pairs[platform];

		if (content.some(pair => !isComleteRoomPair(pair)))
			return true;
	}

	return false;
};

let font: Font;
Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(a => font = a);

export const generateImage = (text: string, path: string, cb: () => void): void => {
	new Jimp(256, 256, "black", (_err, image) => {
		image.print(
			font,
			0,
			0, {
				text,
				alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
				alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
			},
			image.bitmap.width,
			image.bitmap.height
		);

		image.write(path);
		cb();
	});
};
