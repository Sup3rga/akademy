<?php
require '_init_.php';

if(Ressource::getSysConfig()["university"]){
    require_once "University/main.php";
}
else{
    require_once "School/main.php";
}
Version::upgrade();
RuntimeMessage::closeHttpRequest($result);