<?php
// Start the session
session_start();

// add session id to sessions.txt
if ($_SERVER['REMOTE_ADDR'] != 'localhost') {
    $file = fopen("sessions.txt", "a");
    // new line
    fwrite($file, "\r\n");
    fwrite($file, date("Y-m-d H:i:s") . ": " . session_id());
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="maximum-scale=1.0, user-scalable=0">
    </meta>
    <title>SDS Sticker Designer
    </title>
    <link rel="icon" type="image/x-icon" href="../data/favicon.ico">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="sds-style.css" rel="stylesheet" type="text/css">
</head>

<body class="no-js">
    <script src="html2canvas.js"></script>
    <div id="title">
        <div class="logo">
            <div>D I E L I N K E</div>
            <div>S D S</div>
            <div class="cityname">S t c k r D s g n r</div>
        </div>
    </div>
    <!-- Message -->
    <div id="messageboard" class="shadow-button unresponsive hidden">
        Debug message
    </div>
    <!-- Save Name Input -->
    <div id="savefield" class="shadow-button unresponsive">
        <div class="autocomplete">
            <input autocomplete="off" type="text" id="save_name" title="--set_name--">
        </div>
        <a id="savebutton" title="--sv--">
            <i class="material-icons">save</i>
        </a>
        <a id="loadbutton" title="--ld--">
            <i class="material-icons">folder_open</i>
        </a>
        <a id="deletebutton" title="--del--">
            <i class="material-icons">delete</i>
        </a>
    </div>
    <!-- Language Selection -->
    <div class="language">
        <a id="languagebutton" title="--clng--" class="shadow-button">
            <i class="material-icons">language</i>
        </a>
        <div id="languagemenu">
            <a class="lan shadow-button" id="en" title="English">EN</a>
            <a class="lan shadow-button" id="de" title="Deutsch">DE</a>
            <a class="lan shadow-button" id="fr" title="Français">FR</a>
            <a class="lan shadow-button" id="tr" title="Türkçe">TR</a>
            <a class="lan shadow-button" id="ru" title="Русский">RU</a>
            <a class="lan shadow-button" id="c" title="Kommunismus">C</a>
        </div>
    </div>
    <!-- Bug Button -->
    <a id=bugbutton title="--bug--" href="mailto:support@politischdekoriert.de?subject=Fehler mit der Website&body=Hallo, ich wollte euch auf folgenden Fehler aufmerksam machen:%0D%0A%0D%0A%0D%0A%0D%0ASystem Information:%0D%0A%0D%0A<?php
    $useragent = $_SERVER['HTTP_USER_AGENT'];
    $useragent = str_replace(") ", ")%0D%0A", $useragent);
    echo $useragent; ?>">
        <i class="material-icons">bug_report</i>
    </a>
    <!-- NO JS -->
    <p id="no-js-msg">Please activate scripts to create a sticker</p>
    <!-- Sticker Form -->
    <form action="send-sticker.php" method="post" class="stickerdemo-form">
        <!-- Settings -->
        <div id="settingsfield">
            <div id="imtint">
                <!-- Tint -->
                <div class="cptag">
                    <p>--tnt--</p>
                    <label class="cpframe shadow-button" title="--bgc--" for="color_tint">
                        <input type="color" name="color_tint" id="color_tint" list="presets" value="#b1003a">
                        <div class="material-icons">colorize</div>
                    </label>
                </div>
                <!-- Background image -->
                <div class="cptag">
                    <p>--img--</p>
                    <label class="custom-file-upload shadow-button">
                        <i class="material-icons">file_upload</i>
                        <input type="file" id="background_image" class="background_image" title="--bgim--"
                            accept="image/*">
                    </label>
                </div>
            </div>
            <!-- Effect -->
            <div class="cptag">
                <p>--eff--</p>
                <select name="effect" id="effect" title="--eff--" class="shadow-button">
                    <option value="" selected>--non--</option>
                    <option value="blur(0.2em)">--blu--</option>
                    <option value="grayscale(100%) saturate(3)">--twc--</option>
                </select>
                <div class="material-icons">arrow_drop_down</div>
            </div>
            <!-- Format -->
            <div class="cptag">
                <p>--frm--</p>
                <select name="format" id="format" title="--frmt--" class="shadow-button">
                    <option value="Square" selected>--sqr--</option>
                    <option value="Sticker">--stck--</option>
                    <option value="Story">--stry--</option>
                </select>
                <div class="material-icons">arrow_drop_down</div>
            </div>
            <!-- Logo Style -->
            <div class="cptag">
                <p>--lgs--</p>
                <select name="logo_style" id="logo_style" title="--stlt--" class="shadow-button">
                    <option value="Classic">--cls--</option>
                    <option value="White" selected>--wht--</option>
                    <option value="Black">--blk--</option>
                </select>
                <div class="material-icons">arrow_drop_down</div>
            </div>
            <!-- Logo Corner -->
            <div class="cptag">
                <p>--lgc--</p>
                <select name="logo_corner" id="logo_corner" title="--cort--" class="shadow-button">
                    <optgroup label="--t--">
                        <option value="Top Left">--tl--</option>
                        <option value="Top Right">--tr--</option>
                    </optgroup>
                    <optgroup label="--b--">
                        <option value="Bottom Left">--bl--</option>
                        <option value="Bottom Center">--bc--</option>
                        <option value="Bottom Right" selected>--br--</option>
                    </optgroup>
                </select>
                <div class="material-icons">arrow_drop_down</div>
            </div>
        </div>
        <!-- Color Presets -->
        <datalist id="presets">
            <option value="#161616">--blk--</option>
            <option value="#ffffff">--wht--</option>
            <option value="#2d0a41">--pnk--</option>
            <option value="#b1003a">--mgrd--</option>
            <option value="#00bba4">--trq--</option>
            <option value="#c6d53a">--grn--</option>
        </datalist>
        <!-- Sticker -->
        <div class="stickerdemo" id="downloadThis" title="--scrollopc--">
            <div class="backgroundimage">
                <div class="effect"></div>
                <div class="tint">
                    <div id="opacitypercentage">50%</div>
                </div>
                <div class="input" contenteditable="<?php
                // use plaintext-only if available in this browser
                if (strpos($_SERVER['HTTP_USER_AGENT'], 'Firefox') !== false) {
                    echo "true";
                } else {
                    echo "plaintext-only";
                }
                ?>" onPaste="" onkeydown="" title="--clktxt--">
                </div>
                <div class="renderedtext active"></div>
                <div class="logo">
                    <div>D I E L I N K E</div>
                    <div>S D S</div>
                    <div id="cityname" contenteditable="true" title="--clkct--" style="max-lines: 1;">--ct--</div>
                </div>
            </div>
        </div>
    </form>
    <!-- Export -->
    <div id="downloadfield">
        <!-- Download -->
        <a id="downloadbutton" class="button shadow-button" title="--dl--">
            <p>--dl--</p>
            <i class="material-icons">file_download</i>
        </a>
        <!-- Share -->
        <a id="sharebutton" class="button shadow-button" title="--sr--">
            <i class="material-icons">share</i>
        </a>
    </div>
    <script src="sds-main.js"></script>
</body>

</html>