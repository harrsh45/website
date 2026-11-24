# Vendored Scrollcraft engine

`scrollcraft.js` and `scrollcraft.css` are copied **unmodified** from
[nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft)
(`plugins/nateherk-design/skills/scroll-craft/engine/`, commit
`75d81f74e83692add18cd7a8a8e078b8a887a579`, MIT licence, see `LICENSE`).

The skill's rule is that the engine is never edited per project. To check:

```
sha256 scrollcraft.js   91a8e57cec07b7b977584885741f07d93fd1cd08fdbea623d5432fcede66fd38
sha256 scrollcraft.css  519e254c1877a50eb724153d483ccff5b3b434fbaf3baf9c5bc1179ec28b075a
```

## How it is integrated with Next.js (the only adaptation)

- The CSS is imported once in `src/app/layout.tsx`, before `globals.css`, so the
  site's tokens override the engine defaults.
- The JS is an IIFE that touches `window` and `matchMedia` at load, so it cannot
  run on the server. `src/components/ScrollcraftMount.tsx` imports it dynamically
  inside `useEffect`, calls `ScrollCraft.mount()` on the page root, and calls the
  engine's own `destroy()` on unmount.
- The engine hides `[data-sc-in]` content until it mounts. For an
  Instagram-in-app-browser audience on slow networks that must fail open, so
  `globals.css` only allows that pre-hide while `<html>` carries `sc-armed`, a
  class set by a tiny inline script and removed again if the engine has not
  mounted within 3 seconds. With JavaScript off, nothing is ever hidden.
- Page-specific behaviour (the lamp light over each project) lives in
  `src/components/LampLight.tsx`, not in the engine.
