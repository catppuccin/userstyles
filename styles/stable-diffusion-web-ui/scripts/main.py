import os
import re
import shutil
import gradio as gr
from modules import script_callbacks
from modules import shared, scripts
import modules.scripts as scripts

accents = ['rosewater', 'flamingo', 'pink' , 'mauve' ,'red', 'maroon' ,'peach', 'yellow', 'green', 'teal', 'sky', 'blue', 'sapphire', 'lavender']
flavors = ['latte', 'frappe', 'macchiato', 'mocha']
script_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

def on_ui_settings():
    section = ('ctp', 'Catppuccin Theme')
    shared.opts.add_option("ctp_flavor", 
                            shared.OptionInfo(
                                default='mocha', 
                                label="Catppuccin Flavor",  
                                component=gr.Radio, 
                                component_args={"choices": flavors}, 
                                onchange=on_ui_settings_change, 
                                section=section))

    shared.opts.add_option("accent_color", 
                            shared.OptionInfo(
                                default='maroon',
                                label='Accent',
                                component=gr.Radio,
                                component_args={"choices": accents},
                                onchange=on_accent_color_change,
                                section=section
                            ))

def on_accent_color_change():
    pattern = re.compile(r"--accent:\s*(.*)")
    # replace the accent color
    with open(os.path.join(script_path,'style.css'), "r+") as file:
        text = re.sub(pattern, f'--accent: var(--{shared.opts.accent_color});', file.read(), count=1)
        file.seek(0)
        file.write(text)
        file.truncate()

def on_ui_settings_change():
    # Move css over
    shutil.copy(os.path.join(script_path,f'flavors/{shared.opts.ctp_flavor}.css'), os.path.join(script_path, 'style.css'))
    
    # reappply accent color
    on_accent_color_change()

script_callbacks.on_ui_settings(on_ui_settings)