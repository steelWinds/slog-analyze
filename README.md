# slog-analyze

Miniature analyzer for CLF-standart logs, just for fun :з

![GitHub License](https://img.shields.io/github/license/steelWinds/slog-analyze)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/slog-analyze)
![NPM Version](https://img.shields.io/npm/v/:packageName)

## Quick Start

### Prerequisites

- Node.js >=18.x

### Environment variables

See the `docs/` directory for example `.env.*` files. **Environment variable files should be located in the project root directory.**

### Installation

```bash
# Install the package globally
npm i -g slog-analyze
```

#### Basic Usage

```bash
slog-analyze analyze path/to/log/file.[log,txt] path/to/result/folder
```

## Development

### Setup for Development

```bash
git clone https://github.com/steelWinds/slog-analyze

cd slog-analyze

# Generate sample log files (1 GB total)
node examples/generateLogs.js

# Install dependencies
pnpm i
```

## License

This project is licensed under the MPL 2.0 License.

## Links

- Author: [@steelWinds](https://github.com/steelWinds)
- Issues: [New issue](https://github.com/steelWinds/slog-analyze/issues)
- Telegram: @plutograde
- Email: [Send me an email](mailto:kirillsurov0@gmail.com)
