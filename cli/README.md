# Form troubleshooter command line interface

This tool is a command line interface for running miscellaneous **Form troubleshooter** tasks.

## Usage

```sh
form-audit rerun [...saved-html-files]
form-audit extract [...saved-html-files]
```

## Installation

```sh
# Make sure that form-troubleshooter has been built, run the following command if required (from the `cli` directory):
# (cd .. && npm install && npm run build)

# From the `cli` directory, install dependencies:
npm install

# From the `cli` directory, install the command line alias:
npm install --global .
```
