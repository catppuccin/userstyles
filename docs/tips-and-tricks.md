<p align="center">
  <h2 align="center">📖 Tips and Tricks for writing a userstyle</h2>
</p>

&nbsp;

### Live reloading

If you want to see your changes in real-time while using an external:

1. Head to `chrome://extensions/` or your browser's equivalent.
2. Locate the stylus extension and click on the `Details` button.
3. Enable `Allow access to file URLs`.
4. Now you can open the `catppuccin.user.css` file in your browser by typing `file:///path/to/catppuccin.user.css` in the address bar.
5. Then you should notice stylus will load on that page, at this point ensure `live preview` is enabled.
6. Now you can make changes in your preferred editor and see real-time changes.


### Hideing sensitive information in screenshots

When taking screenshots of your userstyle, you may want to hide sensitive information such as your username, email, or any other personal information.

To do this we use the [Flow Circular font](https://fonts.google.com/specimen/Flow+Circular). 

We achieve this by placing the following snippet at the top of your userstyle, this will change the fonts to use flow circular.

```less
@import url('https://fonts.googleapis.com/css2?family=Flow+Circular&display=swap');

* {
  font-family: 'Flow Circular', cursive;
}
```
