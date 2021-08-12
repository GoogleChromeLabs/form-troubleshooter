# Form troubleshooter command line interface

This tools is a command line interface for running Form troubleshooter audits.

## Usage

```sh
form-audit <url> [...additional-urls]
```

## Installation

```sh
# make sure that form-troubleshooter has been built, run the following command if required
# (cd .. && npm install && npm run build)

# install dependencies
npm install

# install command line alias
npm install --global .
```

## Limitations

Unlike the Form troubleshooter extension, this command line tool does not inspect the contents of `iframes`.

## TODO

- [ ] Include support for `iframes`
- [ ] Refactor this code to to reuse of `dom-iterator` DOM traversal logic
- [ ] Add support for more formats (like output to HTML and PDF)
