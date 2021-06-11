import fs from "fs";
import path from "path";
import util from "util";

import stripAnsi from "strip-ansi";

import {
	SETTINGS,
} from "./index.js";

class Logger {
	private filename: string;
	private fileStream: fs.WriteStream;

	constructor() {
		this.filename = SETTINGS.log.filename
			.replace(/{timestamp}/, new Date().toISOString().slice(0, -5))
			.replace(/:/g, "-");

		fs.mkdirSync(path.dirname(this.filename), {
			recursive: true
		});

		this.fileStream = fs.createWriteStream(this.filename, {
			flags: "a",
			encoding: "utf8",
			mode: 0o666
		});
	}

	public all(...messages: any[]) {
		this.console(...messages);
		this.file(...messages);
	}

	public console(...messages: any[]) {
		console.log(...messages);
	}

	public file(...messages: any[]) {
		this.writeToFileStream(messages);
	}

	private writeToFileStream(messages: any[]) {
		let msg = "";
		messages.forEach(message => {
			if (typeof message === "string")
				msg += stripAnsi(message);
			else
				msg += util.inspect(message, false, null);
			msg += " ";
		});
		this.fileStream.write(msg.slice(0, -1) + "\n");
	}
}

const getLogger = (): Logger => new Logger();

export default getLogger;
