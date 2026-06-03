## [0.7.2](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.7.1...v0.7.2) (2026-06-03)


### Bug Fixes

* Add additional selectors to findBlocks in sonako.ts ([f6eb378](https://github.com/tachibana-shin/hako-epub-extension/commit/f6eb3785a0b195f740391a34dc15f93fe6819cc8))

## [0.7.1](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.7.0...v0.7.1) (2026-06-03)


### Bug Fixes

* **baka-tsuki:** Enhance image source retrieval for DL elements ([f6e6fbb](https://github.com/tachibana-shin/hako-epub-extension/commit/f6e6fbb56c4d8c551cce5e875b76d8956a0cd164))

# [0.7.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.6.3...v0.7.0) (2026-05-31)


### Bug Fixes

* **logic:** scope script removal to container ([f86115c](https://github.com/tachibana-shin/hako-epub-extension/commit/f86115cd5d332cd17b1cb6699eaf2804e6a3ffb6)), closes [#15](https://github.com/tachibana-shin/hako-epub-extension/issues/15)


### Features

* **self-update:** add app update check ([ab7007d](https://github.com/tachibana-shin/hako-epub-extension/commit/ab7007d121a8bd280dfb79b4b6ea5b4ee2012b7f))

## [0.6.3](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.6.2...v0.6.3) (2026-05-27)


### Bug Fixes

* **hako:** optimize fetcher sleep duration and improve chapter content replacement logic ([0d478e0](https://github.com/tachibana-shin/hako-epub-extension/commit/0d478e0f7e51cc7cd33b4657a8a3679fd9d18391))

## [0.6.2](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.6.1...v0.6.2) (2026-05-26)


### Bug Fixes

* adjust fetcherOptions concurrency and sleep duration (temp) upto 5 ([a13213b](https://github.com/tachibana-shin/hako-epub-extension/commit/a13213b6b62ae0933396403a55b3d486f3496bd0))

## [0.6.1](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.6.0...v0.6.1) (2026-05-25)


### Bug Fixes

* refactor injector call based on document readiness ([69d6186](https://github.com/tachibana-shin/hako-epub-extension/commit/69d6186b22bb9be7ae74f8c68ae1fbdff1304b7a))

# [0.6.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.5.0...v0.6.0) (2026-05-20)


### Bug Fixes

* **download:** fix epub buffer blob creation ([244049a](https://github.com/tachibana-shin/hako-epub-extension/commit/244049aeb73c2572ec5a74d20a09ef86bfef6fdf))
* **sonako:** preserve full size image URLs ([07ffbd5](https://github.com/tachibana-shin/hako-epub-extension/commit/07ffbd59b82ee562e3f7b7b91bee849d86d83c13))


### Features

* add CBZ download support ([2fe8979](https://github.com/tachibana-shin/hako-epub-extension/commit/2fe897941a87b27b819e648ff435d709eebbe9d6))
* **registry:** add truyenqq support ([d37e922](https://github.com/tachibana-shin/hako-epub-extension/commit/d37e92294c6b72b9539e8a111d3375a2b2524e7d))

# [0.5.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.4.0...v0.5.0) (2026-05-12)

### Features

- Add custom styles and profile-based DB ([46b908c](https://github.com/tachibana-shin/hako-epub-extension/commit/46b908cd1b533acc81c96bc850104515ec62f707))

### Performance Improvements

- **inject:** replace setInterval with MutationObserver ([c304583](https://github.com/tachibana-shin/hako-epub-extension/commit/c304583a4de730ac794d0bc61de84c89db66f6f8))

# [0.4.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.3.1...v0.4.0) (2026-05-11)

### Features

- **hako.vip:** add hako.vip registry ([2c4cdb5](https://github.com/tachibana-shin/hako-epub-extension/commit/2c4cdb56b0b625cc70525220517f620eabde6aa0))

## [0.3.1](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.3.0...v0.3.1) (2026-05-10)

### Bug Fixes

- remove h2 title in chapter sonako ([cfe4559](https://github.com/tachibana-shin/hako-epub-extension/commit/cfe4559d0cd79a31897c25a9929bbb1ebbc42f2b))

# [0.3.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.2.1...v0.3.0) (2026-05-10)

### Features

- **registry:** enhance image parsing ([c671f3f](https://github.com/tachibana-shin/hako-epub-extension/commit/c671f3fcdd2bff95c8627e77bc7bfac56e77fed5))

## [0.2.1](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.2.0...v0.2.1) (2026-05-10)

### Bug Fixes

- **fetch:** improve CORS and credentials handling ([d712e11](https://github.com/tachibana-shin/hako-epub-extension/commit/d712e1183c3b6d5a6ac75cb799f2fa429d54e5c5)), closes [#cors](https://github.com/tachibana-shin/hako-epub-extension/issues/cors)

# [0.2.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.1.1...v0.2.0) (2026-05-08)

### Bug Fixes

- **foxaholic:** remove unwanted images ([b031fec](https://github.com/tachibana-shin/hako-epub-extension/commit/b031fecb5f1620e84d5c2e9aecfb03e893b3612a))

### Features

- improve epub image download robustness ([09182fc](https://github.com/tachibana-shin/hako-epub-extension/commit/09182fc1cf04501cc7b96a7877249506cbba6b6f))

## [0.1.1](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.1.0...v0.1.1) (2026-05-08)

### Bug Fixes

- ci(release): align package version for build ([06b0fcb](https://github.com/tachibana-shin/hako-epub-extension/commit/06b0fcb7c737b11d5b44b5c6eadcf33180165259))

# [0.1.0](https://github.com/tachibana-shin/hako-epub-extension/compare/v0.0.47...v0.1.0) (2026-05-07)

### Features

- **fetcher:** add resource retry and timeout ([8c7d13d](https://github.com/tachibana-shin/hako-epub-extension/commit/8c7d13dc9f6a3c8dcbde453bda2365f734c4173d))
