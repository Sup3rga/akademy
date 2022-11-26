<?php

abstract class _Teacher_ extends Civil
{
    protected $status_matrimonial, $etat, $niveau_etude;
    protected $id = 0, $since;
    protected $salaire = 0.0;
    protected $hasAccount = false;
    protected $cours = [];
    protected $filieres = [];
    public static $list = [];

    public function getId() {
        return $this->id;
    }

    public function getCode() {
        return parent::getCode();
    }

    public function setCode(string $code) {
        parent::setCode($code);
        return $this;
    }

    public function getNom() {
        return parent::getNom();
    }

    public function setNom(string $nom) {
        parent::setNom($nom);
        return $this;
    }

    public function getPrenom() {
        return parent::getPrenom();
    }

    public function setPrenom(string $prenom) {
        parent::setPrenom($prenom);
        return $this;
    }

    public function getSexe() {
        return parent::getSexe();
    }

    public function setSexe(string $sexe) {
        parent::setSexe($sexe);
        return $this;
    }

    public function getAdresse() {
        return parent::getAdresse();
    }

    public function setAdresse(string $adresse) {
        parent::setAdresse($adresse);
        return $this;
    }

    public function getEmail() {
        return parent::getEmail();
    }

    public function setEmail(string $email) {
        parent::setEmail($email);
        return $this;
    }

    public function getLieu_naissance() {
        return parent::getLieu_naissance();
    }

    public function setLieu_naissance(string $lieu_naissance) {
        parent::setLieu_naissance($lieu_naissance);
        return $this;
    }

    public function getDate_naissance() {
        return parent::getDate_naissance();
    }

    public function setDate_naissance(string $date_naissance) {
        parent::setDate_naissance($date_naissance);
        return $this;
    }

    public function getNif() {
        return parent::getNif();
    }

    public function setNif(string $nif) {
        parent::setNif($nif);
        return $this;
    }

    public function getNinu() {
        return parent::getNinu();
    }

    public function setNinu(string $ninu) {
        parent::setNinu($ninu);
        return $this;
    }

    public function getPoste() {
        return parent::getPoste();
    }

    public function setPoste(int $poste) {
        parent::setPoste($poste);
        return $this;
    }

    public function setProfil(?string $avatar){
        parent::uploadPhoto($avatar);
        return $this;
    }

    public function getTelephone() {
        return parent::getTelephone();
    }

    public function setTelephone(string $telephone) {
        parent::setTelephone($telephone);
        return $this;
    }

    public function getStatus_matrimonial() {
        return $this->status_matrimonial;
    }

    public function setStatus_matrimonial(string $status_matrimonial) {
        $this->status_matrimonial = $status_matrimonial;
        return $this;
    }

    public function getEtat() {
        return $this->etat;
    }

    protected function dismiss(){
        $db = Storage::Connect();
        $chk = $db->prepare("update cours set titulaire=NULL where titulaire=:p1");
        try{
            $chk->execute(["p1"=> $this->id]);
            $chk = $db->prepare("update cours set suppleant=NULL WHERE suppleant=:p1");
            try{
                $chk->execute(["p1"=> $this->id]);
                $chk = $db->prepare("update cours set etat='N' WHERE suppleant is NULL and titulaire is NULL");
                $chk->execute();
            }catch(Exception $e){\System\Log::printStackTrace($e);}
        }catch (Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
    }

    public function setEtat(string $etat) {
        $etat = strtoupper($etat);
        $this->etat = $etat;
        $r = "Invalid state given !";
        if(!CheckIf::inArray($etat, ["M","A","C","E"])) return $r;
        $r = "This teacher can't have this state because ".($this->sexe == "M" ? "he" : "she")." still spend dispense !";
        if($etat == "M" && count($this->cours) > 0) return $r;
        $r = "This teacher can't have this state because ".($this->sexe == "M" ? "he" : "she")." already has course to dispense !";
        if($etat == "A" && count($this->cours) == 0) return $r;
        $r = null;
        $db = Storage::Connect();
        $chk = $db->prepare("update professeurs set etat=:p1 where id=:p2");
        try{
            $chk->execute([
                "p1"=> $this->etat,
                "p2"=>$this->id
            ]);
            Storage::update($this);
            if($etat == "E"){
                $this->dismiss();
                if($this->hasAccount){
                    $e = User::getByIdentity($this->identite);
                    if($e != null){
                        $e->setActif(false);
                    }
                }
            }
        }catch(Exception $e){
            \System\Log::printStackTrace($e);
            $r = "An error occured during operation !";
        }
        $chk->closeCursor();
        return $r;
    }

    public function getSalaire() {
        return $this->salaire;
    }

    public function setSalaire(float $salaire) {
        $this->salaire = $salaire;
        return $this;
    }

    public function getMemo() {
        return parent::getMemo();
    }

    public function setMemo(?string $memo) {
        parent::setMemo($memo);
        return $this;
    }

    public function getNiveauEtude() {
        return $this->niveau_etude;
    }

    public function setNiveauEtude(string $niveau_etude) {
        $this->niveau_etude = $niveau_etude;
        return $this;
    }

    public function save($a = null, $b = null){
        $this->setCriterias([
           "adresse"=>"civil.address.required",
            "sexe"=>"civil.gender.required",
            "lieu_naissance"=>"civil.birthplace.required",
            "date_naissance"=>"civil.birthdate.required",
            "telephone"=>"civil.phone.required",
            "nif"=>"civil.nif.required",
            "ninu"=>"civil.ninu.required",
            "status_matrimonial"=>"civil.marital.status.required",
            "niveau_etude"=>"civil.study.level.required",
            "email"=>"civil.email.required"
        ]);

        $r = _str["civil.marital.status.invalid"];
        if(!CheckIf::inArray(mb_strtolower($this->status_matrimonial), ["marié(e)", "célibataire", "fiancé", "non spécifié"])) return $r;
        $r = _str["civil.study.level.invalid"];
        if(!CheckIf::inArray(mb_strtolower($this->niveau_etude), ["bacc","licence", "master", "doctorat"])) return $r;

        $r = parent::save($this);

        if($r) return $r;

        $db = Storage::Connect();
        $chk = null; $data = [];
        if($this->id == 0){
            $chk = $db->prepare("insert into professeurs(identite,niveau_etude,status_matrimoniale, salaire, etat,annee_academique,version) values(:p1,:p2,:p3,:p4,:p5,:p6,:p99)");
            $data["p1"] = $this->identite;
            $data["p6"] = Storage::$currentYear->getId();
        }
        else{
            $chk = $db->prepare("update professeurs set niveau_etude=:p2,status_matrimoniale=:p3, salaire=:p4, etat=:p5, version=:p99 where id=:p6");
            $data["p6"] =  $this->id;
        }
        $data["p2"] = $this->niveau_etude;
        $data["p3"] = $this->status_matrimonial;
        $data["p4"] = $this->salaire;
        $data["p5"] = $this->etat == null ? "M" : $this->etat;
        $data["p99"] = Version::get();
        try{
            $chk->execute($data);
            $r = null;
            Storage::update($this);
        }catch(Exception $e){
            \System\Log::printStackTrace($e);
            $r = _str["general.error"];
            if($this->id == 0){
                $this->rollback();
            }
        }
        $chk->closeCursor();
        return $r;
    }

    public function delete() {
        $r = _str["general.error"];
        $this->dismiss();
        $db = Storage::Connect();
        $chk = $db->prepare("delete from individu where id=:p1");
        try{
            $chk->execute(["p1"=> $this->identite]);
            $r = null;
            Storage::update($this);
        }catch (Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public function hydrate(array $data) {
        $this->identite = (int) $data["identite"];
        parent::init();
        $this->salaire = (double) $data["salaire"];
        $this->id = (int) $data["id"];
        $this->niveau_etude = $data["niveau_etude"];
        $this->etat = $data["etat"];
        $this->status_matrimonial = $data["status_matrimoniale"];
        $this->hasAccount = User::exists($this->identite);
        $this->since = $data["annee_academique"];
        $this->fetchSuite();
        return $this;
    }

    protected function fetchSuite(){
        $facId = [];
        foreach(Course::$list as $c){
            if($c->getTitulaire() == $this->id || $c->getSuppleant() == $this->id){
                $this->cours[] = $c;
                $f = Faculty::getById($c->getFiliere());
                if(!CheckIf::inArray($f->getId(), $facId)){
                    $facId[] = $f->getId();
                    $this->filieres[] = $f;
                    if(!CheckIf::contains($f->getId(), $this->attachedBranch)){
                        $this->attachedBranch[$f->getId()] = [];
                    }
                    foreach($f->getGrades() as $k => $v){
                        $this->attachedBranch[$f->getId()][] = $k;
                    }
                }
            }
        }
    }

    /**
     * @param false $override
     * @return _Teacher_[]
     */
    public static function fetchAll($override = false){
        if(!$override && count(self::$list) > 0){
            return self::$list;
        }
        self::$list = [];
        $db = Storage::Connect();
        $chk = $db->prepare("select p.* from professeurs p, individu i where p.identite = i.id and p.version > :p98 order by i.nom, i.prenom asc");
        try{
            $chk->execute(["p98"=>Version::getUserQuery()]);
            while($d = $chk->fetch()) {
                $t = new Teacher();
                $t->hydrate($d);
                self::$list[] = $t;
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return self::$list;
    }

    public static function getById(int $id){
        $r = null;
        if(count(self::$list)){
            foreach(self::$list as $e){
                if($e->getId() == $id){
                    $r = $e;
                    break;
                }
            }
            if($r != null) return $r;
        }
        $db = Storage::Connect();
        $chk = $db->prepare("select p.* from professeurs p, individu i where p.identite = i.id and p.id = :p1");
        try{
            $chk->execute(["p1"=>$id]);
            if($chk->rowCount()) {
                $r = new Teacher();
                $r->hydrate($chk->fetch());
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public static function getByIdentity(int $id){
        $r = null;
        foreach(self::fetchAll() as $t){
            if($t->getIdentite() == $id){
                $r = $t;
                break;
            }
        }
        return $r;
    }

    public static function fetchById(int $id){
        $db = Storage::Connect();
        $r = null;
        $chk = $db->prepare("select * from professeurs where id=:p1");
        try{
            $chk->execute(["p1"=>$id]);
            if($chk->rowCount()){
                $r = new Teacher();
                $r->hydrate($chk->fetch());
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public function data(){
        $_cours = []; $_filieres = [];
        foreach($this->cours as $k => $v){
            $_cours[] = $v->getId();
        }
        foreach($this->filieres as $k => $v){
            $_filieres[] = $v->getId();
        }
        return CheckIf::merge(parent::data(), [
            "status_matrimonial" => $this->status_matrimonial,
            "etat" => $this->etat,
            "niveau_etude" => $this->niveau_etude,
            "id" => $this->id,
            "salaire" => $this->salaire,
            "hasAccount" => $this->hasAccount,
            "cours" => $_cours,
            "filieres" => $_filieres,
            "since"=>$this->since,
            "available_time"=>$this->getSchedulableTime(),
            "busy_time"=> $this->getBusyTime()
        ]);
    }

    function getBusyTime(int $sessionID = 0, array $except = []){
        if($sessionID <= 0 && Sessions::$current) {
            $sessionID = Sessions::$current->getId();
        }
        $list = [
            0=>[],
            1=>[],
            2=>[],
            3=>[],
            4=>[],
            5=>[],
            6=>[]
        ];
        $db = Storage::Connect()->prepare("
            select distinct d.* from dispensation d, cours c
            where
            d.cours = c.id and
            c.session = :p2 and
            (
                (d.tp = 0 and c.titulaire = :p1) or
                (d.tp = 1 and c.suppleant = :p1)
            )
        ");
        $db->execute([
            'p1'=>$this->id,
            'p2'=>$sessionID
        ]);
        while($data = $db->fetch()){
            $schedule = (new Schedule())->hydrate($data);
            if(!in_array($schedule->getId(), $except) && isset($list[$schedule->getDay()]) ){
                $list[$schedule->getDay()][] = $schedule;
            }
        }
        $db->closeCursor();
        return $list;
    }

    function getSchedulableTime(int $sessionID = 0, array $except = []){
        $result = [];
        $list = $this->getBusyTime($sessionID, $except);
        foreach($list as $day => $busyHours){
            $begin = new AkaDateTime(Ressource::getWorkableHours(true)[0]);
            $end = null;
            if(!isset($result[$day])){
                $result[$day] = [];
            }
            foreach ($busyHours as $schedule){
                $end = new AkaDateTime($schedule->getBegin());
                if($end->isMoreThan($begin)){
                    $result[$day][] = [$begin->getTime(), $end->getTime()];
                }
                $begin = new AkaDateTime($schedule->getEnd());
            }
            $end = new AkaDateTime(Ressource::getWorkableHours(true)[1]);
            if($end->isMoreThan($begin)){
                $result[$day][] = [$begin->getTime(), $end->getTime()];
            }
        }
        return $result;
    }
}