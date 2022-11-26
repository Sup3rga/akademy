<?php

class Version
{
    private static array $for = [
      "current" => "0.0.0",
      "request" => "0.0.0",
      "user" => "0.0.0",
      "view" => "0.0.0"
    ];
    private static bool $init = false, $upgradable = false, $updatable = true;
    private static int $partBound = 1000;
    private const exceptable = ['system_pref'];

    static function setPartBound(int $newbound){
        self::$partBound = abs($newbound);
    }

    static function setUserQuery(string $version){
        self::$for["user"] = $version;
    }

    static function getUserQuery(){
        return self::$for["user"];
    }

    static function setUserViewQuery(string $version){
        self::$for["view"] = $version;
    }

    static function getUserViewQuery(){
        return self::$for["view"];
    }

    static function init(){
        if(self::$init) return;
        self::$upgradable = false;
        $db = Storage::Connect()->prepare("select metadata from system_pref where id='version'");
        $db->execute();
        self::$for["current"] = $db->fetch()["metadata"];
        $db->closeCursor();
        self::$init = true;
    }

    private static function padding($val){
        $len = strlen((self::$partBound - 1) . "");
        for($i = 0, $j = $len - strlen($val); $i < $j; $i++){
            $val = "0" . $val;
        }
        return $val;
    }

    static function update(){
        if(!self::$init){
            self::init();
        }
        if(!self::$updatable){
            return;
        }
        self::$updatable = false;
        $version = explode('.', self::$for["current"]);
        foreach($version as $i => $j) {
            $version[$i] = (int) $j;
        }
        $version[2]++;
        for($i = count($version) - 1; $i > 0; $i--){
            if($version[$i] > self::$partBound){
                $version[$i] = 0;
                $version[$i - 1]++;
            }
        }
        for($i = 1, $j = count($version); $i < $j; $i++){
            $version[$i] = $version[$i] > 0 ? self::padding($version[$i]) : 0;
        }
        self::$for["request"] = implode(".", $version);
    }

    static function get(){
        self::$upgradable = true;
        if(self::$updatable){
            self::update();
        }
        return self::$for["request"];
    }

    static function getCurrent(){
        self::init();
        return self::$updatable ? self::$for["current"] : self::$for["request"];
    }

    static function upgrade(){
        if(!self::$upgradable) return;
        $db = Storage::Connect()->prepare("update system_pref set metadata=:p1 where id='version'");
        $db->execute(['p1'=>self::$for[self::$updatable ? "current" : "request"]]);
        $db->closeCursor();
    }
}