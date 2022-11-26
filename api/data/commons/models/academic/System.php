<?php

class System
{
    static function getPreferences(string $name, ?int $academic = null){
        $db = Storage::Connect()->prepare("select metadata from system_pref where id=:p1 and academic=:p2");
        $db->execute(["p1"=>$name, "p2"=>$academic]);
        $r = null;
        if($db->rowCount()){
            $r = $db->fetch()["metadata"];
        }
        $db->closeCursor();
        return $r;
    }

    static function setPreferences(string $name, string $metadata, ?int $academic = null){
        $exist = self::getPreferences($name, $academic) != null;
        $db = null; $r = null;
        $arg = [
            "p1"=>$name,
            "p2"=>$metadata,
            "p3"=>$academic
        ];
        if($exist){
            $db = Storage::Connect()->prepare("update system_pref set metadata=:p2 where id=:p1 and academic=:p3");
        }
        else{
            $db = Storage::Connect()->prepare("insert into system_pref(id,metadata,academic) values(:p1,:p2,:p3)");
        }
        try {
            $db->execute($arg);
        }catch (Exception $e){
            $r = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $r;
    }
}