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
    <title class="translatetxt">SDS Sticker Designer --by-- PD
    </title>
    <link rel="icon" type="image/x-icon" href="../data/favicon.ico">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="sds-style.css" rel="stylesheet" type="text/css">
</head>

<body class="no-js">
    <script src="../plugins/html2canvas.js"></script>
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
            <input class="translatetit" type="text" id="save_name" value="Sticker" title="--set_name--">
        </div>
        <a class="translatetit" id="savebutton" title="--sv--">
            <i class="material-icons">save</i>
        </a>
        <a class="translatetit" id="loadbutton" title="--ld--">
            <i class="material-icons">folder_open</i>
        </a>
        <a class="translatetit" id="deletebutton" title="--del--">
            <i class="material-icons">delete</i>
        </a>
    </div>
    <div>
        <div class="language">
            <a id="languagebutton" title="--clng--">
                <i class="material-icons">language</i>
            </a>
            <div id="languagemenu" class="hidden">
                <a class="lan" id="en" title="English">EN</a>
                <a class="lan" id="de" title="Deutsch">DE</a>
            </div>
        </div>
    </div>
    <p id="no-js-msg" class="translatetxt">--activate--</p>
    <form action="send-sticker.php" method="post" class="stickerdemo-form">
        <div id="settingsfield">
            <div class="cptag">
                <p class="translatetxt">--tb--
                <p>
                <div class="translatetit cpframe" title="--ctxt--">
                    <input type="color" name="color_text" id="color_text" list="presets" value="#161616">
                </div>
            </div>
            <div class="cptag">
                <p class="translatetxt">--tnt--</p>
                <div class="cpframe translatetit" title="--bgc--">
                    <input type="color" name="color_tint" id="color_tint" list="presets" value="#b1003a">
                </div>
            </div>
            <div class="cptag">
                <p class="translatetxt">--frm--</p>
                <select class="translatetit" name="format" id="format" title="--frmt--">
                    <option class="translatetxt" value="square" selected>--sqr--</option>
                    <option class="translatetxt" value="sticker">--stck--</option>
                </select>
            </div>
            <div class="cptag">
                <p class="translatetxt">--lgs--</p>
                <select class="translatetit" name="logo_style" id="logo_style" title="--stlt--">
                    <option class="translatetxt" value="Classic">--cls--</option>
                    <option class="translatetxt" value="White" selected>--wht--</option>
                    <option class="translatetxt" value="Black">--blk--</option>
                </select>
            </div>
            <div class="cptag">
                <p class="translatetxt">--lgc--</p>
                <select class="translatetit" name="logo_corner" id="logo_corner" title="--cort--">
                    <option class="translatetxt" value="Top Right">--tr--</option>
                    <option class="translatetxt" value="Bottom Right" selected>--br--</option>
                    <option class="translatetxt" value="Top Left">--tl--</option>
                    <option class="translatetxt" value="Bottom Left">--bl--</option>
                </select>
            </div>
            <div class="cptag">
                <p class="translatetxt">--img--</p>
                <input type="file" id="background_image" class="background_image" title="--bgim--" accept="image/*">
            </div>
        </div>
        <datalist id="presets">
            <option class="translatetxt" value="#161616">--blk--</option>
            <option class="translatetxt" value="#ffffff">--wht--</option>
            <option class="translatetxt" value="#2d0a41">--pnk--</option>
            <option class="translatetxt" value="#b1003a">--mgrd--</option>
            <option class="translatetxt" value="#00bba4">--trq--</option>
            <option class="translatetxt" value="#c6d53a">--grn--</option>
        </datalist>

        <div class="stickerdemo translatetit" id="downloadThis" title="--scrollopc--">
            <div class="backgroundimage">
                <div class="tint">
                    <div id="opacitypercentage">50%</div>
                </div>
                <div class="input translatetit" contenteditable="true" onPaste="" onkeydown="" title="--clktxt--">
                    Dein Spruch...</div>
                <div class="renderedtext active">
                    <p>Dein Spruch...</p>
                </div>
                <div class="logo">
                    <div>DIELINKE</div>
                    <div>SDS</div>
                    <div id="cityname translatetit" contenteditable="true" title="--clkct--">Stadt</div>
                </div>
            </div>
        </div>
    </form>
    <div id="downloadfield">
        <a id="downloadbutton" class="button translatetit" title="--dl--">
            <p class="translatetxt">--dl--</p>
            <i class="material-icons">file_download</i>
        </a>
        <a id="sharebutton" class="button translatetit" title="--sr--">
            <i class="material-icons">share</i>
        </a>
    </div>
    <footer>
        <p class="translatetxt">--pb--</p>
        <a href="https://www.politischdekoriert.de/" target="_blank" id="pdlogocontainer">
            <div class="smalllogo">
                <h2 id="p">
                    P
                </h2>
                <h2 id="d">
                    D
                </h2>
            </div>
            <p class="translatetxt">--mb-- Lyx</p>
        </a>
    </footer>

    <script src="sds-main.js"></script>
</body>

</html>