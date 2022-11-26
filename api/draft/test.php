<?php

global $hello;
global $_HELLO;

function cool(){
    return "bien";
}

function endAll(){
    die("Bonsoir tout le monde !");
}

define('HELLO', cool());

$hello = "Bonsoir !";
$_HELLO = "Bien";