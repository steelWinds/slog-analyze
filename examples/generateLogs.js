// oxlint-disable prefer-template
// oxlint-disable func-style
import { faker } from '@faker-js/faker';
import fs from 'fs';

const ONE_GB = 1024 * 1024 * 1024;

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const statuses = [200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502];

function apacheDate() {
	const d = faker.date.between({
		from: '2024-01-01T00:00:00Z',
		to: '2024-12-31T23:59:59Z',
	});

	return (
		d
			.toLocaleString('en-GB', {
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				month: 'short',
				second: '2-digit',
				timeZone: 'UTC',
				year: 'numeric',
			})
			.replace(',', '') + ' +0000'
	);
}

function clfLine() {
	return (
		`${faker.internet.ip()} - ` +
		`${faker.helpers.arrayElement(['-', faker.internet.username()])} ` +
		`[${apacheDate()}] ` +
		`"${faker.helpers.arrayElement(methods)} ${faker.internet.url().replace(/^https?:\/\/[^/]+/, '')} HTTP/1.1" ` +
		`${faker.helpers.arrayElement(statuses)} ` +
		`${faker.number.int({ max: 5000, min: 200 })}\n`
	);
}

function extendedClfLine() {
	return (
		`${faker.internet.ip()} - ` +
		`${faker.helpers.arrayElement(['-', faker.internet.username()])} ` +
		`[${apacheDate()}] ` +
		`"${faker.helpers.arrayElement(methods)} ${faker.internet.url().replace(/^https?:\/\/[^/]+/, '')} HTTP/1.1" ` +
		`${faker.helpers.arrayElement(statuses)} ` +
		`${faker.number.int({ max: 5000, min: 200 })} ` +
		`"${faker.helpers.arrayElement(['-', faker.internet.url()])}" ` +
		`"${faker.internet.userAgent()}"\n`
	);
}

function generateFile(path, lineFn) {
	return new Promise((resolve) => {
		const stream = fs.createWriteStream(path);
		let written = 0;

		function write() {
			while (written < ONE_GB) {
				const line = lineFn();
				written += Buffer.byteLength(line);
				if (!stream.write(line)) {
					stream.once('drain', write);
					return;
				}
			}
			stream.end(resolve);
		}

		write();
	});
}

(async () => {
	console.log('Generating CLF (7 fields) ~1GB...');
	await generateFile('./examples/CLF.log', clfLine);

	console.log('Generating Extended CLF (9 fields) ~1GB...');
	await generateFile('./examples/CLF_EXTENDED.log', extendedClfLine);

	console.log('Done');
})();
