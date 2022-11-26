<?php
require '_init_.php';

$response = [
    "error" => false,
    "code"=>0,
    "message"=>"Access denied !"
];
if($get = CheckIf::isRequest($_GET, ['res', 'akatoken'])){
    $reqversion = "0.0.0";
    $reqview_version = "0.0.0";
    extract($_GET);
    Version::setUserQuery($reqversion);
    Version::setUserViewQuery($reqview_version);
    $response["error"] = false;
    $response["code"] = 1;
    $response["template"] = Ressource::get($res, $akatoken);
    $response["data"] = Ressource::data();
    $response["message"] = "Access granted !";
}
else{
    $response =  Ressource::get();
}

Version::upgrade();
RuntimeMessage::closeHttpRequest($response);
