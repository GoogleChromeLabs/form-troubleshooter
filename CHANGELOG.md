# Changelog

### [1.2.3](https://www.github.com/GoogleChromeLabs/form-troubleshooter/compare/v1.2.0...v1.2.3) (2021-08-18)


### Features

* add cli tool to rerun existing audits against saved html files ([d8dc138](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/d8dc13852b6188d6e74f1125f32eb5a83a6d7715))
* add script to extract audit results from saved html results ([64b2134](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/64b213439ef7e83129af5203eb73684899e9c82c))
* add suggestion when a clear autocomplete attribute suggestion exists ([a6d19f9](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/a6d19f9d3d8923454170233f55008eef5c78809a)), closes [#64](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/64)
* add support for opening a saved HTML file for debugging ([e269c38](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/e269c383bd7d043834b6d226b20801dfa6a6067d))
* add website icon to the saved html ([78e1953](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/78e19539bd8fed6ecf49f3a85b295e15390d83b3))
* highlight attributes for fields without unique name or id ([11512ab](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/11512abc3c285d200fa273c52d5f808962b534e9)), closes [#89](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/89)
* highlight attributes that have been flagged as unrecognized ([92ec223](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/92ec2237f79a2a42f4b03fa3903d2bb80beae534)), closes [#68](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/68)
* highlight autocomplete="off" attribute ([fa6534d](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/fa6534debbff48888a7bdd4bbad123d1033a7c4a)), closes [#91](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/91)
* highlight duplicate label's for attribute ([3889b80](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/3889b80360a2b0e782545da7d8db7ed1c59f6c43)), closes [#93](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/93)
* highlight empty autocomplete attributes ([a79b390](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/a79b3908e69c31b9a3e44247633912f06760f83d)), closes [#90](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/90)
* highlight id values of input fields that don't have a label ([379f287](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/379f287995b7ce407286c28a8572e6d55b7212e0)), closes [#85](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/85)
* highlight invalid type values ([a331009](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/a3310097bba84a88a0122d4e7324b0e7b8b920a9)), closes [#74](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/74)
* highlight label attributes when label is not associated with form field ([0d79b7b](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/0d79b7b8357d5a1c9c78d2a7b07ad3b352f11edb)), closes [#86](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/86)
* highlight text content for labels with duplicate text ([00d1799](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/00d1799c541c7e2c1cf6434c714f5cf9c5b4748d)), closes [#92](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/92)
* implement save as html function ([3a3dcc5](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/3a3dcc5c81c085808c039fe579871dc45d6afd2a)), closes [#24](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/24)
* remove save form data option ([626503e](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/626503e263b44c3bfeecbb7e3322ccb4edd89a06))


### Bug Fixes

* duplicate field/label detection ([405ab57](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/405ab571e8077f18eea43a33341fe9338f1bc945)), closes [#87](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/87)
* escape css ids to increase compatibility of element selection ([eb68f0e](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/eb68f0e799b89c31566b7a3476a9231ad2932d50)), closes [#65](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/65)
* escape regular expression values ([69ffefc](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/69ffefc2d9f2137aa2b51166d7ea8ed1d1f43b06))
* highlight the correct autocomplete attribute ([bd98f53](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/bd98f533b1ecfa1c63583be6f82418ec833a75fa)), closes [#56](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/56)
* improve invocation of showSaveFilePicker ([6310659](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/6310659a8ef021136dca5583de523653f5177f11)), closes [#62](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/62)
* make findDescendants respect tree ordering ([ff0422d](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/ff0422d7c475bfca72c6aff3531cbe1b3835eeb4))
* only scroll to element if the element is outside of the viewport ([d7104df](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/d7104df1594605dfe3d73a5386d544e6c30fe58d)), closes [#70](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/70)
* only show developer menu (save/open) in developer mode ([2c78a47](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/2c78a47e34f6409776672c34de357166a8989ddf))
* revert back to not mutating tree nodes ([78fb4cd](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/78fb4cd0a4d7de50fa8fc26aa3c682f9f9f5052b)), closes [#50](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/50)
* treat duplicate text and duplicate for labels differently ([7b0ed33](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/7b0ed334194ecd4e49a029156088a4bb9f43d8b4)), closes [#88](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/88)
* truncate URL in saved HTML ([9401012](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/9401012ae222c3851af28775585ba188b2d19406))
* update dom traversal logic to also take the current element's visibility ([494b22e](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/494b22e02af8260b7bc68eb2d7a2636bd785b953)), closes [#78](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/78)
* update wording for elements not contained in a form ([e227301](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/e227301b5dc2365ad572c7b640f0dda98ac6151b))
* wording of save to HTML prompt ([a4faf8f](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/a4faf8f603864b106ff5371dd50ee68124a4f38e))


### Miscellaneous Chores

* bump version to 1.2.3 ([c65f35f](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/c65f35f35e6e7a9ef65fca77a4c6ad8379cfeb58))

## [1.2.0](https://www.github.com/GoogleChromeLabs/form-troubleshooter/compare/v1.2.2...v1.2.0) (2021-08-13)


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
* **audit:** Minor tweaks to label association wording ([d7e463a](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/d7e463aaf021ae7e59e25a8aaec1cbf9eb115e71))
* avoid changing node identity when running audits ([559b271](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/559b271ec1c514fc2f99c4f4cddf5c651c2f9f87)), closes [#39](https://www.github.com/GoogleChromeLabs/form-troubleshooter/issues/39)


### Documentation

* Corrections and tweaks to README ([3436731](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/3436731cc7d7e334a3e9879f0c0b1df35024fe93))


### Code Refactoring

* convert javascript files to typescript ([9a5dc50](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/9a5dc50d3b12fbb6dddcab32be26a2528de9bace))
* use preact to present UI ([f61d435](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/f61d4357bb4044718586ac6cd33830e3839e6e63))


### Miscellaneous Chores

* Tweak to README ([72ef98f](https://www.github.com/GoogleChromeLabs/form-troubleshooter/commit/72ef98f5d5a88ee3ae98a6b1f96d07d3703827c9))
