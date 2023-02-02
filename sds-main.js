// CSS Adjusts (hides) Elements if JavaScript is not enabled
document.body.classList.remove("no-js");

/** User Agent is Mobile */
var mobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
if (mobile) {
  document.body.classList.add("mobile");
}

// #region Variables
/** Default Image (redundancy in sds-style.css under .backgroundimage) */
var background_path = "tree.jpeg";

/** Format of commands in the text (Always use starting and ending characters) */
var regex_cmd = /\§[a-z,0-9,#]+\$/g;

/** Used to split commands */
var command_seperator = ",";

/** List of commands used for autocomplete*/
var command_list = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "black",
  "white",
  "grey",
  "gray",
  "brown",
  "cyan",
  "lime",
  "maroon",
  "navy",
  "olive",
  "teal",
  "violet",
  "transparent",
  "small",
  "text",
  "center",
  "right",
  "left",
];

/** Max line length for normal input. adjust max_ll_text for using "text" command) */
var max_ll = 25;

/** Max line length when using "text" command */
var max_ll_text = 40;

/** Max lines until rendering cuts off */
var max_lines = 10;

/** Factor used to scale sticker element (Higher -> smaller) */
var scale_factor = 500;

/** Factor used to scale the sticker element */
var stickerScale = 1;

/** Size in px of final export */
var expFormat = [1790, 1790];

/** The current language */
var language;

/** JSON File with language data */
var languageJSON;

/** Content of the save_name box */
var save_name;

// #endregion

// Load Language Setting
if (localStorage.getItem("language") === null) {
  language = "en";
} else {
  language = localStorage.getItem("language");
}

// Change share icon on Apple devices
if (navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
  document.getElementById("sharebutton").querySelector("i").innerText =
    "ios_share";
}

// Load Language File
fetch("language.json")
  .then((response) => response.json())
  .then((json) => {
    languageJSON = json;

    // #region Setup

    // Apply Language
    setLanguage();

    // split cityname
    var text = document
      .getElementById("cityname")
      .innerText.split("")
      .join("\xa0");

    document.getElementById("cityname").innerText = text;

    // Adjust to screen size
    adjustOnResize();

    // Load Save Name
    save_name = localStorage.getItem("save_name");

    // Load Autosave
    if (localStorage.getItem("temp") !== null) {
      loadSticker("temp");

      save_name = localStorage.getItem("save_name");
      document.getElementById("save_name").value = save_name;
    }
    // No Autosave
    else if (save_name != null && save_name != "") {
      // put save_name in #save_name
      document.getElementById("save_name").value = save_name;
      loadSticker(save_name);
    }
    // No Save
    else {
      save_name = translate("--stck--");

      i = 2;

      // find a save name that is not taken
      while (localStorage.getItem("Sticker:" + save_name) != null) {
        save_name = translate("--stck--") + " " + i;
        i++;
      }

      // put save_name in #save_name
      document.getElementById("save_name").value = save_name;

      // put u200b + --ys-- into .input
      document.querySelector(".input").innerHTML =
        "\u200b" + translate("--ys--");

      updateSaveName();
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
    document.addEventListener("keydown", function (e) {
      // when ctrl+s is pressed
      if (
        e.key === "s" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        e.preventDefault();

        saveSticker(document.getElementById("save_name").value);

        updateSaveName();
      }

      // when backspace is pressed and the cursor is not in an input field or contenteditable
      if (
        e.key === "Backspace" &&
        document.activeElement.contentEditable != "true" &&
        document.activeElement.type != "text"
      ) {
        e.preventDefault();

        // ask if the user wants to reset the sticker
        if (!confirm("Do you really want to reset the sticker?")) {
          return;
        }

        newSticker();
      }

      // when ctrl+z is pressed
      if (
        e.key === "z" &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        console.log("undo");

        // ! DOES NOT WORK (Have to click off the sticker)
        // Render Text
        renderText();
      }

      // cursor is inside of .input (contenteditable)
      if (document.activeElement.classList.contains("input")) {
        //when ctrl+a is pressed
        if (
          e.key === "a" &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
        ) {
          e.preventDefault();

          //Select all text in the input (contenteditable) except the first character
          range = document.createRange();
          range.selectNodeContents(document.activeElement);
          range.setStart(document.activeElement.firstChild, 1);
          selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // when ctrl+x is pressed (and everything is selected)
        if (
          e.key === "x" &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
          document.activeElement.innerText.length - 1 ==
            window.getSelection().toString().length
        ) {
          e.preventDefault();

          // copy selected text
          navigator.clipboard.writeText(
            document.activeElement.innerText.substring(1)
          );

          // delete text (set to u200b)
          document.activeElement.innerText = "\u200b";
        }

        // when ctrl+v is pressed and clipboard is not empty and .input is empty
        if (
          e.key === "v" &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
          document.activeElement.innerText == "\u200b" &&
          navigator.clipboard.readText() != ""
        ) {
          e.preventDefault();

          // paste from clipboard
          navigator.clipboard.readText().then((clipText) => {
            document.activeElement.innerText = "\u200b" + clipText;
          });
        }
      }
    });

    // Screen Resize
    window.addEventListener("resize", function (e) {
      adjustOnResize();
    });

    // #region Settings
    // when an image is uploaded to #background_image set the background image of .backgroundimage
    document
      .getElementById("background_image")
      .addEventListener("change", function (e) {
        loadBackgroundImage(e.target.files[0]);
      });

    // when color_tint is changed update the background color of .tint
    document
      .getElementById("color_tint")
      .addEventListener("change", function (e) {
        document.querySelector(".tint").style.backgroundColor = e.target.value;
      });

    // when logo_style is changed change the css variable --sds-logo-color and --sds-logo-color-middle
    document
      .getElementById("logo_style")
      .addEventListener("change", function (e) {
        setLogoStyle(e.target.value);
      });

    // when logo_corner is changed change the alignment of .logo that is not in #title
    document
      .getElementById("logo_corner")
      .addEventListener("change", function (e) {
        setLogoCorner(e.target.value);
      });

    // when #format is changed change the format of the sticker
    document.getElementById("format").addEventListener("change", function (e) {
      setFormat(e.target.value);
    });

    // when #cityname (div contentediatble) is changed (unfocus) change the text of #cityname
    document.getElementById("cityname").addEventListener("blur", function (e) {
      // split the text into letters and put "\xa0" between them
      var text = e.target.innerText.split("").join("\xa0");

      document.getElementById("cityname").innerText = text;

      // remove "&nbsp;" after <br>
      text = document.getElementById("cityname").innerHTML;
      text = text.replace(/<br>\&nbsp;/g, "<br>");
      document.getElementById("cityname").innerHTML = text;
    });

    // when #cityname (div contentediatble) is clicked (focus) remove all spaces
    document.getElementById("cityname").addEventListener("focus", function (e) {
      // get the text
      var text = e.target.innerText;

      // remove all spaces (\xa0)
      text = text.replace(/\xa0/g, "");

      document.getElementById("cityname").innerText = text;
    });

    // #endregion

    // #region Tint
    // wehn entering .stickerdemo with mouse stop the timer and unhide #opacitypercentage
    document
      .querySelector(".stickerdemo")
      .addEventListener("mouseenter", function (e) {
        unhidePercentage();
      });

    // when scrolling on .stickerdemo update the opacity of .tint
    document
      .querySelector(".stickerdemo")
      .addEventListener("wheel", function (e) {
        unhidePercentage();
        // set opacity of .tint
        // get the current opacity
        var opacity = document.querySelector(".tint").style.opacity;
        // if opacity is empty set it to 0.5
        if (opacity == "") {
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
        document.querySelector(".tint").style.opacity = opacity;

        // set opacity percentage
        document.getElementById("opacitypercentage").innerHTML =
          Math.round(opacity * 100) + "%";
      });

    // when leaving .stickerdemo with mouse hide #opacitypercentage
    document
      .querySelector(".stickerdemo")
      .addEventListener("mouseleave", function (e) {
        // hide #opacitypercentage
        document.getElementById("opacitypercentage").style.opacity = 0;
      });
    // #endregion

    // #region Text
    // Scale Input and Render
    document.querySelector(".input").addEventListener("input", function (e) {
      textUpdate();
    });

    // Switch to Edit Mode
    document.querySelector(".input").addEventListener("click", function (e) {
      document.querySelector(".input").classList.add("active");
      document.querySelector(".renderedtext").classList.remove("active");
    });

    // Switch to Edit Mode
    document.querySelector(".tint").addEventListener("click", function (e) {
      document.querySelector(".input").classList.add("active");
      document.querySelector(".renderedtext").classList.remove("active");

      // unblur .input
      document.querySelector(".input").focus();

      // set the caret to the end of the input
      var range = document.createRange();
      var sel = window.getSelection();
      range.setStart(document.querySelector(".input").childNodes[0], 1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    });

    // Switch to Render Mode
    document.querySelector(".input").addEventListener("blur", function (e) {
      document.querySelector(".input").classList.remove("active");
      document.querySelector(".renderedtext").classList.add("active");

      // Autosave
      saveSticker("temp");

      // Render Text
      renderText();
    });
    // #endregion

    // #region Saving/Loading
    // Type in Save Name
    document
      .getElementById("save_name")
      .addEventListener("input", function (e) {
        updateSaveName();
      });

    // Save Button
    document
      .getElementById("savebutton")
      .addEventListener("click", function (e) {
        saveSticker(document.getElementById("save_name").value);

        updateSaveName();
      });

    // Load Button
    document
      .getElementById("loadbutton")
      .addEventListener("click", function (e) {
        loadSticker(document.getElementById("save_name").value);

        updateSaveName();
      });

    // Autocomplete Save Name
    autocomplete(
      document.getElementById("save_name"),
      Object.keys(localStorage)
        .filter(function (key) {
          return key.startsWith("Sticker:");
        })
        .map(function (key) {
          return key.slice(8);
        }),
      (input) => {
        // set save_name to input
        save_name = input;

        updateSaveName();

        // load sticker
        loadSticker(save_name);
        renderText();
      }
    );

    // Delete Button
    document
      .getElementById("deletebutton")
      .addEventListener("click", function (e) {
        // ask if the user wants to delete the sticker
        if (
          !confirm(
            'Are you sure you want to delete "' +
              document.getElementById("save_name").value +
              '"?'
          )
        ) {
          return;
        }

        deleteSticker(document.getElementById("save_name").value);
        displayMessage(
          translate("--del_pre--") + save_name + translate("--del_post--"),
          "delete"
        );

        updateSaveName();
      });

    // Autosave
    setInterval(function () {
      saveSticker("temp");
    }, 30000);
    // #endregion

    // #region Export
    // Download image
    document
      .getElementById("downloadbutton")
      .addEventListener("click", function () {
        downloadSticker();
      });

    // share image
    document
      .getElementById("sharebutton")
      .addEventListener("click", function () {
        // add render class to #downloadThis
        shareSticker();
      });
    // #endregion

    // #region Language
    // when #languagebutton is clicked
    document
      .getElementById("languagebutton")
      .addEventListener("click", function (e) {
        // open #languagemenu
        document.getElementById("languagemenu").classList.toggle("open");
      });

    // when an a with class lan is clicked
    document.querySelectorAll(".lan").forEach(function (element) {
      element.addEventListener("click", function (e) {
        // set the language to the value of the input
        language = element.id;

        // save the language to localStorage
        localStorage.setItem("language", language);

        // temp save
        saveSticker("temp");

        // reload the page
        location.reload();

        // set the languagebutton title to the value of the input
        document.getElementById("languagebutton").title = element.title;

        // close #languagemenu
        document.getElementById("languagemenu").classList.toggle("open");

        displayMessage(
          translate("--lan_pre--") + element.title + translate("--lan_post--"),
          "language"
        );
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
    document.body.classList.add("portrait");
  } else {
    document.body.classList.remove("portrait");
  }

  // set awkward bool if screen is wider than 3/5 of the height
  var awkward = window.innerWidth > (window.innerHeight / 5) * 3;
  if (awkward) {
    document.body.classList.add("awkward");
  } else {
    document.body.classList.remove("awkward");
  }

  if (mobile && !portrait && !awkward) {
    // set body font-size to 1.5vw
    document.body.style.fontSize = "1.5vw";
  } else {
    // set body font-size to unset
    document.body.style.fontSize = "";
  }

  if (mobile && portrait && !awkward) {
    stickerScale =
      Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9) /
      scale_factor;
    // adjust .stickerdemo to be the max of 90% of width of the screen or 90% of height of the screen
    document.querySelector(".stickerdemo").style.transform =
      "scale(" + stickerScale + ")";

    // Scale #title > .logo according to the scale of .stickerdemo
    document.querySelector("#title > .logo").style.transform =
      "scale(" + 2 * stickerScale + ")";
  } else {
    stickerScale =
      Math.min(window.innerWidth / 2, window.innerHeight / 2) / scale_factor;
    // adjust .stickerdemo to be the max of 50% of the width of the screen or 50% of the height of the screen
    document.querySelector(".stickerdemo").style.transform =
      "scale(" + stickerScale + ")";

    // Scale #title > .logo according to the scale of .stickerdemo
    document.querySelector("#title > .logo").style.transform =
      "scale(" + 2 * stickerScale + ")";
  }
}

// #region Utilities
/** Shows a pop-up to the User
 * @param {string} message - The message to show
 * @param {string} icon - The icon to show
 */
function displayMessage(message, icon = "") {
  if (icon != "") {
    icon = '<i class="material-icons">' + icon + "</i>";
  }
  document.getElementById("messageboard").innerHTML = icon + translate(message);
  document.getElementById("messageboard").classList.remove("hidden");

  // set timer to hide #messageboard
  setTimeout(function () {
    document.getElementById("messageboard").classList.add("hidden");
  }, 3000);
}

/** Resets the sticker to its original form by reloading the page and deleting the 'temp' save */
function newSticker() {
  document.getElementById("save_name").value = "";
  updateSaveName();

  //delete temp
  localStorage.removeItem("temp");

  // reload page
  location.reload();
}

/** See https://www.w3schools.com/howto/howto_js_autocomplete.asp */
function autocomplete(inp, arr, onselect = () => {}) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
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
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
          console.log(inp.value);
          onselect(inp.value);
          closeAllLists();
        });

        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
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
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
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

// #region Settings
/** Change the format of the sticker
 * @param {string} format - The format to change to ("square", "sticker", "story")
 */
function setFormat(format) {
  switch (format) {
    case "Square":
      // change .stickerdemo width and height to 28em
      document.querySelector(".stickerdemo").style.width = "28em";
      document.querySelector(".stickerdemo").style.height = "28em";
      expFormat = [1790, 1790];
      max_ll = 25;
      max_ll_text = 40;
      max_lines = 10;
      break;
    case "Sticker":
      // change .stickerdemo width to 20em and height to 30em
      document.querySelector(".stickerdemo").style.width = "20em";
      document.querySelector(".stickerdemo").style.height = "30em";
      expFormat = [1280, 1920];
      max_ll = 15;
      max_ll_text = 20;
      max_lines = 10;
      break;
    case "Story":
      // change .stickerdemo width to 20em and height to 40em
      document.querySelector(".stickerdemo").style.width = 0.25 * 1080 + "px";
      document.querySelector(".stickerdemo").style.height = 0.25 * 1920 + "px";
      expFormat = [1080, 1920];
      max_ll = 10;
      max_ll_text = 20;
      max_lines = 15;
      break;
  }

  renderText();
  adjustOnResize();
}

/** Changes the logo style (Variables in sds-style.css)
 * @param {string} style - The style to change to ("Classic", "White", "Black")
 */
function setLogoStyle(style) {
  switch (style) {
    case "Classic":
      document.documentElement.style.setProperty("--sds-logo-color", "#000");
      document.documentElement.style.setProperty(
        "--sds-logo-color-middle",
        "#b1003a"
      );
      break;
    case "White":
      document.documentElement.style.setProperty("--sds-logo-color", "#fff");
      document.documentElement.style.setProperty(
        "--sds-logo-color-middle",
        "#fff"
      );
      break;
    case "Black":
      document.documentElement.style.setProperty("--sds-logo-color", "#000");
      document.documentElement.style.setProperty(
        "--sds-logo-color-middle",
        "#000"
      );
      break;
  }
}

/** Changes the corner in which the logo is placed
 * @param {string} corner - The corner to change to ("Top Left", "Top Right", "Bottom Left", "Bottom Right")
 */
function setLogoCorner(corner) {
  logoEl = document.getElementsByClassName("logo")[1];
  switch (corner) {
    case "Top Left":
      logoEl.style.top = "0";
      logoEl.style.left = "0";
      logoEl.style.bottom = "auto";
      logoEl.style.right = "auto";
      break;
    case "Top Right":
      logoEl.style.top = "0";
      logoEl.style.left = "auto";
      logoEl.style.bottom = "auto";
      logoEl.style.right = "0";
      break;
    case "Bottom Left":
      logoEl.style.top = "auto";
      logoEl.style.left = "0";
      logoEl.style.bottom = "0";
      logoEl.style.right = "auto";
      break;
    case "Bottom Right":
      logoEl.style.top = "auto";
      logoEl.style.left = "auto";
      logoEl.style.bottom = "0";
      logoEl.style.right = "0";
      break;
    case "Bottom Center":
      logoEl.style.top = "auto";
      logoEl.style.left = "calc(50% - 2.5em)";
      logoEl.style.bottom = "0";
      logoEl.style.right = "auto";
      break;
  }
}
// #endregion

// #region Tint
/** Make the opacity percentage appear and set a timer to make it disappear again */
function unhidePercentage() {
  // unhide #opacitypercentage
  document.getElementById("opacitypercentage").style.opacity = 1;

  // set timer to hide #opacitypercentage
  var timer = setTimeout(function () {
    document.getElementById("opacitypercentage").style.opacity = 0;
  }, 2000);
}
// #endregion

// #region Text
/** Scales .input and .renderedtext if the line overflows */
function textUpdate() {
  var em = parseFloat(getComputedStyle(document.documentElement).fontSize);
  max_width = 0;
  var words = document
    .querySelector(".input")
    .innerHTML.replace(/^\s+|\s+$/g, "")
    .split(/<br>| /);
  for (var i = 0; i < words.length; i++) {
    // create a div with the text and append it to the body
    var div = document.createElement("div");
    div.innerHTML = words[i].replace(regex_cmd, "");
    div.classList.add("input");
    div.style.position = "absolute";
    document.body.appendChild(div);

    max_width = Math.max(max_width, div.offsetWidth);
    document.body.removeChild(div);
  }

  if (
    max_width / 2 >
    document.querySelector(".backgroundimage").offsetWidth - 5 * em
  ) {
    var scale =
      (document.querySelector(".backgroundimage").offsetWidth - 5 * em) /
      max_width;
    document.querySelector(".input").style.transform = "scale(" + scale + ")";
    document.querySelector(".renderedtext").style.transform =
      "scale(" + scale + ")";

    // scale width of .renderedtext up
    document.querySelector(".renderedtext").style.width =
      "calc((200% - 4em) * " + 0.5 / scale + ")";
  } else {
    document.querySelector(".input").style.transform = "scale(0.5)";
    document.querySelector(".renderedtext").style.transform = "scale(0.5)";
  }

  // when input (without whitespaces) is empty set the content of .input to an invisible character
  if (document.querySelector(".input").textContent.replace(/\s/g, "") == "") {
    document.querySelector(".input").textContent = "\u200B";

    // set the caret to the end of the input
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(document.querySelector(".input").childNodes[0], 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  //when input is letter + u200B move the u200B to the start of the input
  if (document.querySelector(".input").textContent[1] == "\u200B") {
    document.querySelector(".input").textContent =
      "\u200B" + document.querySelector(".input").textContent[0];

    // set the caret to the end of the input
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(document.querySelector(".input").childNodes[0], 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

/**
 * Splits the text into lines and adds them to the .renderedtext element.
 * Passes every line to the handleCommand function and sets the style of the line accordingly.
 */
function renderText() {
  var lastRendered = -1;
  // for every line in .input (remove the preceding and trailing whitespace)
  var lines = document
    .querySelector(".input")
    .innerHTML.replace(/^\s+|\s+$/g, "")
    .split("<br>");
  var renderedText = "";
  var l = 0;
  var la = "";

  for (var i = 0; i < lines.length && i <= max_lines; i++) {
    // if .input only contains u200B
    if (lines[i].replace(/\s/g, "") == "\u200B") {
      // set .renderedtext to an empty string
      document.querySelector(".renderedtext").innerHTML = "";
      break;
    }
    // create p for every line

    // if line is empty add a <br>
    if (lines[i].replace(regex_cmd, "") == "" && l < max_lines) {
      // if line is not the last line add a <br>
      if (i != lines.length - 1) {
        renderedText += "<br>";
        l += 1;
      }
    } else if (l < max_lines) {
      // remove commands %<command> from line
      var rlines = lines[i].replace(regex_cmd, "");
      // if line is too long split it into multiple lines
      if (
        rlines.length >
        (lines[i].search(/\§text\$/) == -1 ? max_ll : max_ll_text)
      ) {
        var words = lines[i].split(" ");
        var line = "";
        for (var j = 0; j < words.length; j++) {
          // if line is too long (actual size) add a <br>
          if (
            (line + words[j].length).replace(regex_cmd, "").length >
            (lines[i].search(/\§text\$/) == -1 ? max_ll : max_ll_text)
          ) {
            [renderedText, la] = insertLine(
              line,
              i,
              renderedText,
              lastRendered,
              la
            );
            lastRendered = i;
            l++;
            line = "";
          }
          line += words[j] + " ";
        }
        [renderedText, la] = insertLine(
          line,
          i,
          renderedText,
          lastRendered,
          la
        );
        lastRendered = i;
        l++;
      } else {
        [renderedText, la] = insertLine(
          lines[i],
          i,
          renderedText,
          lastRendered,
          la
        );
        lastRendered = i;
        l++;
      }
    }
  }

  // set .renderedtext to the rendered text
  document.querySelector(".renderedtext").innerHTML = renderedText;

  // Add a command to the input
  document.querySelectorAll(".addcd").forEach(function (element) {
    // if element is div
    if (element.tagName == "DIV") {
      element.addEventListener("click", function (e) {
        element.classList.add("autocomplete");
        // set innerHTML to text input and select it
        e.target.innerHTML =
          '<input type="text" placeholder="' +
          translate("--cmd--") +
          '" value="">';

        // select the input
        e.target.querySelector("input").focus();

        autocomplete(
          e.target.querySelector("input"),
          command_list,
          function (input) {
            // get l from data-l in the parent
            var l = element.getAttribute("data-l").valueOf();
            addCommandToLine(input, l);

            renderText();
          }
        );

        // when enter is pressed in the input
        e.target
          .querySelector("input")
          .addEventListener("keydown", function (e) {
            if (e.keyCode == 13) {
              // get l from data-l in the parent
              var l = element.getAttribute("data-l").valueOf();
              addCommandToLine(e.target.value, l);

              renderText();
            }
          });

        // when the input is blurred
        e.target.querySelector("input").addEventListener("blur", function (e) {
          // remove autocomplete class after 100ms
          setTimeout(function () {
            element.innerHTML = "+";
            element.classList.remove("autocomplete");
          }, 100);
        });
      });
    }
  });

  // Remove a command from the input
  document
    .querySelectorAll(".commanddisplay:not(.addcd)")
    .forEach(function (element) {
      // if element is div
      if (element.tagName == "DIV") {
        element.addEventListener("click", function (e) {
          // get l from data-l in the parent
          var l = element.getAttribute("data-l").valueOf();
          // get the command from data-c in the parent
          var c = element.getAttribute("data-c").valueOf();
          removeCommandFromLine(c, l);

          renderText();
        });
      }
    });
}

/**
 * Inserts a line into the .renderedtext element.
 * @param {string} line - The line to be inserted.
 * @param {int} l - The current line number.
 * @param {string} renderedText - The current rendered text.
 * @param {int} lastRendered - The last rendered line.
 * @returns {string} renderedText - The rendered text.
 */
function insertLine(line, i, renderedText, lastRendered, lastArgs = "") {
  var l = i + 1;
  var args = "";
  var commands = [];

  if (regex_cmd.test(line) || i != lastRendered) {
    commands = getCommands(line);
    commands = removeDuplicateCommands(commands, i + 1);
    args = handleCommands(commands);
  } else {
    args = lastArgs;
  }
  if (line.replace(regex_cmd, "").length > 0) {
    renderedText +=
      "<p " +
      args +
      ' line="' +
      l +
      '">' +
      line.replace(regex_cmd, "") +
      "</p>";

    if (i != lastRendered) {
      renderedText += createCommandDisplay(line, commands, l);
    }
  }
  return [renderedText, args];
}

/**
 * Creates the command display for a line.
 * @param {string} line - The line besides which the command display should be created.
 * @param {string} commands - The commands to be displayed.
 * @param {int} l - The line number.
 * @returns {string} The command display container as text to be added to renderedText.
 */
function createCommandDisplay(line, commands, l) {
  var commanddisplaycontainer = document.createElement("div");
  commanddisplaycontainer.classList.add("commanddisplaycontainer");
  commanddisplaycontainer.style.top = "calc(" + (l - 1) + " * 1.25 * 1.42em)";

  if (regex_cmd.test(line)) {
    // order commands alphabetically
    commands.sort(function (a, b) {
      return a.localeCompare(b);
    });

    for (var j = 0; j < commands.length; j++) {
      var commanddisplay = document.createElement("div");
      commanddisplay.classList.add("commanddisplay");
      commanddisplay.innerHTML = commandIcon(commands[j]);
      commanddisplay.title =
        translate("--remc_pre--") + commands[j] + translate("--remc_post--");

      // save line number in data-l attribute
      commanddisplay.setAttribute("data-l", l - 1);
      // save command in data-c attribute
      commanddisplay.setAttribute("data-c", commands[j]);

      commanddisplaycontainer.appendChild(commanddisplay);
    }
  }

  // add commanddisplay with .addcd to commanddisplaycontainer
  var addbutton = document.createElement("div");
  addbutton.classList.add("addcd");
  addbutton.classList.add("commanddisplay");
  addbutton.title = translate("--addc--");
  addbutton.innerHTML = "+";
  //save line number in data-l attribute
  addbutton.setAttribute("data-l", l - 1);

  commanddisplaycontainer.appendChild(addbutton);

  return commanddisplaycontainer.outerHTML;
}

/**
 * Removes all (logical) duplicate commands from a line.
 * @param {[string]} commands - The commands to be checked.
 * @param {int} l - The line number.
 * @returns {[string]} commands - The commands without duplicates.
 */
function removeDuplicateCommands(commands, l) {
  var old_commands = commands;
  commands = [];
  // remove duplicates and logical duplicates
  while (old_commands.length > 0) {
    var first = true;
    // add old_commands[0] to commands
    commands.push(old_commands[0]);
    // remove occurence of old_commands[0] from old_commands
    old_commands = old_commands.filter(function (value, index, arr) {
      // when they are the same
      if (
        value == old_commands[0] ||
        // when they are both color commands
        (value.match(
          /(red|green|blue|yellow|orange|purple|pink|black|white|grey|gray|brown|cyan|lime|maroon|navy|olive|teal|violet|transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/
        ) &&
          old_commands[0].match(
            /(red|green|blue|yellow|orange|purple|pink|black|white|grey|gray|brown|cyan|lime|maroon|navy|olive|teal|violet|transparent|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/
          )) ||
        // when they are both align commands
        (value.match(/right|left|center/) &&
          old_commands[0].match(/right|left|center/))
      ) {
        if (!first) {
          removeCommandFromLine(value, l - 1);
          console.log("removed duplicate command " + value + " from line " + l);
        } else {
          first = false;
        }
        return false;
      } else {
        return true;
      }
    });
  }

  return commands;
}

/**
 * Chooses the correct icon for a command.
 * @param {string} command - The command for which the icon should be chosen.
 * @returns {string} The icon as text (or the command if no icon is found).
 */
function commandIcon(command) {
  var pre = '<i class="material-icons" style="font-size: 1.25em;">';
  switch (command) {
    case "text":
      return pre + "text_fields</i>";
    case "center":
      return pre + "format_align_center</i>";
    case "right":
      return pre + "format_align_right</i>";
    case "left":
      return pre + "format_align_left</i>";
    case "small":
      return pre + "compress</i>";
    case "transparent":
      return pre + "blur_on</i>";
    default:
      if (
        command.match(/#[0-9a-fA-F]{6}/) ||
        command.match(/#[0-9a-fA-F]{3}/) ||
        command.match(
          /(red|green|blue|yellow|orange|purple|pink|black|white|grey|gray|brown|cyan|lime|maroon|navy|olive|teal|violet)/
        )
      ) {
        return (
          '<i class="material-icons" style="font-size: 1em; color: ' +
          command +
          ';">lens</i>'
        );
      } else {
        return command;
      }
  }
}

/**
 * Adds a command to the line.
 * @param {string} command - The command to be added.
 * @param {int} line - The line number to which the command should be added.
 */
function addCommandToLine(command, line) {
  var lines = document
    .querySelector(".input")
    .innerHTML.replace(/^\s+|\s+$/g, "")
    .split("<br>");

  if (line != 0) {
    lines[line] = "§" + command + "$" + lines[line];
  } else {
    lines[line] = lines[line][0] + "§" + command + "$" + lines[line].slice(1);
  }

  document.querySelector(".input").innerHTML = lines.join("<br>");
}

/**
 * Removes a command from the line.
 * @param {string} command - The command to be removed.
 * @param {int} line - The line number from which the command should be removed.
 */
function removeCommandFromLine(command, line) {
  var lines = document
    .querySelector(".input")
    .innerHTML.replace(/^\s+|\s+$/g, "")
    .split("<br>");

  lines[line] = lines[line].replace("§" + command + "$", "");

  document.querySelector(".input").innerHTML = lines.join("<br>");
}

/**
 * Extracts the commands from a line.
 * @param {string} line - The line from which the commands should be extracted.
 * @returns {array} The commands in an array.
 */
function getCommands(line) {
  // get all commands
  var r_commands = line.match(regex_cmd);
  if (r_commands == null) {
    return [];
  }
  var commands = [];

  // split at command_seperator, remove empty strings and put the commands in an array
  for (var i = 0; i < r_commands.length; i++) {
    if (r_commands[i].length > 0) {
      if (r_commands[i].search(command_seperator) != -1) {
        commands = commands.concat(
          r_commands[i].slice(1, -1).split(command_seperator)
        );
      } else {
        commands.push(r_commands[i].slice(1, -1));
      }
    }
  }

  return commands;
}

/** Handles the commands in the line and returns the arguments for the p element */
function handleCommands(commands) {
  var args = "";
  var style = "";

  // handle commands
  for (var k = 0; k < commands.length; k++) {
    // remove last and first character
    var cmd = commands[k];
    // if command is #<hex color> set background color to <hex color> or if command is a color name set background color to the color name
    if (
      cmd.match(/#[0-9a-fA-F]{6}/) ||
      cmd.match(/#[0-9a-fA-F]{3}/) ||
      cmd.match(
        /(red|green|blue|yellow|orange|purple|pink|black|white|grey|gray|brown|cyan|lime|maroon|navy|olive|teal|violet)/
      )
    ) {
      if (cmd.match(/#[0-9a-fA-F]{6}/) || cmd.match(/#[0-9a-fA-F]{3}/)) {
        style += "background-color: " + cmd.slice(0) + ";";
      } else {
        style += "background-color: " + cmd + ";";
      }

      // if color is lighter than 50% set text color to black
      if (
        (cmd.match(/#[0-9a-fA-F]{6}/) &&
          parseInt(cmd.slice(1, 6), 16) > 0x888888) ||
        (cmd.match(/#[0-9a-fA-F]{3}/) &&
          parseInt(cmd.slice(1, 4), 16) > 0x888) ||
        cmd == "white" ||
        cmd == "grey" ||
        cmd == "gray" ||
        cmd == "cyan" ||
        cmd == "lime" ||
        cmd == "teal" ||
        cmd == "violet" ||
        cmd == "yellow"
      ) {
        style += "color: black;";
      }
    }
    // if command is transparent set background color to transparent
    else if (cmd == "transparent") {
      style += "background-color: transparent;";
    }
    // if command is small set scale to 0.8
    else if (cmd == "small") {
      style += "transform: scale(0.8);";

      // if format is square
      if (document.getElementById("format").value == "Square") {
        //set top and bottom margins to -0.8% (and accord for 1px gap)
        style +=
          "margin-top: calc(-0.8% - 1px); margin-bottom: calc(-0.8% - 1px);";
      } else {
        //set top and bottom margins to -0.8%
        style +=
          "margin-top: calc(-0.8% - 2.5px); margin-bottom: calc(-0.8% - 4.8px);";
      }
    }
    // if command is text set class to text
    else if (cmd == "text") {
      args += 'class = "text"';
    }
    // if command is left set align self to flex-start and transform origin to center left
    else if (cmd == "left") {
      style += "align-self: flex-start;";
      style += "text-align: left;";
      style += "transform-origin: center left;";
    }
    // if command is right set align self to flex-end and transform origin to center right
    else if (cmd == "right") {
      style += "align-self: flex-end;";
      style += "text-align: right;";
      style += "transform-origin: center right;";
    }
    // if command is center set align self to center and transform origin to center center
    else if (cmd == "center") {
      style += "align-self: center;";
      style += "text-align: center;";
      style += "transform-origin: center center;";
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
  reader.onload = function (e) {
    // set background image
    document.querySelector(".backgroundimage").style.backgroundImage =
      "url(" + e.target.result + ")";
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
  if (save_name == "temp") {
    settings = packSettings();

    // save the settings
    localStorage.setItem(save_name, JSON.stringify(settings));
  } else {
    // if save_name is already taken
    if (localStorage.getItem("Sticker:" + save_name) != null) {
      // ask if the user wants to overwrite the sticker
      if (
        !confirm(
          'A sticker with the name "' +
            save_name +
            '" already exists. Do you want to overwrite it?'
        )
      ) {
        return;
      }
    }
    displayMessage(
      translate("--sv_pre--") + save_name + translate("--sv_post--"),
      "save"
    );

    settings = packSettings();

    // save the settings
    localStorage.setItem("Sticker:" + save_name, JSON.stringify(settings));
  }
}

/**
 * Loads the sticker from localStorage ("Sticker:<save_name>").
 * @param {string} save_name - The name of the sticker (if this is 'temp' the sticker will be loaded from autosave).
 */
function loadSticker(save_name) {
  if (save_name == "temp") {
    if (localStorage.getItem(save_name) == null) {
      // if the save_name doesn't exist, do nothing
      return;
    }
    // get the settings from localStorage
    var settings = JSON.parse(localStorage.getItem(save_name));

    unpackSettings(settings);
  } else {
    if (localStorage.getItem("Sticker:" + save_name) == null) {
      // if the save_name doesn't exist, do nothing
      return;
    }
    // Delete autosave
    localStorage.removeItem("temp");

    // get the settings from localStorage
    var settings = JSON.parse(localStorage.getItem("Sticker:" + save_name));

    unpackSettings(settings);

    // load the image from background_path
    displayMessage(
      translate("--ld_pre--") + save_name + translate("--ld_post--"),
      "folder_open"
    );
  }
}

/**
 * Packs all the settings into an object.
 * @returns {object} The settings.
 */
function packSettings() {
  var text = document.querySelector(".input").innerHTML;
  // replace the linebreaks (<br>) with a %lbr% so it can be saved in localstorage
  text = text.replace(/<br>/g, "%lbr%");

  // get the current settings
  return {
    text: text,
    background_image: background_path,
    color_tint: document.getElementById("color_tint").value,
    tintopacity:
      document.querySelector(".tint").style.opacity == ""
        ? 0.5
        : document.querySelector(".tint").style.opacity,
    cityname: document.getElementById("cityname").innerText,
    logo_style: document.getElementById("logo_style").value,
    logo_corner: document.getElementById("logo_corner").value,
    format: document.getElementById("format").value,
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
  text = text.replace(/%lbr%/g, "<br>");
  document.querySelector(".input").innerHTML = text;

  // set the background image
  document.querySelector(".backgroundimage").style.backgroundImage =
    "url(" + settings.background_image + ")";
  background_path = settings.background_image;

  // set the color of .tint
  document.getElementById("color_tint").value = settings.color_tint;
  document.querySelector(".tint").style.backgroundColor = settings.color_tint;

  // set the opacity percentage
  document.querySelector(".tint").style.opacity = settings.tintopacity;
  document.getElementById("opacitypercentage").innerHTML =
    Math.round(settings.tintopacity * 100) + "%";

  // set the city name
  document.getElementById("cityname").innerText = settings.cityname;

  // set the logo style
  document.getElementById("logo_style").value = settings.logo_style;
  setLogoStyle(settings.logo_style);

  document.getElementById("logo_corner").value = settings.logo_corner;
  setLogoCorner(settings.logo_corner);

  document.getElementById("format").value = settings.format;
  setFormat(settings.format);
}

// ! NOT IN USE
function createLink() {
  // get the current settings
  settings = packSettings();

  // create a link with the settings
  var link = "https://politischdekoriert.de/sds-sticker-designer/?";
  for (var key in settings) {
    link += key + "=" + encodeURIComponent(settings[key]) + "&";
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
  localStorage.setItem("save_name", document.getElementById("save_name").value);

  // if the save_name is empty disable #savebutton and #loadbutton
  if (document.getElementById("save_name").value == "") {
    document.getElementById("savebutton").disabled = true;
    document.getElementById("loadbutton").disabled = true;
  } else {
    document.getElementById("savebutton").disabled = false;
    document.getElementById("loadbutton").disabled = false;
  }

  // if the save_name is already used change color of i to red (change title to Overwrite) and unhide loadbutton and deletebutton
  if (
    localStorage.getItem(
      "Sticker:" + document.getElementById("save_name").value
    ) != null
  ) {
    document.getElementById("savebutton").querySelector("i").style.color =
      "red";
    document.getElementById("savebutton").title = translate("--ovwr--");
    document.getElementById("loadbutton").style.display = "flex";
    document.getElementById("deletebutton").style.display = "flex";
  } else {
    document.getElementById("savebutton").querySelector("i").style.color =
      "white";
    document.getElementById("savebutton").title = translate("--sv--");
    document.getElementById("loadbutton").style.display = "none";
    document.getElementById("deletebutton").style.display = "none";
  }
}

/**
 * Deletes save_name from localStorage.
 * Reloads the page using newSticker().
 */
function deleteSticker(save_name) {
  // delete the save from localStorage
  localStorage.removeItem("Sticker:" + save_name);

  newSticker();
}
// #endregion

// #region Export
/** Opens navigation.share in supported browsers and gives it the rendered image as a blob */
function shareSticker() {
  adjustOnResize();

  save_name = document.getElementById("save_name").value;

  const filesArray = [];

  var node = document.getElementById("downloadThis");

  // Cropping context
  let cropper = document.createElement("canvas").getContext("2d");

  html2canvas(node, {
    scale: 4 * (1 / stickerScale) * (2 / window.devicePixelRatio),
  }).then(function (canvas) {
    // Crop Image
    cropper.canvas.width = expFormat[0];
    cropper.canvas.height = expFormat[1];
    cropper.drawImage(canvas, 0, 0);
    // put into filesArray
    fetch(cropper.canvas.toDataURL())
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], save_name + ".png", {
          type: "image/png",
        });
        filesArray.push(file);

        // open share dialog
        if (navigator.share) {
          navigator
            .share({
              title: save_name,
              files: filesArray,
            })
            .catch(console.error);
          displayMessage(translate("--shrng--"), "share");
        }
      });
  });
}

/** Renders the Image and calls saveAs() */
function downloadSticker() {
  adjustOnResize();

  save_name = document.getElementById("save_name").value;

  displayMessage(translate("--dwld--"), "download");

  var node = document.getElementById("downloadThis");

  // Cropping context
  let cropper = document.createElement("canvas").getContext("2d");

  html2canvas(node, {
    scale: 4 * (1 / stickerScale) * (2 / window.devicePixelRatio),
  }).then(function (canvas) {
    // Crop Image
    cropper.canvas.width = expFormat[0];
    cropper.canvas.height = expFormat[1];
    cropper.drawImage(canvas, 0, 0);
    // Save the cropped image
    saveAs(cropper.canvas.toDataURL(), save_name + ".png");
  });
}

/**
 * Saves the rendered image to the users device
 * @param {string} url - Data URL of the image
 * @param {string} filename - Name of the file
 */
function saveAs(url, filename) {
  var link = document.createElement("a");

  if (typeof link.download === "string") {
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
    ihtml = ihtml.replace(new RegExp(key, "g"), languageJSON[language][key]);
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
    string = string.replace(new RegExp(key, "g"), languageJSON[language][key]);
  }

  return string;
}
// #endregion

// #endregion
