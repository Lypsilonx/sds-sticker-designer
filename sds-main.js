// CSS Adjusts (hides) Elements if JavaScript is not enabled
document.body.classList.remove('no-js');

/** User Agent is Mobile */
var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
document.body.classList.add('mobile');

// #region Variables
/** Default Image (redundancy in sds-style.css under .backgroundimage) */
var background_path = "tree.jpeg";

/** Format of commands in the text (Always use starting and ending characters) */
var regex_cmd = /\§#?[a-z,0-9]+\$/g;

/** Max line length for normal input. adjust max_ll_text for using "text" command) */
var max_ll = 25;

/** Max line length when using "text" command */
var max_ll_text = 55;

/** Max lines until rendering cuts off */
var max_lines = 10;

/** Factor used to scale sticker element (Higher -> smaller) */
var scale_factor = 500;

/** The current language */
var language;

/** JSON File with language data */
var languageJSON;

/** Content of the save_name box */
var save_name;

// #endregion

// Load Language Setting
if (localStorage.getItem('language') === null) {
    language = 'en';
} else {
    language = localStorage.getItem('language');
}

// Change share icon on Apple devices
if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
    document.getElementById('sharebutton').querySelector('i').innerText = 'ios_share';
}

// Load Language File
fetch("language.json")
.then(response => response.json())
.then(json => {
    languageJSON = json;

    // #region Setup

    // Apply Language
    setLanguage();

    // Adjust to screen size
    adjustOnResize();

    // Load Save Name
    save_name = localStorage.getItem('save_name');
    
    // Load Autosave
    if (localStorage.getItem('temp') !== null) {
        loadSticker('temp');

        save_name = localStorage.getItem('save_name');
        document.getElementById('save_name').value = save_name;
    }
    // No Autosave
    else if (save_name != null) {
        // put save_name in #save_name
        document.getElementById('save_name').value = save_name;
        loadSticker(save_name);
    }
    // No Save
    else {
        save_name = "Sticker";
    }

    // Update Save Name
    updateSaveName();

    // Resize Textareas
    textUpdate();

    // Render Text
    renderText();

    // #endregion

    // #region Triggers

    // keypresses
    document.addEventListener('keydown', function(e) {
        // when ctrl+s is pressed
        if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
    
            saveSticker(document.getElementById('save_name').value);
    
            updateSaveName();
        }
    
        // when backspace is pressed and the cursor is not in an input field or contenteditable
        if (e.key === 'Backspace' && document.activeElement.tagName != 'INPUT' && document.activeElement.tagName != 'TEXTAREA' && document.activeElement.contentEditable != 'true') {
            e.preventDefault();
    
            // ask if the user wants to reset the sticker
            if (!confirm('Do you really want to reset the sticker?')) {
                return;
            }
    
            newSticker();
        }

        // when ctrl+z is pressed
        if (e.key === 'z' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            console.log('undo');

            // ! DOES NOT WORK (Have to click off the sticker)
            // Render Text
            renderText();
        }
    });

    // Screen Resize
    window.addEventListener('resize', function(e) {
        adjustOnResize();
    });

    // #region Settings 
    // when an image is uploaded to #background_image set the background image of .backgroundimage
    document.getElementById('background_image').addEventListener('change', function(e) {
        loadBackgroundImage(e.target.files[0]);
    });

    // when color_tint is changed update the background color of .tint
    document.getElementById('color_tint').addEventListener('change', function(e) {
        document.querySelector('.tint').style.backgroundColor = e.target.value;
    });

    // when logo_style is changed change the css variable --sds-logo-color and --sds-logo-color-middle
    document.getElementById('logo_style').addEventListener('change', function(e) {
        setLogoStyle(e.target.value);
    });

    // when logo_corner is changed change the alignment of .logo that is not in #title
    document.getElementById('logo_corner').addEventListener('change', function(e) {
        setLogoCorner(e.target.value);
    });

    // when #format is changed change the format of the sticker
    document.getElementById('format').addEventListener('change', function(e) {
        setFormat(e.target.value);
    });
    // #endregion

    // #region Tint
    // wehn entering .stickerdemo with mouse stop the timer and unhide #opacitypercentage
    document.querySelector('.stickerdemo').addEventListener('mouseenter', function(e) {
        unhidePercentage();
    });

    // when scrolling on .stickerdemo update the opacity of .tint
    document.querySelector('.stickerdemo').addEventListener('wheel', function(e) {
        unhidePercentage();
        // set opacity of .tint
        // get the current opacity
        var opacity = document.querySelector('.tint').style.opacity;
        // if opacity is empty set it to 0.5
        if (opacity == '') {
            opacity = 0.5;
        }
    
        // if scrolling up
        if (e.deltaY < 0) {
            // if opacity is greater than 0 subtract 0.1
            if (opacity > 0) {
                opacity = parseFloat(opacity) - 0.01;
            }
        }
        // if scrolling down
        else {
            // if opacity is less than 1 add 0.1
            if (opacity < 1) {
                opacity = parseFloat(opacity) + 0.01;
            }
        }
    
        // set opacity of .tint
        document.querySelector('.tint').style.opacity = opacity;
    
        // set opacity percentage
        document.getElementById('opacitypercentage').innerHTML = Math.round(opacity * 100) + '%';
    });
    
    // when leaving .stickerdemo with mouse hide #opacitypercentage
    document.querySelector('.stickerdemo').addEventListener('mouseleave', function(e) {
        // hide #opacitypercentage
        document.getElementById('opacitypercentage').style.opacity = 0;
    });
    // #endregion
    
    // #region Text
    // Scale Input and Render
    document.querySelector('.input').addEventListener('input', function(e) {
        textUpdate();
    });

    // Switch to Edit Mode
    document.querySelector('.input').addEventListener('click', function(e) {
        document.querySelector('.input').classList.add('active');
        document.querySelector('.renderedtext').classList.remove('active');
    });
    
    // Switch to Edit Mode
    document.querySelector('.tint').addEventListener('click', function(e) {
        document.querySelector('.input').classList.add('active');
        document.querySelector('.renderedtext').classList.remove('active');
    
        // unblur .input
        document.querySelector('.input').focus();
    
        // set the caret to the end of the input
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(document.querySelector('.input').childNodes[0], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    });
    
    // Switch to Render Mode
    document.querySelector('.input').addEventListener('blur', function(e) {
        document.querySelector('.input').classList.remove('active');
        document.querySelector('.renderedtext').classList.add('active');

        // Autosave
        saveSticker('temp');
    
        // Render Text
        renderText();
    });
    // #endregion

    // #region Saving/Loading
    // Type in Save Name
    document.getElementById('save_name').addEventListener('input', function(e) {
        updateSaveName();
    });

    // Save Button
    document.getElementById('savebutton').addEventListener('click', function(e) {
        saveSticker(document.getElementById('save_name').value);
    
        updateSaveName();
    });

    // Load Button
    document.getElementById('loadbutton').addEventListener('click', function(e) {
        loadSticker(document.getElementById('save_name').value);
    
        updateSaveName();
    });

    // Autocomplete
    autocomplete(document.getElementById("save_name"), Object.keys(localStorage).filter(function(key) {
        return key.startsWith('Sticker:');
    }).map(function(key) {
        return key.slice(8);
    }));

    // Delete Button
    document.getElementById('deletebutton').addEventListener('click', function(e) {
        // ask if the user wants to delete the sticker
        if (!confirm('Are you sure you want to delete "' + document.getElementById('save_name').value + '"?')) {
            return;
        }
    
        deleteSticker(document.getElementById('save_name').value);
        displayMessage(translate('--del_pre--') + save_name + translate('--del_post--'), "delete");
    
        updateSaveName();
    });

    // Autosave
    setInterval(function() {
        saveSticker('temp');
    }, 30000);
    // #endregion

    // #region Export
    // Download image
    document.getElementById("downloadbutton").addEventListener("click", function() {
        downloadSticker();
    });

    // share image
    document.getElementById("sharebutton").addEventListener("click", function() {
        // add render class to #downloadThis
        shareSticker();
    });
    // #endregion
    
    // #region Language
    // when #languagebutton is clicked
    document.getElementById('languagebutton').addEventListener('click', function(e) {
        // open #languagemenu
        document.getElementById('languagemenu').classList.toggle('open');
    });

    // when an a with class lan is clicked
    document.querySelectorAll('.lan').forEach(function(element) {
        element.addEventListener('click', function(e) {
            // set the language to the value of the input
            language = element.id;
    
            // save the language to localStorage
            localStorage.setItem('language', language);

            // temp save
            saveSticker('temp');

            // reload the page
            location.reload();
    
            // set the languagebutton title to the value of the input
            document.getElementById('languagebutton').title = element.title;
    
            // close #languagemenu
            document.getElementById('languagemenu').classList.toggle('open');
    
            displayMessage(translate('--lan_pre--') + element.title + translate('--lan_post--'), "language");
        });
    });
    // #endregion

    // #endregion
});

// #region Functions

/** Sets .portrait and .awkward class on body and resizes the sticker */
function adjustOnResize() {

    // set portrait bool if screen is taller than it is wide
    var portrait = window.matchMedia("(orientation: portrait)").matches;
    if (portrait) {
        document.body.classList.add('portrait');
    } else {
        document.body.classList.remove('portrait');
    }

    // set awkward bool if screen is wider than half of the height
    var awkward = window.innerWidth > window.innerHeight / 5 * 3;
    if (awkward) {
        document.body.classList.add('awkward');
    } else {
        document.body.classList.remove('awkward');
    }

    if (mobile && portrait && !awkward) {
        // adjust .stickerdemo to be the max of 90% of width of the screen or 90% of height of the screen
        document.querySelector('.stickerdemo').style.transform = 'scale(' + Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9) / scale_factor + ')';
    } else {
        // adjust .stickerdemo to be the max of 50% of the width of the screen or 50% of the height of the screen
        document.querySelector('.stickerdemo').style.transform = 'scale(' + Math.min(window.innerWidth / 2, window.innerHeight / 2) / scale_factor + ')';
    }
}

// #region Utilities
/** Shows a pop-up to the User
 * @param {string} message - The message to show
 * @param {string} icon - The icon to show
 */
function displayMessage(message, icon = "") {
    if (icon != "") {
        icon = '<i class="material-icons">' + icon + '</i>';
    }
    document.getElementById('messageboard').innerHTML = icon + translate(message);
    document.getElementById('messageboard').classList.remove('hidden');

    // set timer to hide #messageboard
    setTimeout(function() {
        document.getElementById('messageboard').classList.add('hidden');
    }, 3000);
}

/** Resets the sticker to its original form by reloading the page and deleting the 'temp' save */
function newSticker() {
    document.getElementById('save_name').value = "";
    updateSaveName();

    //delete temp
    localStorage.removeItem('temp');

    // reload page
    location.reload();
}
// #endregion

// #region Settings
/** Change the format of the sticker
 * @param {string} format - The format to change to ("square", "sticker", "story")
*/
function setFormat(format) {
    switch (format) {
        case 'Square':
            // change .stickerdemo width and height to 28em
            document.querySelector('.stickerdemo').style.width = '28em';
            document.querySelector('.stickerdemo').style.height = '28em';
            max_ll = 25;
            max_ll_text = 55;
            scale_factor = 500;
            max_lines = 10;
            break;
        case 'Sticker':
            // change .stickerdemo width to 20em and height to 30em
            document.querySelector('.stickerdemo').style.width = '20em';
            document.querySelector('.stickerdemo').style.height = '30em';
            max_ll = 17;
            max_ll_text = 25;
            scale_factor = 500;
            max_lines = 10;
            break;
        case 'Story':
            // change .stickerdemo width to 20em and height to 40em
            document.querySelector('.stickerdemo').style.width = '20em';
            document.querySelector('.stickerdemo').style.height = '40em';
            max_ll = 17;
            max_ll_text = 25;
            scale_factor = 650;
            max_lines = 15;
            break;
    }

    renderText();
}

/** Changes the logo style (Variables in sds-style.css)
 * @param {string} style - The style to change to ("Classic", "White", "Black")
 */
function setLogoStyle(style) {
    switch (style) {
        case 'Classic':
            document.documentElement.style.setProperty('--sds-logo-color', '#000');
            document.documentElement.style.setProperty('--sds-logo-color-middle', '#b1003a');
            break;
        case 'White':
            document.documentElement.style.setProperty('--sds-logo-color', '#fff');
            document.documentElement.style.setProperty('--sds-logo-color-middle', '#fff');
            break;
        case 'Black':
            document.documentElement.style.setProperty('--sds-logo-color', '#000');
            document.documentElement.style.setProperty('--sds-logo-color-middle', '#000');
            break;
    }
}

/** Changes the corner in which the logo is placed
 * @param {string} corner - The corner to change to ("Top Left", "Top Right", "Bottom Left", "Bottom Right")
 */
function setLogoCorner(corner) {
    logoEl = document.getElementsByClassName('logo')[1];
    switch (corner) {
        case 'Top Left':
            logoEl.style.top = '0';
            logoEl.style.left = '0';
            logoEl.style.bottom = 'auto';
            logoEl.style.right = 'auto';
            break;
        case 'Top Right':
            logoEl.style.top = '0';
            logoEl.style.left = 'auto';
            logoEl.style.bottom = 'auto';
            logoEl.style.right = '0';
            break;
        case 'Bottom Left':
            logoEl.style.top = 'auto';
            logoEl.style.left = '0';
            logoEl.style.bottom = '0';
            logoEl.style.right = 'auto';
            break;
        case 'Bottom Right':
            logoEl.style.top = 'auto';
            logoEl.style.left = 'auto';
            logoEl.style.bottom = '0';
            logoEl.style.right = '0';
            break;
    }
}
// #endregion

// #region Tint
/** Make the opacity percentage appear and set a timer to make it disappear again */
function unhidePercentage() {
    // unhide #opacitypercentage
    document.getElementById('opacitypercentage').style.opacity = 1;

    // set timer to hide #opacitypercentage
    var timer = setTimeout(function() {
        document.getElementById('opacitypercentage').style.opacity = 0;
    }, 2000);
}
// #endregion

// #region Text
/** Scales .input and .renderedtext if the line overflows */
function textUpdate() {
    var em = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (document.querySelector('.input').offsetWidth / 2 > (document.querySelector('.backgroundimage').offsetWidth - 5 * em)) {
        document.querySelector('.input').style.transform = 'scale(' + (document.querySelector('.backgroundimage').offsetWidth - 5 * em) / document.querySelector('.input').offsetWidth + ')';
    } else {
        document.querySelector('.input').style.transform = 'scale(0.5)';
    }

    // scale .renderedtext using the same method
    if (document.querySelector('.renderedtext').offsetWidth / 2 > (document.querySelector('.backgroundimage').offsetWidth - 5 * em)) {
        document.querySelector('.renderedtext').style.transform = 'scale(' + (document.querySelector('.backgroundimage').offsetWidth - 5 * em) / document.querySelector('.renderedtext').offsetWidth + ')';
    } else {
        document.querySelector('.renderedtext').style.transform = 'scale(0.5)';
    }

    // when input (without whitespaces) is empty set the content of .input to an invisible character
    if (document.querySelector('.input').textContent.replace(/\s/g, '') == '') {
        document.querySelector('.input').textContent = '\u200B';

        // set the caret to the end of the input
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(document.querySelector('.input').childNodes[0], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    //when input is letter + u200B move the u200B to the start of the input
    if (document.querySelector('.input').textContent[1] == '\u200B') {
        document.querySelector('.input').textContent = '\u200B' + document.querySelector('.input').textContent[0];

        // set the caret to the end of the input
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(document.querySelector('.input').childNodes[0], 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

/** Splits the text into lines and adds them to the .renderedtext element.
 * Passes every line to the handleCommand function and sets the style of the line accordingly.
 */
function renderText() {
    // for every line in .input (remove the preceding and trailing whitespace)
    var lines = document.querySelector('.input').innerHTML.replace(/^\s+|\s+$/g, '').split('<br>');
    var renderedText = '';
    var l = 0;
    for (var i = 0; i < lines.length && i <= max_lines; i++) {
        // if .input only contains u200B
        if (lines[i].replace(/\s/g, '') == '\u200B') {
            // set .renderedtext to an empty string
            document.querySelector('.renderedtext').innerHTML = '';
            break;
        }

        // create p for every line

        // if line is empty add a <br>
        if (lines[i] == '' && l < max_lines) {
            // if line is not the last line add a <br>
            if (i != lines.length - 1) {
                renderedText += '<br>';
                l += 1;
            }
        } else {
            var args = '';
            // remove commands %<command> from line
            var rlines = lines[i].replace(regex_cmd, '');
            // if line is too long split it into multiple lines
            if (rlines.length > ((args.search('text') == -1) ? max_ll : max_ll_text)) {
                var words = lines[i].split(' ');
                var line = '';
                for (var j = 0; j < words.length; j++) {
                    // if line is too long (actual size) add a <br>
                    if (line.replace(regex_cmd, '').length + (regex_cmd.test(words[j]) ? 0 : words[j].length) > ((args.search('text') == -1) ? max_ll : max_ll_text)) {
                        // if commands in line
                        if (regex_cmd.test(line)) {
                            args = handleCommands(line);
                        }

                        renderedText += '<p ' + args + '>' + line.replace(regex_cmd, '')+ '</p>';
                        l += 1;
                        line = '';
                    }
                    line += words[j] + ' ';
                }
                if (line.replace(regex_cmd, '') < line) {
                    args = handleCommands(line);
                }

                renderedText += '<p ' + args + '>' + line.replace(regex_cmd, '') + '</p>';
                l += 1;
            } else {
                if (regex_cmd.test(lines[i])) {
                    args = handleCommands(lines[i]);
                }

                renderedText += '<p ' + args + '>' + rlines + '</p>';
                l += 1;
            }
        }
    }

    // set .renderedtext to the rendered text
    document.querySelector('.renderedtext').innerHTML = renderedText;
}

/** Handles the commands in the line and returns the arguments for the p element */
function handleCommands(line) {
    var args = '';
    var style = '';

    // get all commands
    var commands = line.match(regex_cmd);

    // handle commands
    for (var k = 0; k < commands.length; k++) {
        // remove last and first character
        var cmd = commands[k].slice(1, -1);
        if (cmd == 'white') {
            style += 'background-color: white; color: black;';
        }
        // if command is #<hex color> set background color to <hex color>
        else if (cmd.match(/#[0-9a-fA-F]{6}/)) {
            style += 'background-color: ' + cmd.slice(0) + ';';

            // if color is darker than 50% set text color to white
            if (parseInt(cmd.slice(1), 16) < 8388608) {
                style += 'color: white;';
            }
        }
        // if command is transparent set background color to transparent
        else if (cmd == 'transparent') {
            style += 'background-color: transparent;';
        }
        // if command is small set scale to 0.8
        else if (cmd == 'small') {
            style += 'transform: scale(0.8);';

            // if format is square
            if (document.getElementById('format').value == 'Square') {
                //set top and bottom margins to -0.8% (and accord for 1px gap)
                style += 'margin-top: calc(-0.8% - 1px); margin-bottom: calc(-0.8% - 1px);';
            } else {
                //set top and bottom margins to -0.8%
                style += 'margin-top: calc(-0.8% - 2.5px); margin-bottom: calc(-0.8% - 4.8px);';
            }
        }
        // if command is text set font-family to Open Sans and font-size to 1em
        else if (cmd == 'text') {
            args += 'class = "text"';
        }
        // if command is right set align self to flex-end and transform origin to center right
        else if (cmd == 'right') {
            style += 'align-self: flex-end;';
            style += 'transform-origin: center right;';
        }
    }
    return args + 'style="' + style + '"';
}
// #endregion

// #region Saving/Loading
/** 
 * Opens the url and sets the image as background image.
 * @param {string} url - The url of the image.
 */
function loadBackgroundImage(url) {
    var file = url;
    var reader = new FileReader();
    reader.onload = function(e) {
        // set background image
        document.querySelector('.backgroundimage').style.backgroundImage = 'url(' + e.target.result + ')';
        //save path to background image
        background_path = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Saves the sticker to localStorage ("Sticker:<save_name>").
 * @param {string} save_name - The name of the sticker (if this is 'temp' the sticker will be saved as autosave and loaded on reload).
 */
function saveSticker(save_name) {
    if (save_name == 'temp') {
        settings = packSettings();

        // save the settings
        localStorage.setItem(save_name, JSON.stringify(settings));
    } else {
        // if save_name is already taken
        if (localStorage.getItem('Sticker:' + save_name) != null) {
            // ask if the user wants to overwrite the sticker
            if (!confirm('A sticker with the name "' + save_name + '" already exists. Do you want to overwrite it?')) {
                return;
            }
        }
        displayMessage(translate('--sv_pre--') + save_name + translate('--sv_post--'), "save");

        settings = packSettings();

        // save the settings
        localStorage.setItem('Sticker:' + save_name, JSON.stringify(settings));
    }
}

/**
 * Loads the sticker from localStorage ("Sticker:<save_name>").
 * @param {string} save_name - The name of the sticker (if this is 'temp' the sticker will be loaded from autosave).
 */
function loadSticker(save_name) {
    if (save_name == 'temp') {
        if (localStorage.getItem(save_name) == null) {
            // if the save_name doesn't exist, do nothing
            return;
        }
        // get the settings from localStorage
        var settings = JSON.parse(localStorage.getItem(save_name));

        unpackSettings(settings);
    } else {
        if (localStorage.getItem('Sticker:' + save_name) == null) {
            // if the save_name doesn't exist, do nothing
            return;
        }
        // Delete autosave
        localStorage.removeItem('temp');

        // get the settings from localStorage
        var settings = JSON.parse(localStorage.getItem('Sticker:' + save_name));

        unpackSettings(settings);

        // load the image from background_path
        displayMessage(translate('--ld_pre--') + save_name + translate('--ld_post--'), "folder_open");
    }
}

/**
 * Packs all the settings into an object.
 * @returns {object} The settings.
 */
function packSettings() {
    var text = document.querySelector('.input').innerHTML;
    // replace the linebreaks (<br>) with a %lbr% so it can be saved in localstorage
    text = text.replace(/<br>/g, '%lbr%');

    // get the current settings
   return {
        'text' : text,
        'background_image': background_path,
        'color_tint': document.getElementById('color_tint').value,
        'tintopacity': document.querySelector('.tint').style.opacity == '' ? 0.5 : document.querySelector('.tint').style.opacity,
        'cityname': document.getElementById('cityname').innerText,
        'logo_style': document.getElementById('logo_style').value,
        'logo_corner': document.getElementById('logo_corner').value,
        'format': document.getElementById('format').value,
    };
}

/**
 * Unpacks the settings from an object and applies them.
 * @param {object} settings - The settings.
 */
function unpackSettings(settings) {
    // set the settings
    var text = settings.text;
    // replace %lbr% with a linebreak (<br>)
    text = text.replace(/%lbr%/g, '<br>');
    document.querySelector('.input').innerHTML = text;

    // set the background image
    document.querySelector('.backgroundimage').style.backgroundImage = 'url(' + settings.background_image + ')';
    background_path = settings.background_image;

    // set the color of .tint
    document.getElementById('color_tint').value = settings.color_tint;
    document.querySelector('.tint').style.backgroundColor = settings.color_tint;
    
    // set the opacity percentage
    document.querySelector('.tint').style.opacity = settings.tintopacity;
    document.getElementById('opacitypercentage').innerHTML = Math.round(settings.tintopacity * 100) + '%';

    // set the city name
    document.getElementById('cityname').innerText = settings.cityname;

    // set the logo style
    document.getElementById('logo_style').value = settings.logo_style;
    setLogoStyle(settings.logo_style);

    document.getElementById('logo_corner').value = settings.logo_corner;
    setLogoCorner(settings.logo_corner);

    document.getElementById('format').value = settings.format;
    setFormat(settings.format);
}

// ! NOT IN USE
function createLink() {
    // get the current settings
    settings = packSettings();

    // create a link with the settings
    var link = 'https://politischdekoriert.de/sds-sticker-designer/?'
    for (var key in settings) {
        link += key + '=' + encodeURIComponent(settings[key]) + '&';
    }
    link = link.slice(0, -1);

    return link;
}

// ! NOT IN USE
function settingsFromLink(link) {
    // get the settings from the url
    var url = new URL(link);
    var settings = {};
    for (var key of url.searchParams.keys()) {
        settings[key] = url.searchParams.get(key);
    }

    return settings;
}

/**
 * Saves save_name to localStorage.
 * enables and disables save/load/delete buttons.
 */
function updateSaveName() {
    // save save_name to localStorage
    localStorage.setItem('save_name', document.getElementById('save_name').value);

    // if the save_name is empty disable #savebutton and #loadbutton
    if (document.getElementById('save_name').value == '') {
        document.getElementById('savebutton').disabled = true;
        document.getElementById('loadbutton').disabled = true;
    } else {
        document.getElementById('savebutton').disabled = false;
        document.getElementById('loadbutton').disabled = false;
    }

    // if the save_name is already used change color of i to red (change title to Overwrite) and unhide loadbutton and deletebutton
    if (localStorage.getItem('Sticker:' + document.getElementById('save_name').value) != null) {
        document.getElementById('savebutton').querySelector('i').style.color = 'red';
        document.getElementById('savebutton').title = translate('--ovwr--');
        document.getElementById('loadbutton').style.display = 'flex';
        document.getElementById('deletebutton').style.display = 'flex';
    } else {
        document.getElementById('savebutton').querySelector('i').style.color = 'white';
        document.getElementById('savebutton').title = 'Save';
        document.getElementById('loadbutton').style.display = 'none';
        document.getElementById('deletebutton').style.display = 'none';
    }
}

/**
 * Deletes save_name from localStorage.
 * Reloads the page using newSticker().
 */
function deleteSticker(save_name) {
    // delete the save from localStorage
    localStorage.removeItem('Sticker:' + save_name);

    newSticker();
}

/** See https://www.w3schools.com/howto/howto_js_autocomplete.asp */
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }

            // set save_name to inp.value
            save_name = inp.value;

            updateSaveName();

            // load sticker
            loadSticker(save_name);
            renderText();
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
// #endregion

// #region Export
/** Opens navigation.share in supported browsers and gives it the rendered image as a blob */
function shareSticker() {
    save_name = document.getElementById('save_name').value;

    const filesArray = [];

    var node = document.getElementById('downloadThis');

    // Cropping context
    let cropper = document.createElement('canvas').getContext('2d');

    html2canvas(node).then(function(canvas) {
        // Crop Image
        cropper.canvas.width = canvas.width - 2;
        cropper.canvas.height = canvas.height - 2;
        cropper.drawImage(canvas, 0, 0);
        // put into filesArray
        fetch(cropper.canvas.toDataURL())
        .then(response => response.blob())
        .then(blob => {
            const file = new File([blob], save_name + '.png', {type: 'image/png'});
            filesArray.push(file);

            // open share dialog
            if (navigator.share) {
                navigator.share({
                    title: save_name,
                    files: filesArray,
                }).catch(console.error);
                displayMessage(translate('--shrng--'), "share");
            }
        });
    });
}

/** Renders the Image and calls saveAs() */
function downloadSticker() {
    save_name = document.getElementById('save_name').value;
    
    displayMessage(translate('--dwld--'), "download");

    var node = document.getElementById('downloadThis');

    // Cropping context
    let cropper = document.createElement('canvas').getContext('2d');

    html2canvas(node).then(function(canvas) {
        // Crop Image
        cropper.canvas.width = canvas.width - 2;
        cropper.canvas.height = canvas.height - 2;
        cropper.drawImage(canvas, 0, 0);
        // Save the cropped image
        saveAs(cropper.canvas.toDataURL(), save_name + '.png');
    });
}

/**
 * Saves the rendered image to the users device
 * @param {string} url - Data URL of the image
 * @param {string} filename - Name of the file
 */
function saveAs(url, filename) {

    var link = document.createElement('a');

    if (typeof link.download === 'string') {
        link.href = url;
        link.download = filename;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);
    } else {
        window.open(url);
    }
}
// #endregion

// #region Language
/**
 * Replaces tokens --token-- with the corresponding translation.
 */
function setLanguage() {
    var ihtml = document.body.innerHTML;
    // replace all occurences of languageJSON[language] keys (marked by --string--) with the values
    for (var key in languageJSON[language]) {
        ihtml = ihtml.replace(new RegExp(key, 'g'), languageJSON[language][key]);
    }

    document.body.innerHTML = ihtml;
}

/**
 * Replaces tokens --token-- with the corresponding translation. (JavaScript code)
 * @param {string} string - String to translate
 * @returns {string} Translated string
 */
function translate(string) {
    // replace all occurences of languageJSON[language] keys (marked by --string--) with the values
    for (var key in languageJSON[language]) {
        string = string.replace(new RegExp(key, 'g'), languageJSON[language][key]);
    }

    return string;
}
// #endregion

// #endregion