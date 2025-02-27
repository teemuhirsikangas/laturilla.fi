# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2022-06-27
- Update deps
- use nodejs16

## [1.0.6] - 2021-09-15
## Changed
- Update deps
- Remove offline detection code

## [1.0.5] - 2021-03-31
## Changed
- Update to react17, with refactorings
- Cookie ttl to 1 year and JWT token to 365days
- Update many deps
- Remove account functionality added
   - removes plates, messages, subscriptions & user
   - Cannot reply to removed account
- Notification when there is new version of serviceworkers
   - use redux + store
- Download userdata feature
- Add reportWebVitals
- Refactor to use local serviceworker

## [1.0.4] - 2020-10-14
## Changed
- Remove BETA tag from mainpage
- nodejs 14.x
- How to page tweaked
- Add nginx conf: gzip
- Update deps
- Use Helmet to enable all secure headers, except CSP header
- Fix all icons, favicons with maskable purpose
- Add lazy loading to Me,Messages to minimize chunks, faster main page loading

## [1.0.3] - 2020-09-14
## Changed
- Cookie TTL to 240days
- Deps update
- Tweak search placeholder
- Remove feedback@laturilla.fi from feedback page as inbound email it not done

## [1.0.2] - 2020-08-30
## Changed
- Plate numbers can be search without the dash "-"
- Manually change the db records, next time do migration script
- remove createdAt from plate search not not expose when user has created the plate record

## [1.0.1] - 2020-08-20
## Changed
- RC version, deployed first time to production
- Fix Safari whitescreen, disable Notificatins to safari
- SMTP_LOCAL env for prod, use local (non-secure) or secure and non-local
- Info text for push notification if not supported by browser

## [1.0.0] - 2020-08-11
## Changed
- Release candidate 1 for first deployment on real server

## [0.4.0] - 2020-05-13
### Changed
- Push notifications POC/Draft
- .ENV file in use
- deps update

## [0.3.0] - 2020-04-27
### Changed
- messages view, send messages, fix cookie, 

## [0.2.0] - 2020-02-27
### Changed
- JWT auth, singup, login, me for REST api

## [0.1.0] - 2020-02-27
### Changed
- UI router: about, singin, header

## [0.0.3] - 2020-02-26
### Changed
- UI tweaks, css fixes

## [0.0.2] - 2020-02-25
### Changed
- Use reducers for the search and UI