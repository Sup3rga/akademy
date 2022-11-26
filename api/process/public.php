<?php
require '_init_.php';

$response = [
    "error" => false,
    "code"=>0,
    "message"=>"Access denied !"
];
if($get = CheckIf::isRequest($_GET, ['pub'])){
    extract($get);
    $response["error"] = false;
    $response["data"] = Ressource::globalData($pub);
    $response["message"] = "Access granted !";
    $response["template"] = Ressource::get($pub, null, true);
}
else if($var = CheckIf::isRequest($_POST, ['sub_chk_pseudo'])){
    extract($var);
    $usr = new User();
    $usr->setPseudo($sub_chk_pseudo);
    $response["error"] = false;
    $response["data"] = [];
    $response["message"] = User::pseudoExists($usr);
}
else if($var = CheckIf::isRequest($_POST, [
    'sub_addr_perm_country','sub_addr_perm_dep', 'sub_addr_perm_street', 'sub_addr_perm_town',
    'sub_lname','sub_fname','sub_phone','sub_birthplace_country','sub_birthplace_dep','sub_birthplace_town',
    'sub_mail','sub_nif','sub_bacc_year','sub_school_country','sub_school_dep','sub_school',
    'sub_parent_lname', 'sub_parent_fname', 'sub_parent_phone','sub_pseudo','sub_password'
])){
    $response["error"] = false;
    $response["message"] = "Request received";
    $response["data"] = [];
}
else{
    RuntimeMessage::closeHttpRequest(Ressource::get());
}

Version::upgrade();
RuntimeMessage::closeHttpRequest($response);