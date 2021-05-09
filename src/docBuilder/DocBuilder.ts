import * as fs from 'fs';
import * as path from 'path';
import { Content } from './Types';
import * as markdownIt from 'markdown-it';
import * as hljs from 'highlight.js';

class DocBuilder {
	private outputFolder: string;
	private content: Content[];
	private md: markdownIt;

	constructor(outputFolder: string) {
		this.outputFolder = outputFolder;
		this.content = [];
		this.md = markdownIt({
			html: true,
			typographer: true,
			breaks: true,
			highlight: function (str, lang) {
				if (lang && hljs.getLanguage(lang)) {
					try {
						return hljs.highlight(lang, str).value;
					} catch (__) {}
				}

				return ''; // use external default escaping
			},
		});
	}

	buildDocs(folder: string) {
		const files: string[] = fs.readdirSync(folder);

		for (const file of files) {
			const filePath: string = path.resolve(folder, file);

			if (fs.statSync(filePath).isDirectory()) {
				this.buildDocs(filePath);
			} else {
				if (filePath.endsWith('.md')) {
					this.createHtml(filePath);
				}
			}
		}
	}

	createIndexPage() {
		let markdown: string = '# Your docs\n';

		this.content.sort((a, b) => a.name.localeCompare(b.name));

		for (const file of this.content) {
			markdown += `## * <a style="color: #fff" href="file:///${file.path}">${file.name}</a>\n`;
		}

		const html: string = this.md.render(markdown);
		const doc: string = this.createHtmlDocument('Index', html);

		const outPath: string = path.resolve(this.outputFolder, 'index.html');
		fs.writeFileSync(outPath, doc);
	}

	private createHtml(absolutePath: string) {
		const fileContent: string = fs.readFileSync(absolutePath, 'utf-8');
		const html: string = this.md.render(fileContent);
		const name: string = this.getName(absolutePath);
		const doc: string = this.createHtmlDocument(name, html);

		console.log(name);
		const outPath: string = path.resolve(this.outputFolder, `${name}.html`);
		fs.writeFileSync(outPath, doc);

		this.content.push({ name, path: outPath });
	}

	private createHtmlDocument(name: string, content: string): string {
		return `<html><head><title>${name}</title><link rel="stylesheet" href="../css/highlight.css"><link rel="stylesheet" href="../css/main.css"><link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Quicksand&family=Work+Sans:wght@100&display=swap" rel="stylesheet"></head><body style="font-family: 'Quicksand', sans-serif;background-color: #1F2937;color:#E5E7EB; margin-left: 20%;margin-right: 20%;">${content}</body></html>`;
	}

	private getName(path: string): string {
		const lastDot: number = path.lastIndexOf('.');
		const lastSlash: number = path.lastIndexOf('\\');

		return path.slice(lastSlash + 1, lastDot);
	}
}

export default DocBuilder;
