# Changelog

## [1.2.0](https://www.github.com/GoogleChromeLabs/form-troubleshooter/compare/v1.2.2...v1.2.0) (2021-08-13)


### Miscellaneous Chores

* Updated version in manifest to match CWS version ([4a47435](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/4a474354cb325b4c016a2130cc2fac3dc50159a4))

### [1.2.2](https://www.github.com/GoogleChromeLabs/form-troubleshooter/compare/v1.2.0...v1.2.2) (2021-08-09)


### Bug Fixes

* **audit:** Minor tweaks to label association wording ([d7e463a](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/d7e463aaf021ae7e59e25a8aaec1cbf9eb115e71))
* avoid changing node identity when running audits ([559b271](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/559b271ec1c514fc2f99c4f4cddf5c651c2f9f87)), closes [#39](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/39)


### Documentation

* Corrections and tweaks to README ([3436731](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/3436731cc7d7e334a3e9879f0c0b1df35024fe93))


### Miscellaneous Chores

* Updated version ([7212d91](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/7212d91d0b37a73d68494bc49c19d99708b4c54f))

## 1.2.0 (2021-08-06)


### ⚠ BREAKING CHANGES

* convert javascript files to typescript
* use preact to present UI

### Features

* add actions to file a bug and request a feature ([cf88fb8](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/cf88fb8210dc682c6907ba4904c5ff2a5c894399))
* add css transition when displaying score ([4cb9758](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/4cb9758730d3b61d7f50d3aef889a4b73cc522f9))
* add explicit autocomplete suggestion for password ([787314c](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/787314c7aa83c7420b49e354a1400ed958980197))
* add small score next to the form detail ([a262976](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/a262976b55b5cc45238db9a859cad92b355afec4))
* add support for input/label detection using aria-labelledby ([744003a](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/744003a2032974f462b2c1f45f8935aa8c81fc9e)), closes [#14](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/14)
* automatically switch tabs if there are no issues ([afe7e00](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/afe7e0056dc8422207fbb6c9040ca51c42b367ee))
* dynamically apply plurals to words ([d7fe5b1](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/d7fe5b121fe1b6b12972919a4378ffc9d1ed0382))
* implement scoring logic ([2c48801](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/2c4880147eb32dee5a2d1dc2a083372c60054036))
* update scoring to take the number of eligible fields into account ([8e0965c](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/8e0965c792f9f0d93f847978460e82c78e89558e))


### Bug Fixes

* **audit:** make empty forms a warning ([18df9ff](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/18df9ff74060a4e95c6fc13d3872c7a3b34f7380))
* **build:** update version.js so it does not depend on modules ([c3f6cf2](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/c3f6cf24d97a374b6327522fd8624c07156c4cd0))
* change audit titles to support markup ([13b2246](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/13b2246ed412fac7102ca62dbb92d48122e35f94))
* display attribute level issues ([e200d7f](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/e200d7f381240fbd23416c9b5d636c07da18de19))
* do not traverse iframes when getting text content ([5914309](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/59143094e675d2c676afd60b48d0b9320f9c5141))
* fix inverted scoring logic ([ad03a63](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/ad03a633ba32c99a5450485d3f97c136aa316044))
* fix label audit for fields that contain both for and id attributes ([91aa80c](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/91aa80cbfe11141c6f575ee801f2c0c29ca02d85))
* include fields without forms in details page ([0d9df52](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/0d9df52888fb8bc4a7c2f1e84ac66a9cff451183))
* limit inspection to visible elements only ([9682855](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/9682855951a49dacc0ee00017af786b844bbaf1a))
* make interactive code links blue ([aa8c67d](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/aa8c67d0c386a7a0d7537b922d4c5a04d2599e4c))
* remove id requirement for inputs of type button ([8fa3482](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/8fa34823166553d5eadcf5a89e517cfecd0ca2e4))
* static build process ([62fdf58](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/62fdf58e203883b11ef4bb8acdc647efd3568e45))


### Code Refactoring

* convert javascript files to typescript ([9a5dc50](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/9a5dc50d3b12fbb6dddcab32be26a2528de9bace))
* use preact to present UI ([f61d435](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/f61d4357bb4044718586ac6cd33830e3839e6e63))


### Miscellaneous Chores

* Tweak to README ([72ef98f](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/72ef98f5d5a88ee3ae98a6b1f96d07d3703827c9))
