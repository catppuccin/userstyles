When taking screenshots of userstyles, you may want to hide sensitive information (such as your username, email, etc.).

You can use the [Flow Circular](https://fonts.google.com/specimen/Flow+Circular) font to redact details by obscuring any text on the page.

Use this snippet at the top of your userstyle to import and use the font:

```less
@import url("https://fonts.googleapis.com/css2?family=Flow+Circular&display=swap");

* {
  font-family: "Flow Circular", cursive;
}
```

Make sure to remove the snippet once you have taken the preview screenshots.
