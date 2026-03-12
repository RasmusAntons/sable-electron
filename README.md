# sable-electron

An electron wrapper for [Sable](https://github.com/SableClient/Sable) based on [Sable-Client-Electron](https://github.com/7w1/Sable-Client-Electron)
that uses a local build of Sable and fixes system notifications (on my machine 😅).

## building and running

I still need to figure out how to build and package the electron app.

The current process looks like this:

build Sable
```bash
cd sable
pnpm run build && cp -r public/res/ dist/public/
cd ..
```

run sable-electron
```bash
pnpm start
```
