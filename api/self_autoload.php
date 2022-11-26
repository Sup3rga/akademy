<?php
require "utils/utils.php";

$system = json_decode(file_get_contents(__DIR__ . "/../config/system.json"), true);

$basePath = $system["autoload_dir"];

$config = json_decode(file_get_contents(__DIR__ . "/../config/config.json"), true);

$default = [
    "index"=> $config["university"] ? "university" : "school"
];

$sys = json_decode(file_get_contents(__DIR__ . "/../config/system.json"), true);

function loadClass($class){
    global $basePath, $sys, $default;
    $class = preg_replace("/\\\/U", "/", $class);
    foreach($basePath as $v){
        $name = $v.$class;
        $file = $name . '.php';
        if($v == "data/"){
            $name = preg_replace("#/#", ".", $name);
            $source = null;
            if(in_array($name, $sys["packages"][$default["index"]])){
                $source = $v . $sys["namespaces"][$default["index"]] . DIRECTORY_SEPARATOR . $class . ".php";
                if(is_file($source)){
                    require_once $source;
                }
            }
        }
        if(is_file($file)){
            require_once $file;
        }
        else if(preg_match("#/#", $class)){
            $name = explode("/", $class);
            $found = false;
            $file = null;
            for($i = 0, $j = count($name); $i < $j - 1; $i++){
                array_shift($name);
                if(is_file($v.implode(DIRECTORY_SEPARATOR, $name).".php")){
                    $file = $v.implode(DIRECTORY_SEPARATOR, $name).".php";
                    $found = true;
                    break;
                }
            }
            if($found){
                if(is_file($name[0].".php")){
                    $file = $name[0].".php";
                }
            }
            if($file != null){
                require_once $file;
            }
        }
    }
}
spl_autoload_register('loadClass');
?>