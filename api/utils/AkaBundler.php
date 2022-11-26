<?php

class AkaBundler
{
    static function routeUi(){
        $path = __DIR__ . '/../../js/classic_school/';
        $src = $path . 'routeUI/';
        $filename = $path . 'routeUI.js';
        $bundle = null;
        $bundle = fopen($filename, 'w+');
        chmod($filename, 0777);
        $list = scandir($src);
        array_shift($list);
        array_shift($list);
        sort($list);
        foreach ($list as $file){
            fputs($bundle, file_get_contents(realpath($src.'/'.$file)) );
        }
        fclose($bundle);
    }

    static function create(){
        self::routeUi();
    }
}