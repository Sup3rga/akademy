<?php
require '_init_.php';

$response = [
    "error" => false,
    "code"=>0,
    "message"=>"Access denied !"
];

//@GET
if($get = CheckIf::isRequest($_GET, ['akatoken', 'akauid'])){
    extract($get);
    $response["message"] = "Violation error !";
    //token verification
    if($akatoken != null && $akauid != null){
        $response["error"] = false;
        try{
            if(Storage::userIdExists($akauid)){
                $akatoken = $_GET['akatoken'];
                $exist = Storage::tokenUserMatch($akauid, AkaToken::getByToken($akatoken,true), true);
                $response["code"] = $exist ? 1 : 2;
                $response["akatoken"] = $akatoken;
                $response["message"] = $exist ? "Ok" : "Expired session ! Please reconnect your account.";
            }
        }catch (Exception $e){
            \System\Log::printStackTrace($e);
            $response["message"] = "invalid request !";
        }
    }
}


//@POST
if($post = CheckIf::isRequest($_POST, ['username', 'passcode'])){
    extract($post);
    $usr = null;
    $ok = true;
    try{
//        \System\Log::println('[User] '.$username." [Pass] ".$passcode);
        $usr  = User::isMatch($username, $passcode);
    }catch(Exception $e){
        $response["message"] = $e->getMessage();
        $ok = false;
    }
    if($ok) {
        $userData = [];
        $response["error"] = false;
        if ($usr != null) {
            try {
                $userData = $usr->data();
                $userData["token"] = (new AkaToken())
                                    ->setPrivate(false)
                                    ->setOnline(true)
                                    ->setUid($usr->getId())
                                    ->update()->getToken();
                $userData["credentials"] = (new AkaToken())
                                    ->setPrivate(true)
                                    ->setOnline(true)
                                    ->setUid($usr->getId())
                                    ->update()->getToken();
            } catch (Exception $e) {
                \System\Log::printStackTrace($e);
            }
        }
        $response["data"] = $userData;
        $response["code"] = $usr == null ? 0 : 1;
        $response["message"] = $usr != null ? "success" : "invalid username or passcode !";
    }
}
else if($post = CheckIf::isRequest($_POST, ['uid', 'disconnect'])){
    extract($post);
    $e = Storage::getTokenUser($disconnect);
    if($e != null && $e->getId() == (int) $uid){
        $err = Storage::removeUser($e,AkaToken::getByToken($disconnect));
        $response["error"] = $err;
        $response["code"] = 0;
        $response["message"] = $err ? "Violation attemption !" : "GoodBye !";
    }
}

Version::upgrade();
RuntimeMessage::closeHttpRequest($response);