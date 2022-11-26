<?php

class AkaUi
{
    private static Route $route;
    private static string $ressource;
    private static ?AkaToken $token;
    private static ?User $user = null;
    private static bool $granted = false;

    private static ?array $sideMenuRes = [];

    /**
     * @return Route
     */
    public static function getRoute(){
        return self::$route;
    }

    /**
     * @return AkaToken|null
     */
    public static function getToken(){
        return self::$token;
    }

    /**
     * @return User|null
     */
    public static function getUser(){
        return self::$user;
    }

    /**
     * @return bool
     */
    public static function isGranted(){
        return self::$granted;
    }

    static function extractRessources(?string $ressources = null){
        self::$ressource = $ressources ? $ressources : preg_replace("#^akademy/#","",self::$route->getUrl());
        self::$token = AkaToken::getByToken(self::$ressource);
        if(self::$token){
            self::$granted = self::$token->isSuitable();
        }
        if(self::$granted){
            self::$user = self::$token->getUser();
            SimpleRender::$access = explode(",",self::$user->getPrivileges());
            if(!self::$user){
                self::$granted = false;
            }
        }
    }

    private static function getSideMenu(){
        $htm = "";
        if(count(self::$sideMenuRes)){
            foreach (self::$sideMenuRes as $index => $res){
                if(self::$user->hasPrivilege((int)$res["value"])) {
                    $htm .= '<a href="#' . $index . '" class="ui-container ui-unwrap ui-size-fluid ui-vertical-center item" access="' . $res["value"] . '">
                         <icon class="' . $res["icon"] . '"></icon>
                         <span class="ui-element text">
                            ' . _str[$res["text"]] . '
                          </span>
                       </a>';
                }
            }
        }
        return $htm;
    }

    private static function manageView(){
        $path = __DIR__ . "/" . Route::$root . "akademy/";
        if(self::$granted){
            $indexFile = $path . "index.html";
            self::$sideMenuRes = json_decode(file_get_contents(__DIR__ . "/../../config/sidemenu.json"), true);
            self::$sideMenuRes = self::$sideMenuRes[Ressource::getSysConfig()["university"] ? "University" : "School"];
        }
        else{
            $indexFile = $path . "404.html";
        }
        Route::autoSetMimeType($indexFile);
        $html = file_get_contents($indexFile);
        $options = [];
        $options["sideMenu"] = self::getSideMenu();
        echo self::$route->render($html,$options,$path);
    }

    public static function main(Route $route, ?string $res = null){
        self::$route = $route;
        self::extractRessources();
        self::manageView();
        //@development
        Ressource::setFrontEndStrings();
        //@development
        AkaBundler::create();
    }
}