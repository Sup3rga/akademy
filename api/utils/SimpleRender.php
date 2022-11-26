<?php

class SimpleRender
{
    static array $defaultOptions = [];
    static array $access = [];
    private array $options;
    private string $url;

    private function isAccessible(array $rules){
        $r = count($rules) == 0;
        foreach($rules as $access){
            if(in_array($access, self::$access)){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public function render($template, $options = [], $baseUrl = "./"){
        global $vars;
        $this->options = $options;
        $this->url = $baseUrl;
        $vars = self::$defaultOptions;
        foreach ($options as $k => $v){
            $vars[$k] = $v;
        }
        $template = preg_replace_callback("#\\\${[a-zA-Z.]+}|@(?:\\[((?:[0-9]+(?: ?, ?)?)*)\\])?\\(\"[\s\S]+\"\\)#U", function($e){
            global $vars;
            $e = $e[0];
            $include = preg_match("/@(?:\\[((?:[0-9]+(?: ?, ?)?)*)\\])?\\(\"[\s\S]+\"\\)/", $e);
            $accessNkey = preg_replace("/[$@](?:\\[((?:[0-9]+(?: ?, ?)?)*)\\])?[{(]([a-zA-Z0-9.]+|\"[\s\S]+\")[})]/", "$1||$2", $e);
            $accessNkey = explode("||", $accessNkey);
            $key = $accessNkey[1];
            $access = explode(",",$accessNkey[0]);
            if($access[0] == ""){
                array_shift($access);
            }
            if (!$include && isset($vars[$key])) {
                $e = $this->render($vars[$key], $this->options, $this->url);
            }
            else{
                $e = "";
                if($this->isAccessible($access)) {
                    $key = preg_replace("#^\"|\"$#", "", $key);
                    if (!preg_match("#\.html#i", $key)) {
                        $key .= ".html";
                    }
                    $e = Ressource::readFile($this->url . $key);
                }
            }
            return $e;
        }, $template);

        return $template;
    }
}