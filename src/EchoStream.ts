import {
	Writable
} from "stream";

import stripAnsi from "strip-ansi";

import {
	Logger,
} from "./index.js";

class EchoStream extends Writable {
	public isTTY = true;
	private lastChunk: string;

	public _write(chunk: any, _encoding: BufferEncoding, callback: (error ? : Error | null) => void): void {
		const message = chunk.toString();

		process.stdout.write(message);

		if (stripAnsi(message).replace(/\s/g, " ").trim().length > 0)
			this.lastChunk = message;

		callback();
	}

	public logLastMessage() {
		Logger.file(this.lastChunk);
	}

	public end() {
		void 0;
	}
}

export const echoStream = new EchoStream();
