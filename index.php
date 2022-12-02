<?php
// Start the session
session_start();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="maximum-scale=1.0, user-scalable=0">
    </meta>
    <title>SDS Sticker Designer by PD
    </title>
    <link rel="icon" type="image/x-icon" href="../data/favicon.ico">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="sds-style.css" rel="stylesheet" type="text/css">
</head>

<body class="no-js">
    <script src="html2canvas.js"></script>
    <div id="title">
        <div class="logo">
            <div>DIELINKE</div>
            <div>SDS</div>
            <div class="cityname">Stckr Dsgnr</div>
        </div>
    </div>
    <div id="messageboard" class="hidden">
        Debug message
    </div>
    <div>
        <div class="autocomplete">
            <input type="text" id="save_name" value="Sticker" title="--set_name--">
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
    <div>
        <div class="language">
            <a id="languagebutton" title="--clng--">
                <i class="material-icons">language</i>
            </a>
            <div id="languagemenu">
                <a class="lan" id="en" title="English">EN</a>
                <a class="lan" id="de" title="Deutsch">DE</a>
            </div>
        </div>
    </div>
    <a id=bugbutton title="--bug--" href="mailto:support@politischdekoriert.de?subject=Fehler mit der Website&body=Hallo, ich wollte euch auf folgenden Fehler aufmerksam machen:%0D%0A%0D%0A%0D%0A%0D%0ASystem Information:%0D%0A%0D%0A<?php
    $useragent = $_SERVER['HTTP_USER_AGENT'];
    $useragent = str_replace(") ", ")%0D%0A", $useragent);
    echo $useragent; ?>">
        <i class="material-icons">bug_report</i>
    </a>
    <p id="no-js-msg">--activate--</p>
    <form action="send-sticker.php" method="post" class="stickerdemo-form">
        <div id="settingsfield">
            <div class="cptag">
                <p>--tnt--</p>
                <div class="cpframe" title="--bgc--">
                    <input type="color" name="color_tint" id="color_tint" list="presets" value="#b1003a">
                </div>
            </div>
            <div class="cptag">
                <p>--frm--</p>
                <select name="format" id="format" title="--frmt--">
                    <option value="Square" selected>--sqr--</option>
                    <option value="Sticker">--stck--</option>
                    <option value="Story">--stry--</option>
                </select>
            </div>
            <div class="cptag">
                <p>--lgs--</p>
                <select name="logo_style" id="logo_style" title="--stlt--">
                    <option value="Classic">--cls--</option>
                    <option value="White" selected>--wht--</option>
                    <option value="Black">--blk--</option>
                </select>
            </div>
            <div class="cptag">
                <p>--lgc--</p>
                <select name="logo_corner" id="logo_corner" title="--cort--">
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
            </div>
            <div class="cptag">
                <p>--img--</p>
                <input type="file" id="background_image" class="background_image" title="--bgim--" accept="image/*">
            </div>
        </div>
        <datalist id="presets">
            <option value="#161616">--blk--</option>
            <option value="#ffffff">--wht--</option>
            <option value="#2d0a41">--pnk--</option>
            <option value="#b1003a">--mgrd--</option>
            <option value="#00bba4">--trq--</option>
            <option value="#c6d53a">--grn--</option>
        </datalist>

        <div class="stickerdemo" id="downloadThis" title="--scrollopc--">
            <div class="backgroundimage">
                <div class="tint">
                    <div id="opacitypercentage">50%</div>
                </div>
                <div class="input" contenteditable="true" onPaste="" onkeydown="" title="--clktxt--">
                    §command$Dein Spruch...</div>
                <div class="renderedtext active">
                    <p>Dein Spruch...</p>
                </div>
                <div class="logo">
                    <div>DIELINKE</div>
                    <div>SDS</div>
                    <div id="cityname" contenteditable="true" title="--clkct--">Stadt</div>
                </div>
            </div>
        </div>
    </form>
    <div id="downloadfield">
        <a id="downloadbutton" class="button" title="--dl--">
            <p>--dl--</p>
            <i class="material-icons">file_download</i>
        </a>
        <a id="sharebutton" class="button" title="--sr--">
            <i class="material-icons">share</i>
        </a>
    </div>
    <footer>
        <p>--pb--</p>
        <a href="https://www.politischdekoriert.de/" target="_blank" id="pdlogocontainer">
            <div class="smalllogo">
                <h2 id="p">
                    P
                </h2>
                <h2 id="d">
                    D
                </h2>
            </div>
            <p>--mb-- Lyx</p>
        </a>
    </footer>

    <script src="sds-main.js"></script>
</body>

</html>