---
title: Inspect hard to grab elements
description: Useful tip for inspecting elements that are hard to debug.
sidebar:
  order: 1
---

Paste the following snippet into your browser console, then trigger the event. Adjust the delay (in milliseconds) as needed.

```js
setTimeout(function () {
  debugger;
}, 3000);
```

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2017/02/debugger.gif?ssl=1)

GIF via ["Set a Timed Debugger To Web Inspect Hard-To-Grab Elements" - CSS Tricks](https://css-tricks.com/set-timed-debugger-web-inspect-hard-grab-elements/).
