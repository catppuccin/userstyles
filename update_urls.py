import os

flavors = ["mocha", "macchiato", "frappe", "latte"]
css_files = []
for path, dirs, files in os.walk("styles"):
    [dirs.remove(dir) if dir in dirs else None for dir in ["whoogle", "pure-css", "assets", ".git"]]
    for file in files:
        if file.split("/")[-1].replace(".css", "") in flavors:
            continue
        if file.endswith(".css"):
            css_files.append(os.path.join(path, file))

def replace(l):
    return l.replace("catppuccin/userstyles/styles/", "catppuccin/userstyles/tree/main/styles/")

for fpath in css_files:
    content = ""
    with open(fpath) as file:
        content = file.readlines()
#        content[2] = replace(content[2])
        if "@homepageURL" in content[3]:
            content[3] = replace(content[3])

        # for l in content:
        #     if l.startswith("@updateURL"):
        #         l = replace(l)
        #         break
    with open(fpath, 'w') as file:
        file.writelines(content)
