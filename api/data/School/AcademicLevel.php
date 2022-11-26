<?php

use System\Log;
class AcademicLevel extends _Faculty_
{
    private int $nextLevel = 0;
    private array $classes = [];
//    protected static string $nomenclature = _str["nomenclature.academiclevel"];

    /**
     * @return int
     */
    public function getNextLevel()
    {
        return $this->nextLevel;
    }

    /**
     * @param int $nextLevel
     */
    public function setNextLevel(int $nextLevel)
    {
        $this->nextLevel = $nextLevel;
        return $this;
    }

    public function isLinked(){
        $req = Storage::Connect()->prepare("select * from filieres where suivant=:p1");
        $req->execute([
            'p1'=>$this->id
        ]);
        $r = $req->rowCount() > 0;
        $req->closeCursor();
        return $r;
    }

    public function delete(){
        $r = _str["academiclevel.linked"];
        if(!$this->isLinked()){
            $r = parent::delete() ? null : _str["general.error"];
        }
        return $r;
    }

    public function save(){
        self::$nomenclature = _str["nomenclature.academiclevel"];
        if($this->nextLevel > 0 && !self::getById($this->nextLevel)){
            $r = _str["academiclevel.invalid"];
            return $r;
        }
        $r = parent::save();
        if($r){
            return $r;
        }
        if($this->nextLevel > 0){
            $req = Storage::Connect()->prepare("update filieres set suivant=:p1, version=:p99 where id=:p2");
            try {
                $req->execute([
                    'p1' => $this->nextLevel,
                    'p2' => $this->id,
                    "p99"=>Version::get()
                ]);
            }catch(Exception $e){
                Log::printStackTrace($e);
                $r = Ressource::getSysStrings()["general.error"];
            }
            $req->closeCursor();
        }
        return null;
    }
}