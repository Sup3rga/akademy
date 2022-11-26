<?php


class AkaToken
{
    private ?string $token = null;
    private bool $private = false;
    private bool $permanent = false;
    private bool $online = false;
    private int $uid;
    private int $id;
    private string $ip;
    private ?string $last_seen = null;
    private bool $created = false;
    public static array $list = [
        "public"=>[],
        "private"=>[]
    ];

    /**
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @return bool
     */
    public function isPrivate()
    {
        return $this->private;
    }

    /**
     * @param bool $private
     */
    public function setPrivate(bool $private)
    {
        $this->private = $private;
        return $this;
    }

    /**
     * @return bool
     */
    public function isPermanent()
    {
        return $this->permanent;
    }

    /**
     * @param bool $permanent
     */
    public function setPermanent(bool $permanent)
    {
        $this->permanent = $permanent;
        return $this;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getIp()
    {
        return $this->ip;
    }

    /**
     * @param string $ip
     */
    public function setIp(string $ip)
    {
        $this->ip = $ip;
        return $this;
    }

    /**
     * @return bool
     */
    public function isOnline()
    {
        return $this->online;
    }

    /**
     * @param bool $online
     */
    public function setOnline(bool $online)
    {
        $this->online = $online;
        return $this;
    }

    /**
     * @return string
     */
    public function getLastSeen(): string
    {
        return $this->last_seen;
    }

    /**
     * @return bool
     */
    public function isCreated()
    {
        return $this->created;
    }

    /**
     * @return int
     */
    public function getUid()
    {
        return $this->uid;
    }

    public function getUser(){
        $usr = null;
        if($this->uid){
            $usr = User::getById($this->uid);
        }
        return $usr;
    }

    /**
     * @param int $uid
     */
    public function setUid(int $uid)
    {
        $this->uid = $uid;
        return $this;
    }

    private function hydrate(array $data){
        $this->id = $data['id'];
        $this->token = $data['token'];
        $this->uid = $data['user'];
        $this->private = $data['private'];
        $this->permanent = $data['permanent'];
        $this->last_seen = $data['last_seen'];
        $this->created = true;
        return $this;
    }

    private function equals(AkaToken $token, bool $strict = false){
        $r = $this->token == $token->getToken();
        if($strict){
            $r = $r && $this->uid = $token->getUid();
        }
        return $r;
    }

    public static function toHexaDecimal(int $number, int $padding = -1){
        $r = "";
        $val = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
        do{
            $r = $val[$number % 16] . $r;
            $number = floor($number / 16);
        }while($number > 15);
        if($number > 0) {
            $r = $val[$number] . $r;
        }
        if($padding > 0){
            for($i = 0, $j = $padding - strlen($r); $i < $j; $i++){
                $r = "0" . $r;
            }
        }
        return $r;
    }

    public static function toDecimal(string $hexa){
        $r = 0;
        $val = ['a','b','c','d','e','f'];
        $n = 0;
        for($i = 0,$j = strlen($hexa); $i < $j; $i++){
            if(in_array($hexa[$i], $val)){
                for($k = 0, $v = count($val); $k < $v; $k++){
                    $n = 10 + $k;
                    if($val[$k] == $hexa[$i]){
                        break;
                    }
                }
            }
            else{
                $n = (int) $hexa[$i];
            }
            $r += $n * pow(16, $j - $i - 1);
        }
        return $r;
    }

    public function create(){
        $this->token = "";
        $max = random_int(16,32);

        $abc = ['a','b','c','e','f','0','1','2','3','4','5','6','7','8','9','_'];
        $this->ip = Ressource::clientIP();
        $ip = explode(".",$this->ip);
        if($this->private){
            $abc[] = "@";
            $abc[] = "&";
        }
        do {
            $this->token = $this->private ? "" : "ss_";
            for ($i = 0; $i < $max; $i++) {
                if (random_int(0, 2) == 0) {
                    $this->token .= strtoupper($abc[random_int(0, count($abc) - 1)]);
                } else {
                    $this->token .= strtolower($abc[random_int(0, count($abc) - 1)]);
                }
            }
            if(!$this->private) {
                $this->token .= ".";
                foreach ($ip as $case) {
                    $this->token .= self::toHexaDecimal((int) $case,3);
                }
            }
        }while(self::exists($this->token));
        return $this;
    }

    public function isSuitable(){
        $r = true;
        if(!$this->private){
            /**
             * We get back the IP from the token string
             */
            $ip = explode(".", $this->token)[1];
            $ip = [substr($ip,0,3),substr($ip,3,3),substr($ip,6,3),substr($ip,9,3)];
            $c_ip = "";
            /**
             * we transform it into its original form
             */
            foreach($ip as $i => $part){
                $c_ip .= ($i > 0 ? "." : "") . self::toDecimal($part);
            }
            /**
             * And then, we compare it with the current ip
             */
            $r = Ressource::clientIP() == $c_ip;
        }
        return $r;
    }

    public function delete(){
        if($this->created){
            $req = Storage::Connect()->prepare("delete from sessiontrace where id=:p1");
            $req->execute(['p1'=>$this->id]);
            $req->closeCursor();
        }
        return $this;
    }

    public function save(){
        if(!$this->token){
            $this->create();
        }
        if($this->created){
            $chk = Storage::Connect()->prepare("update sessiontrace set last_seen=NOW(), permanent=:p1, private=:p4, online=:p2, ip=:p5 where id=:p3");
            $chk->execute([
                'p1'=>(int)$this->permanent,
                'p2'=>(int)$this->online,
                'p3'=>$this->id,
                'p4'=>(int)$this->private,
                'p5'=>$this->ip
            ]);
            $chk->closeCursor();
        }
        else{
            $chk = Storage::Connect()->prepare("insert into sessiontrace(user, token, last_seen, permanent,online,private,ip) values(:p1,:p2,NOW(), :p3,:p4,:p5,:p6)");
            $chk->execute([
               'p1'=>$this->uid,
               'p2'=>$this->token,
               'p3'=>(int)$this->permanent,
               'p4'=>(int)$this->online,
               'p5'=>(int)$this->private,
               'p6'=>$this->ip
            ]);
            $chk->closeCursor();
        }
        return $this;
    }

    public function update(){
        $this->save();
        $chk = Storage::Connect()->prepare("select * from sessiontrace where token=:p1");
        $chk->execute([
            'p1'=>$this->token
        ]);
        $this->hydrate($chk->fetch());
        $chk->closeCursor();
        return $this;
    }

    public static function fetchAll(bool $override = false){
        if(!count(self::$list["public"]) || $override) {
            $chk = Storage::Connect()->prepare("select * from sessiontrace");
            $chk->execute();
            if ($chk->rowCount()) {
                $token = null;
                while ($data = $chk->fetch()) {
                    $token = new AkaToken();
                    $token->hydrate($data);
                    self::$list[$token->isPrivate() ? "private" : "public"][$token->getUid()] = $token;
                }
                $token = null;
            }
        }
    }

    public static function exists($token){
        self::fetchAll();
        $r = false;
        foreach (self::$list as $sublist){
            foreach ($sublist as $_token){
                if( (is_subclass_of($token, self::class) && $_token->equals($token)) || $_token->getToken() == $token ){
                    $r = true;
                    break;
                }
            }
            if($r){
                break;
            }
        }
        return $r;
    }

    private static function get($index,string $where,bool $private = false){
        $chk = Storage::Connect()->prepare("select * from sessiontrace where $where=:p1 and private=:p2 and ip=:p3");
        $chk->execute([
            'p1'=>$index,
            'p2'=>(int) $private,
            'p3'=>Ressource::clientIP()
        ]);
        $token = null;
        if($chk->rowCount()){
            $token = new AkaToken();
            $token->hydrate($chk->fetch());
        }
        $chk->closeCursor();
        return $token;
    }

    public static function getByToken(string $token, bool $private = false){
        return self::get($token,"token",$private);
    }

    public static function getByUser(int $uid, bool $private = true){
        return self::get($uid,"user", $private);
    }

    public static function getById(int $id, bool $private = false){
        return self::get($id,"id",$private);
    }
}