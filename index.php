<head>
<meta charset="utf-8" />
<title>Adventure in a Dark Forest</title>
<link rel="shortcut icon" href="/boltlogo.png">
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<link rel="stylesheet" href="style.css">
<!--<script src='https://cdn1.kongregate.com/javascripts/kongregate_api.js'></script>-->

<?php 
foreach (glob("game/*.js") as $filename)
{
    echo '<script type="text/javascript" src='.$filename.'></script>
';
} 
?>
</head>
<body style="margin: 0">
<canvas class="unselectable game" id="background" draggable="false" align="center" width="800" height="600">Your browser does not support canvas. Use Chrome instead.</canvas>
<canvas id='scroll' class='game' width='800' height='600'></canvas>
</body>