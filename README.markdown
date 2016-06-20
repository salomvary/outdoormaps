# Outdoor Maps for Mobile and Desktop

This project is a lightweight web based viewer for the best free online map
services. 

Launch http://outdoormaps.eu.

The motivation behind the Outdoor Maps Project is to bring high quality maps to
any modern web browser (including mobile browsers). Unfortunately the
"official" web viewers for the providers are mostly hard to use, full of
unnecessary controls and don't work on mobile.

## Supported outdoor layers

- [turistautak.hu](http://turistautak.hu) - hiking, cycling and mountain biking
  maps of **Hungary**
- [Reit- und Wanderkarte](http://www.wanderreitkarte.de/) - hiking, cycling and
  horse riding maps for most of **Europe**
- ÖK 50 served by [bergfex.com](http://www.bergfex.com/) - topographic map of
  **Austria**
- [OpenCycleMap](http://www.opencyclemap.org/) - the OpenStreetMap Cycle Map **worldwide**

Map data © their respective owners. Built using
[Leaflet](http://leafletjs.com/).

## Development

Requirements: Recent Node.js

Setup

    npm install
    make -C app/vendor

Running the development server

    npm run grunt -- server

Run the linter before pushing changes

    npm run lint

Deployment

    make release deploy
