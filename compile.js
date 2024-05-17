const fs = require('fs')
const path = require('path')
const less = require('less')
const distPath = path.join(__dirname, 'dist')
if(fs.existsSync(distPath)) fs.rmSync(distPath, { recursive: true })
fs.mkdirSync(distPath)
const stylesP = path.join(__dirname, 'styles')
const styleF = fs.readdirSync(stylesP).filter(f => {
    if(f == 'google-drive') return false;
    return true;
})
// console.log(styleF)
const exportss = []

styleF.forEach((f) => {
    // fs.mkdirSync(path.join())
    // const readMeMd = fs.readFileSync(path.join(stylesP, f, 'README.md')).toString()
    const lessFileName = path.join(stylesP, f, 'catppuccin.user.css')
    const cssThemeFile = fs.readFileSync(lessFileName).toString()
    const domainMaybe = cssThemeFile.split('\n').find(l => l.startsWith("@-moz-document")).split(/"|'/g)[1]
    const nameMaybe = cssThemeFile.split('\n').find(l => l.startsWith("@name")).split(' ').slice(1).join(' ')
    // console.log(domainMaybe)
    // console.log(nameMaybe)
    exportss.push({
        domain: domainMaybe,
        name: nameMaybe,
        url: `https://raw.githubusercontent.com/NeonGamerBot-QK/catppuccin-userstyles/blob/main/dist/${f}.css`
    })
    less.render(`@darkFlavor: "mocha";
    @lightFlavor: "mocha";
    @accentColor: "mauve";
    @contrastColor: "red";
    @graphUseAccentColor: 0;
    @bg-opacity: 0.2;
    @bg-blur: 20;
    @zenMode: 0;
    @zen: 0;
    @styleVideoPlayer: 1;
    @hideProfilePictures: 0;
    @additions: 0;
    @urls: "127\.0\.0\.1\:8384,0\.0\.0\.0\:8384,localhost\:8384";
    @colorizeLogo: 0;
    @darkenShadows: 1;
    @lighterMessages: 0;
    @highlight-redirect: 0;
    @logo: 1;
    @oled: 0;
    `+cssThemeFile,  {sourceMap:true}, (_,out) => {
        console.log(`Compiled! - ${f}`)
        // console.log(_,out)
        fs.writeFileSync(path.join(distPath, `${f}.css`), out.css)
    })
})
console.log(exportss)