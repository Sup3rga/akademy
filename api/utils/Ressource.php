<?php

class Ressource{

    public static $variableRessource = [
        "byConfigType"=>[
            "js"=>["routeUI.js", "utils.js", "subscribe.js"],
            "html"=>[
                "administration.html","anneeAcademique.html","cours.html",
                "dashboard.html","etudiant.html","filiere.html","notes.html",
                "professeur.html","utilisateurs.html","inscription.html"
            ]
        ]
    ];
    public static $dataAccess = [];
    public static $workableDays = [];
    public static $workableHours = [];
    public static $config = [];
    public static $STRINGS = [];
    /**
     * @var User|null
     */
    public static $currentUser = null;

    private static String $basePath = "../";
    private static $privateRessource = [
        "." => ["akademy/index.html", -1],
        "/" => ["akademy/view/dashboard.html", 0],
        "/academic-year" => ["akademy/view/anneeAcademique.html", 1],
        "/student" => ["akademy/view/etudiant.html",2],
        "/course" => ["akademy/view/cours.html",3],
        "/teacher" => ["akademy/view/professeur.html",4],
        "/admin" => ["akademy/view/administration.html",5],
        "/users" => ["akademy/view/utilisateurs.html",6],
        "/notes" => ["akademy/view/notes.html",7]
    ];
    private static $publicRessource = [
        "/"=>["akademy/view/index.html"],
        "/apply"=>["akademy/view/inscription.html"]
    ];
    private static $moduleIndexes = [
        1 => [100,101,102,103,104,
              110
             ],
        2 => [120,130,140,150,160],
        3 => [
              170,171,172,173,174,175,176,177,178,
              180,181,182,
              190,200,210,220
             ],
        4 => [230,240,250,260,270],
        5 => [280,281,282,283,284,285,286,287,
              290,291,292,293,294,295,296,297,298,299,
              300,301,302,303,304,305,
              310,320,330,340,350,360
             ],
        6 => [370,380,390,400],
        7 => [410,420,430],
        8 => [440]
    ];
    private static $uiStrings = [];
    private static $uiMetaData = [];

    private static function fetch($res){
        $e = [];
        switch ($res){
            case "/admin":
                $e["hierarchy"] = Hierarchy::fetchAll(true);
                break;
            case "/academic-year":
                $e["exam_period"] = ExamPeriod::fetchAll();
                break;
            case "/faculty":
                $e["faculty"] = Faculty::fetchAll(true);
                break;
            case "/promotion":
                $e["promotion"] = ClassRoom::fetchAll();
                break;
            case "/room":
                $e["room"] = Room::fetchAll();
                break;
            case "/teacher":
                $e["teacher"] = Teacher::fetchAll(true);
                break;
            case "/student":
                $e["student"] =  Student::fetchAll(true);
                break;
            case "/course":
                $e["course"] = Course::fetchAll(true);
                break;
            case "/notes":
                $e["notes"] = Notes::fetchAll(true);
                break;
            case "/users":
                $e["modules"] = self::$moduleIndexes;
                break;
        }
        return $e;
    }

    public static function data(bool $serialize = true){
        $e = [];
        $access_array = self::$currentUser ? self::$dataAccess[self::$currentUser->getAccountType()] : [];
        foreach ($access_array as $res){
            $e = CheckIf::merge($e, self::fetch($res));
        }
        \System\Log::println("[Res][ay] " . (AcademicYear::$current == null));
        $e["currentYear"] = AcademicYear::$current == null ? null : AcademicYear::$current->getId();
        $e["academic"] = AcademicYear::fetchAll(true);
        $e["dashboard"] = new Summary(AcademicYear::$current);
        if(self::$currentUser->getAccountType() == 'admin') {
            $e["users"] = User::fetchAll();
        }
        $e["serverDateTime"] = Watcher::currentDate();
        $e["workDays"] = self::getWorkableDays();
        $e["workHours"] = self::getWorkableHours();
        $e["weekDays"] = self::$STRINGS["ui.view.weekDays"];
        $e["minAge"] = 0;
        $e["ccc"] = self::getCCC();
        $e["version"] = [
            "view"=> self::getUiMetaData()["version"],
            "data"=>Version::getCurrent()
        ];
        return $serialize ? self::serialize($e) : $e;
    }

    public static function getWorkableDays(){
        $list = System::getPreferences("workdays", AcademicYear::$current->getId());
        if($list){
            $tab = explode(",", $list);
            $days = _str["ui.view.weekDays"];
            foreach ($tab as $index){
                self::$workableDays[$index] = $days[$index];
            }
        }
        return self::$workableDays;
    }

    public static function getWorkableHours(bool $simple = false){
        $r = ["08:00","16:00"];
        if(count(self::$workableHours) == 0) {
            $begin = System::getPreferences("workhour_begin", AcademicYear::$current->getId());
            if ($begin) {
                $r[0] = $begin;
            }
            $end = System::getPreferences("workhour_end", AcademicYear::$current->getId());
            if ($end) {
                $r[1] = $end;
            }
            self::$workableHours = $r;
        }
        else{
            $r = self::$workableHours;
        }
        return $simple ? $r : [
            "start"=>$r[0],
            "finish"=>$r[1]
        ];
    }

    public static function globalData(string $res, bool $serialize = true){
        $e = [];
        \System\Log::println("[ ressource ] ".json_encode([
            "ip"=> Ressource::clientIP(),
            "ressource"=>$res
        ]));
        switch ($res){
            case "/apply":
                $e["local"] = json_decode(self::readFile(__DIR__ . "/../datasets/town_by_department.json"), true);
                $e["schools"] = json_decode(self::readFile(__DIR__ . "/../datasets/schools_by_department.json"), true);
                break;
        }
        return $serialize ? self::serialize($e) : $e;
    }

    public static function stringify(array $val){
        $r = "{";
        foreach ($val as $k => $v){
            if(is_object($v)){
                $v = (string) $v;
            }
            else if(is_array($v)){
                $v = self::stringify($v);
            }
            else if(is_numeric($v) || is_bool($v)){
                $v = is_numeric($v) ? $v : ($v ? "true" : "false");
            }
            else{
                $v = '"'.preg_replace("/\"/",'\\"',$v).'"';
            }
            $r .= (strlen($r) > 1 ? "," : "").(is_numeric($k) ? $k : '"'.$k.'"').":".$v;
        }
        $r .= "}";
        return $r;
    }

    public static function serialize(array $data, bool $toString = false){
        $r = [];
        foreach ($data as $k => $v){
            if(is_array($v)){
                $r[$k] = self::serialize($v);
            }
            else if(is_object($v)){
                $r[$k] = (new ReflectionObject($v))->hasMethod("data") ? self::serialize($v->data()) : (string) $v;
            }
            else{
                $r[$k] = $v;
            }
        }
        return $toString ? json_encode($r) : $r;
    }

    public static function clientIP(){
        $r = "::1";
        if (isset($_SERVER['HTTP_CLIENT_IP'])) {
            $r = $_SERVER['HTTP_CLIENT_IP'];
        }
        // IP derrière un proxy
        elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $r = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }
        // Sinon : IP normale
        else {
            $r = $_SERVER['REMOTE_ADDR'];
        }
        if($r == "::1"){
            $r = "127.0.0.1";
        }
        return $r;
    }

    private static function getCCC(){
        $ac = [];
        $r = 0;
        if(AcademicYear::$current) {
            foreach ([Student::fetchAll(), Teacher::fetchAll()] as $list) {
                foreach ($list as $t) {
                    $last = explode("-", $t->getCode());
                    if ($last[count($last) - 1] == substr(AcademicYear::$current->getAcademie(), 7) || $last[count($last) - 1] == substr(AcademicYear::$current->getAcademie(), 8)) {
                        $ac[] = (int)preg_replace("/^[a-zA-Z]{2,3}-([0-9]{3})-[0-9]{1,2}$/", "$1", $t->getCode());
                    }
                }
            }
        }
        \System\Log::println("getCCC [Total] ".json_encode($ac) . " / " . AcademicYear::$current == null);
        if(count($ac) > 0) {
            sort($ac);
            $max = $ac[0];
            $r = $max;
            foreach($ac as $i) {
                if ($i > $max) {
                    $r = $i;
                    if($i - $max > 2) {
                        break;
                    }
                    $max = $i;
                }
            }
        }
        return $r;
    }

    public static function get(?string $view = null, ?string $token = null, $public = false){
        $r = $public ? self::$publicRessource : self::$privateRessource;
        $res = $r[$view == null ? "." : $view][0];
        $index = $view == null ? -1 : ($public ? -1 : $r[$view][1]);
        if(!$public) {
            if ($token != null && $res != null) {
                AkaUi::extractRessources($token);
                $user = AkaUi::getUser();
                self::$currentUser = $user;
                if ($user != null) {
                    SimpleRender::$access = explode(",", $user->getPrivileges());
                    $access[] = explode(",", $user->getPrivileges());
                    if (!CheckIf::inArray($index, $access)) {
                        $token = null;
                        $view = "";
                    }
                } else {
                    $token = null;
                    $view = "";
                }
            }
        }
        $file = $res == null || ($token == null && $view != null && !$public) ? "akademy/view/error.html" : $res;
        $fileName = preg_replace("#^akademy/view/([\\w]+\\.html)$#", "$1", $file);
        if(strlen($fileName) && CheckIf::inArray($fileName, self::$variableRessource["byConfigType"]["html"])){
            $file = "akademy/view/" . (self::getSysConfig()["university"] ? "university/" : "classic_school/") . $fileName;
        }
        return self::readFile(self::$basePath.$file);
    }

    public static function readFile(string $file){
        $content = "";
        global $url;
        if(is_file($file)){
            $stream = fopen($file, "r");
            while($line = fgets($stream)){
                $content .= $line;
            }
            fclose($stream);
        }
        $url = preg_replace("#/[a-z0-9.]+$#i", "/",$file);
        $content = preg_replace("/\\\\\\\\/","\\",$content);
        return (new SimpleRender())->render($content, [], $url);
    }

    public static function getSysConfig(){
        if(count(self::$config) == 0) {
            self::$config = json_decode(file_get_contents(__DIR__ . "/../../config/config.json"), true);
        }
        return self::$config;
    }

    public static function getUiMetaData(){
        if(count(self::$uiMetaData) == 0){
            self::$uiMetaData = json_decode(file_get_contents(__DIR__ . '/../../akademy/version.json'), true);
        }
        return self::$uiMetaData;
    }

    public static function getSysStrings(){
        if(count(self::$STRINGS) == 0){
            self::$STRINGS = json_decode(file_get_contents(__DIR__ . "/../../config/strings.json"), true);
        }
        return self::$STRINGS;
    }

    public static function finalizeStrings($with = []){
        foreach (self::$STRINGS as $index => $string){
            self::$STRINGS[$index] = (new SimpleRender())->render($string, $with);
        }
        return self::$STRINGS;
    }

    public static function getUiStrings(){
        if(count(self::$uiStrings) == 0){
            foreach (self::getSysStrings() as $key => $string){
                if(preg_match("/^ui\./", $key)){
                    self::$uiStrings[$key] = $string;
                }
            }
        }
        return self::$uiStrings;
    }

    static function setFrontEndStrings(){
        $strings = [];
        foreach (self::getUiStrings() as $index => $string){
            if(preg_match("/^ui\\.view/", $index)){
                $strings[preg_replace("/^ui\\.view\\./", "", $index)] =  $string;
            }
        }
        $f = fopen(__DIR__ . "/../../js/akauistrings.js", "w+");
        $js = "if(!('RouteUI' in window)){ RouteUI = {}; }\nRouteUI.strings = ".json_encode($strings, JSON_UNESCAPED_UNICODE).";";
        fwrite($f, $js);
        fclose($f);
    }

    public static function resultSuccess(string $message = "success"){
        $result = [];
        $result["message"] = preg_match("/^[a-zA-Z.]+$/", $message) ? _str[$message] : $message;
        $result["error"] = false;
        $result["code"] = 1;
        try {
            $result["data"] = self::data();
        }catch (Exception $e){
            $result["data"] = [];
            \System\Log::printStackTrace($e);
        }
        return $result;
    }
}