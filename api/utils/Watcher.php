<?php
class Watcher
{
    static ?string $timeZone = null;

    static function currentDate(){
        if(self::$timeZone) {
            date_default_timezone_set(self::$timeZone);
        }
        return new AkaDateTime(date('Y-m-d H:m:s'));
    }

    static function academicYear(){
        $date = self::currentDate();
        $current = null;
        $arg = ['p1'=>$date->getDate()];
        $db = Storage::Connect()->prepare("select * from annee_academique where :p1 between debut and fin and etat='A'");
        $db->execute($arg);
        if($db->rowCount()){
            $current = $db->fetch();
        }

        if($current){
            $db = Storage::Connect()->prepare("update annee_academique set etat='F' where etat='O'");
            $db->execute();
            $db = Storage::Connect()->prepare("update annee_academique set etat='O' where id=:p1");
            $db->execute([
                'p1'=>$current["id"]
            ]);
        }
        else{
            $db = Storage::Connect()->prepare("select * from annee_academique where etat='O'");
            $db->execute();
            if($db->rowCount()){
                $current = $db->fetch();
            }
        }
        \System\Log::println("[AY] " . ($current == null) );
        if($current) {
            AcademicYear::$current = (new AcademicYear())->hydrate($current);
        }
        $db->closeCursor();
    }

    static function activeSessionDefinition(){
        $arg = ['p1'=>self::currentDate()->getDate()];
        //the active session
        $db = Storage::Connect()->prepare("select * from sessions where etat='E'");
        $db->execute();
        if($db->rowCount()){
            Sessions::$current = (new Sessions())->hydrate($db->fetch());
        }
        else{
            //the near next one
            $db = Storage::Connect()->prepare("select * from sessions where date_debut > :p1");
            $db->execute($arg);
            if($db->rowCount()){
                Sessions::$current = (new Sessions())->hydrate($db->fetch());
            }
            else{
                //the near next one
                $db = Storage::Connect()->prepare("select * from sessions where date_debut > :p1 order by id asc limit 1");
                $db->execute($arg);
                if($db->rowCount()){
                    Sessions::$current = (new Sessions())->hydrate($db->fetch());
                }
                else{
                    //the last one
                    $db = Storage::Connect()->prepare("select * from sessions order by id desc limit 1");
                    $db->execute($arg);
                    if($db->rowCount()){
                        Sessions::$current = (new Sessions())->hydrate($db->fetch());
                    }
                }
            }
        }
    }

    static function sessions(){
        $date = self::currentDate();
        $list = [];
        $arg = ['p1'=>$date->getDate()];
        $db = Storage::Connect()->prepare("update sessions set etat = 'E' where :p1 between date_debut and date_fin and etat='A'");
        $db->execute($arg);
        $db = Storage::Connect()->prepare("update sessions set etat = 'T' where :p1 > date_fin and etat != 'T'");
        $db->execute($arg);
        //define the last or active session
        self::activeSessionDefinition();
        $db->closeCursor();
    }

    static function examPeriod(){
        $date = self::currentDate();
        $list = [];
        $arg = ['p1'=>$date->getDate()];
        $db = Storage::Connect()->prepare("update exam_period set etat = 'E' where :p1 between date_debut and date_fin and etat='A'");
        $db->execute($arg);
        $db = Storage::Connect()->prepare("update exam_period set etat = 'T' where :p1 > date_fin and etat != 'T'");
        $db->execute($arg);
        $db->closeCursor();
    }

    static function essentials(){
        self::academicYear();
        self::sessions();
        self::examPeriod();
    }
}