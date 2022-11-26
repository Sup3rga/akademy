<?php

class Route
{
    public static bool $devlopmentMode = true;
    public static string $rootFolder = "/akademy/";
    public static string $root = "../../";
    private ?string $default = null;
    private ?array $options = null;
    private $errorCatcher = null;
    private array $stat = [
        "request"=>0,
        "match"=>0,
        "response"=>0
    ];
    private $templateRender = null;
    private string $url = "";

    private function getArgs(){
        $r = [];
        $args = explode("&", $_SERVER["QUERY_STRING"]);
        foreach($args as $v){
            $i = preg_replace("/^ *(.+?) *= *(.+?)$/", "$1", $v);
            $j = preg_replace("/^ *(.+?) *= *(.+?) *$/", "$2", $v);
            if(strlen($i) && strlen($j)){
                $r[$i] = $j;
            }
        }
        return $r;
    }

    public function getUrl(){
        return $this->url;
    }

    public function render($content,$options, $url = ""){
        if($this->templateRender && is_array($options)){
            return (new $this->templateRender())->render($content, $options, $url);
        }
        else{
            return $content;
        }
    }

    public function onExceptionSet(callable $callback){
        $this->errorCatcher = $callback;
        return $this;
    }

    private function match(array $args, array $list){
        $r = true;
        foreach ($list as $v){
            if(!isset($args[$v])){
                $r = false;
                break;
            }
        }
        return $r;
    }

    public static function getMimeType(string $file){
        $r = "text/plain";
        if(preg_match("/\.css$/", $file)){
            $r = "text/css";
        }
        else if(preg_match("/\.js$/", $file)){
            $r = "text/x-javascript";
        }
        else if(is_file($file)){
            $r = mime_content_type($file);
        }
        return $r.";utf-8";
    }

    public static function autoSetMimeType(string $file){
        $mime = self::getMimeType($file);
        header("Content-Type: ".$mime);
    }

    private function readFile(string $file){
        $content = "";
        if(is_file($file)){
            readfile($file);
        }
        else if($this->default != null){
            header("Content-Type: text/html");
            readfile(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$this->default);
        }
        return $content;
    }

    public function setDefault($file){
        $this->default = $file;
        return $this;
    }

    public function setTemplateRender($template){
        $this->templateRender = $template;
        return $this;
    }

    public function setPublic(string $directory, $callback = null){
        $directory = preg_replace("#^ *\\\^|/ *|\$$#", "", $directory);
        global $call;
        $call = $callback;
        $this->get("^".$directory."/*", null, function($res){
           global $call;
           $mime = self::getMimeType(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$res);
           header("Content-Type: ".$mime);
           if($call != null){
               $res = $call($res);
           }
           $this->readFile(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$res);
        });
        return $this;
    }

    public function redirect(string $schema, string $url, ?array $options = null){
        $schema = preg_replace("#^ *\\\^|\$#", "", $schema);
        global $path;
        $path = $url;
        $this->options = $options;
        if(is_array($this->options) && $this->options != null) {
            foreach ($this->options as $k => $v) {
                if (is_callable($v)) {
                    $this->options[$k] = $v($this);
                }
            }
        }
        $this->get("^".$schema."$", null, function($res){
            global $path;
            if(preg_match("/\.php$/", $path)){
                require_once __DIR__ . DIRECTORY_SEPARATOR . self::$root . $path;
                die;
            }
            self::autoSetMimeType(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$path);
            $url = __DIR__ . DIRECTORY_SEPARATOR;
//            print_r(['url'=>$url]);
            die($this->render(file_get_contents( $url . self::$root.$path), $this->options));
        });
        return $this;
    }

    public function deliver($file){
        $file = preg_replace("#^ *\\\^|/ *$#", "", $file);
        $file = preg_replace("/(\.|\+|\*|\?|\[|\]|\(|\)|\\\|\|\$)/", "\\\\$1", $file);

        $this->get("^".$file."$", null, function($res){
            self::autoSetMimeType(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$res);
            $this->readFile(__DIR__ . DIRECTORY_SEPARATOR . self::$root.$res);
        });
        return $this;
    }

    private function response(string $res, ?array $args = null, ?callable $e = null){
        $_res = preg_replace("#^".self::$rootFolder."#","",$_SERVER['REDIRECT_URL']);
        /**
         * If Executed on windows environnment
         */
//        if(preg_match("#\\\#",$res)) {
//            $res = preg_replace("#\\\#", "\\/", $res);
//        }
//        $res = preg_replace("#\/#", "\\/", $res);
        $params = $this->getArgs();
        $this->stat["request"]++;
        if(preg_match("#~/#", $_res)){
            $_res = substr(strchr($_res, "~/"), 2);
        }
        $this->url = $_res;
        if (preg_match("#" . $res . "#", $_res)) {
            $this->stat["match"]++;
            if ($args == null || $this->match($params, $args)) {
                $this->stat["response"]++;
                $e($_res, $params);
            }
        }
    }

    private function request(string $res, ?array $args = null, ?callable $e = null){
        $this->res[] = [
            "res"=>$res,
            "args"=>$args,
            "callback"=>$e
        ];
    }

    public function watch(){
        if($this->stat["response"] == 0 && $this->default != null){
            header("Content-Type: text/html");
            try {
                readfile(__DIR__ . DIRECTORY_SEPARATOR . self::$root . $this->default);
            }catch (Exception $e){
                if($this->errorCatcher){
                    $errorCatcher = $this->errorCatcher;
                    $errorCatcher($e);
                }
                else{
                    throw $e;
                }
            }
        }
    }

    public function get(string $res, ?array $args = null, ?callable $e = null){
        if($_SERVER['REQUEST_METHOD'] == 'GET'){
          $this->response($res, $args, $e);
        }
        return $this;
    }

    public function post(string $res, ?array $args = null, ?callable $e = null){
        if($_SERVER['REQUEST_METHOD'] == 'POST'){
            $this->response($res, $args, $e);
        }
        return $this;
    }

    public function delegate(string $res, string$include, bool $controller = false){
        global $url,$_ctl,$class;
        $url = $include;
        $_ctl = $controller;
        $class = $include;
            $this->response($res, null, function () {
                global $_ctl, $class, $url;
                try {
                    if ($_ctl) {
                        (new $class())::main($this);
                    } else {
                        require_once __DIR__ . DIRECTORY_SEPARATOR . self::$root . $url;
                    }
                }catch (Exception $e){
                    if($this->errorCatcher != null){
                        $errorCatcher = $this->errorCatcher;
                        $errorCatcher($e);
                    }
                    else{
                        throw $e;
                    }
                }
                die;
            });
        return $this;
    }
}