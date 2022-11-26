<?php

trait _Cache_{
    public static function cache($filename)
    {
        $r = self::fetchAll();
        foreach ($r as $obj){
            $r[$obj->getId()] = $obj;
        }
        file_put_contents($filename,$r);
    }
}