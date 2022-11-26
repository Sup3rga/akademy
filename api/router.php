<?php

require_once "self_autoload.php";
require "./vendor/autoload.php";

Ressource::$config = $config;
Ressource::$dataAccess = $system["data_access"][$config["university"] ? "university" : "school"];

define('CONFIG',Ressource::getSysConfig());
Watcher::$timeZone = CONFIG["timezone"];
$medium = Ressource::getSysStrings();
$medium["company.name"] = CONFIG["appName"];
$medium["ui.academic.session.label"] = $medium["ui.session.nomenclature.school"];
$medium["establishment.name"] = CONFIG["establishment_name"];
Ressource::$STRINGS = $medium;
define('STRINGS',Ressource::finalizeStrings($medium));
define('_str', STRINGS);
Ressource::$STRINGS = _str;
SimpleRender::$defaultOptions = _str;

(new Route())
->setDefault("akademy/404.html")
->setTemplateRender(SimpleRender::class)
->onExceptionSet(function(Exception $e){
    \System\Log::printStackTrace($e);
})
->setPublic("css/")
->setPublic("js/", function($res){
    global $config;
    if(preg_match("#^js\/[\\w]+\\.js$#", $res)){
        $res = preg_replace("/^js\/([\\w]+\\.js)$/", "$1", $res);
        if(CheckIf::inArray($res, Ressource::$variableRessource["byConfigType"]["js"])){
            $res = "js/".(CONFIG["university"] ? "university" : "classic_school")."/".$res;
        }
        else{
            $res = "js/".$res;
        }
    }
    return $res;
})
->setPublic("assets/")
->redirect("", "pages/index.html", [
    "title"=> CONFIG["establishment"] . " | Accueil",
    "javascript"=>""
])
->redirect("apply", "pages/index.html",[
    "title"=> CONFIG["establishment"] . " | Admission",
    "javascript"=>"
    <script src='./js/komponent.js'></script>
    <script src='./js/kinput.js'></script>
    <script src='./js/subscribe.js'></script>"
])
->redirect("login", "pages/login.html")
->redirect("test", "pages/calendar.html")
->redirect("demo", "api/draft/demo.php")
->delegate("akademy$", "api/process/akademy.php")
->delegate("public$", "api/process/public.php")
->delegate("signin$", "api/process/login.php")
->delegate("submit$", "api/process/main.php")
->delegate("^ss_[a-zA-Z0-9_.]+$", AkaUi::class, true)
->watch();