# sable-electron

An electron wrapper for [Sable](https://github.com/SableClient/Sable) based on [Sable-Client-Electron](https://github.com/7w1/Sable-Client-Electron)
that uses a local build of Sable and fixes system notifications (on my machine 😅).

## building

I only tested this on Linux, Windows and Mac will need a configuration in package.json and might require more adaptations.

Build dependencies (arch packages): `pnpm`, `fnm`, `libxcrypt-compat`

By default, an AppImage and a .deb archive will be built:
```bash
git clone --recursive https://github.com/RasmusAntons/sable-electron.git
cd sable-electron
fnm use $(cat sable/.node-version)
pnpm i
pnpm run build
```
