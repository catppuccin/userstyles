---
title: MediaWiki Library
description: Reference to using the MediaWiki library.
---

The MediaWiki library is a collection of mixins to consistently theme userstyles targeting the Vector 2022 MediaWiki skin. 

[Source code](https://github.com/catppuccin/userstyles/blob/main/lib/mediawiki.less)

See the [Library Modules](/contributing/library-modules/) article for information on what libraries are and what problems they solve.

# Usage

Add the import block at the top of the userstyle:  
```less  
@import "https://userstyles.catppuccin.com/lib/mediawiki.less";  
```  
Outside the `#catppuccin` mixin, add the reset block to \<add explanation\>

```less  
#__mediawiki.reset();  
```

Then, inside the `#catppuccin` mixin, add the base block to add CSS variables and other styles.  

```less
\#\_\_mediawiki.base();  
```

# API

TO-DO
