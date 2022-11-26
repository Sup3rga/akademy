<?php

abstract class _Grade_ extends Data
{
    protected $notation;
    protected $annee = 0, $_filiere = 0, $id = 0;
    protected $filiere = null;
    protected string $targetType = "university";
    public static $list = [];

    public function getId() {
        return $this->id;
    }

    public function getFiliereData(){
        return Faculty::getById($this->_filiere);
    }

    public function getNotation() {
        return $this->notation;
    }

    public function setNotation(string $notation) {
        $this->notation = $notation;
        return $this;
    }

    public function getAnnee() {
        return $this->annee;
    }

    public function setAnnee(int $annee) {
        $this->annee = $annee;
        return $this;
    }

    public function getFiliere() {
        return $this->_filiere;
    }

    public function setFiliere(int $_filiere) {
        $this->_filiere = $_filiere;
        return $this;
    }

    public function save() {
        $r = _str["general.error"];
        if($this->notationOrYearExists($this)){
            return _str["grade.notation.exist.".self::$targetType];
        }
        if(!$this->hasGradeArround($this, true)){
            return _str["grade.previousless"];
        }
        $db = Storage::Connect();
        $chk = null;
        $data = [];
        if($this->id == 0){
            $chk = $db->prepare("insert into niveau (filiere,notation,annee,version) values(:p1,:p2,:p3,:p5)");
            $data["p1"] =  $this->_filiere;
        }
        else{
            $chk = $db->prepare("update niveau set notation=:p2,annee=:p3,version=:p5 where id=:p4");
            $data["p4"] = $this->id;
        }
        $data["p2"] = $this->notation;
        $data["p3"] = $this->annee;
        $data["p5"] = Version::get();
        try{
            $chk->execute($data);
            $r = null;
            Storage::update($this);
        }catch (Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        Faculty::getById($this->_filiere)->save();
        return $r;
    }

    public function delete() {
        $r = null;
        if($this->hasGradeArround($this, false)){
            return _str["grade.linked"];
        }
        $db = Storage::Connect();
        $chk = $db->prepare("delete from niveau where id=:p1");
        try{
            $chk->execute(["p1"=> $this->id]);
            Storage::update($this);
        }catch (Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public function hydrate(array $data) {
        $this->notation = $data["notation"];
        $this->annee = $data["annee"];
        $this->_filiere = $data["filiere"];
        $this->id = $data["id"];
        return $this;
    }

    public static function fetchAll($override = false){
        if(!$override && count(self::$list) > 0){
            return self::$list;
        }
        self::$list = [];
        $db = Storage::Connect();
        $chk = $db->prepare("select * from niveau");
        try{
            $chk->execute();
            while($d = $chk->fetch()){
                $g = new Grade();
                $g->hydrate($d);
                self::$list[] = $g;
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return self::$list;
    }

    public static function getById(int $id){
        $g = null;
        if(count(self::$list)){
            foreach(self::$list as $e){
                if($e->getId() == $id){
                    $g = $e;
                    break;
                }
            }
            if($g != null) return $g;
        }
        $db = Storage::Connect();
        $chk = $db->prepare("select * from niveau where id =:p1");
        try{
            $chk->execute(["p1"=>$id]);
            if($chk->rowCount()){
                $g = new Grade();
                $g->hydrate($chk->fetch());
            }
        }catch(Exception $e){\System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $g;
    }

    public static function hasGradeArround(Grade $g, bool $behind){
        $r = false;
        if($behind && $g->getAnnee() == 1){
            return true;
        }
        $target = $g->getAnnee() + ($behind ? -1 : 1);
        foreach(self::fetchAll() as $e){
            if($e->getFiliere() == $g->getFiliere() && $e->getAnnee() == $target){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public static function notationOrYearExists(Grade $g){
        $r = false;
        foreach(self::fetchAll() as $e){
            if($e->getFiliere() == $g->getFiliere() &&
                $e->getId() != $g->getId() &&
                ($e->getNotation() == $g->getNotation() || $e->getAnnee() == $g->getAnnee())
            ){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public function next(){
        return $this->filiere->nextGrade($this->id);
    }

    public function isTerminal(){
        return $this->id == $this->filiere->maxGrade();
    }

    public function data(){
        return [
            "notation" => $this->notation,
            "annee" => $this->annee,
            "filiere" => $this->_filiere,
            "id" => $this->id,
        ];
    }
}