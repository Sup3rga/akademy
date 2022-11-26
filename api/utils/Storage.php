<?php
require "db_connect.php";

class Storage{
    private static $db;
    private static $tokens = [];

    public static function getToken(){
        $token = new AkaToken();
        $token->create();
    }

    public static function Connect(){
        try{
            if(self::$db == null) {
                $pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
                self::$db = new PDO('mysql:host=' . HOST . ';dbname=' . DATABASE, USER, PASSWORD,
                    $pdo_options);
            }
        }
        catch(Exception $e){
            \System\Log::printStackTrace($e);
            die;
        }
        return self::$db;
    }

    private static function fetchTokens($override = false){
        if($override && count(self::$tokens) > 0) return self::$tokens;
        self::$tokens = [];
        $db = self::Connect();
        $chk = $db->prepare("select user,token from sessiontrace");
        try{
            $chk->execute();
            while($d = $chk->fetch()){
                self::$tokens[$d["user"]] = $d["token"];
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return self::$tokens;
    }

    public static function updateTokens(){
        self::fetchTokens(true);
    }

    public static function userExists(User $e){
        $r = false;
        $db = self::Connect();
        $chk = $db->prepare("select * from sessiontrace where user=:p1 and token is not NULL");
        try{
            $chk->execute(['p1'=>$e->getId()]);
            if($chk->rowCount()){
                $r = true;
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public static function userIdExists(int $id){
        return isset(self::fetchTokens()[$id]);
    }

    public static function tokenExists(string $token){
        $r = false;
        foreach (self::fetchTokens() as $_token){
            if($token == $_token){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public static function getTokenUser(string $token){
        $usr = null;
        $token = AkaToken::getByToken($token, true);
        if($token){
            $usr = $token->getUser();
        }
        return $usr;
    }

    public static function tokenUserMatch(int $uid, ?AkaToken $token, bool $private = false){
        return $token && $token->getUid() == $uid && $token->isPrivate() == $private;
    }

    public static function addUser(User $e, AkaToken $token, bool $permanent = false){
        $chk = null;
        $db = self::Connect();
        $data = [];
        $online = $e->isOnline();
        $r = false;
//        if(!self::userExists($e)){
        $token
        ->setPrivate(true)
        ->setPermanent($permanent)
        ->setOnline($online)
        ->setUid($e->getId())
        ->update();
        $r =  true;
        \System\Log::println("[ connection ] ".json_encode([
            "user"=>$e->getId(),
            "name"=>$e->getFullName(),
            "token"=> $token->getToken(),
            "ip"=> Ressource::clientIP()
        ]));
        return $r;
    }

    public static function removeUser(User $e, AkaToken $token){
        if(self::userExists($e)){
            if($token->getUid() == $e->getId()){
                $token->delete();
//                $token = AkaToken::getByUser($e->getId(),false);
//                if($token){
//                    $token->delete();
//                }
            }
            return true;
        }
        return false;
    }

    public static function disconnectUser(User $e){
        if(self::userExists($e)){
            $db = self::Connect();
            $token = AkaToken::getByUser($e->getId());
            if($token){
                $token->setOnline(false)->update();
            }
        }
    }

    public static function update(Data $class){
        $name = (new ReflectionObject($class))->getName();
        System\Log::println("[Reflection] ".$name);
        switch ($name){
            case "Faculty":
                Faculty::fetchAll(true);
                Grade::fetchAll(true);
                break;
            case "AcademicYear":
                AcademicYear::fetchAll(true);
                Faculty::fetchAll(true);
                break;
            case "Grade":
                Grade::fetchAll(true);
                Faculty::fetchAll(true);
                break;
            case "Course":
                Course::fetchAll(true);
                Faculty::fetchAll(true);
                Teacher::fetchAll(true);
                break;
            case "Hierarchy":
                Hierarchy::fetchAll(true);
                break;
            case "Notes":
                Notes::fetchAll(true);
                Faculty::fetchAll(true);
                Course::fetchAll(true);
                Student::fetchAll(true);
                break;
            case "Student":
                Student::fetchAll(true);
                Faculty::fetchAll(true);
                break;
            case "Teacher":
                Teacher::fetchAll(true);
                Course::fetchAll(true);
                Hierarchy::fetchAll(true);
                break;
            case "User":
                User::fetchAll(true);
                Hierarchy::fetchAll(true);
                Teacher::fetchAll(true);
                break;
        }
    }
}