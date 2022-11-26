<?php

abstract class _Course_ extends Data
{
    protected $nom, $annee_academique, $etat, $code;
    protected ?Teacher $titulaire = null, $suppleant = null;
    protected int $session = 0, $_niveau = 0, $_titulaire = 0, $_suppleant = 0, $_annee_academique = 0, $coefficient = 0, $id = 0;
    /**
     * @var Schedule[]
     */
    protected $horaire = [];
    protected Grade $niveau;
    public static $list = [];

    public function getHoraire() {
        return $this->horaire;
    }

    public function setHoraire(array $horaire) {
        $this->horaire = $horaire;
        return $this;
    }

    public function getNom() {
        return $this->nom;
    }

    public function setNom(string $nom) {
        $this->nom = $nom;
        return $this;
    }

    public function getNiveau() {
        return $this->_niveau;
    }

    public function getPromotion(){
        return $this->niveau;
    }

    public function setNiveau(int $niveau) {
        $this->_niveau = $niveau;
        return $this;
    }

    public function getEtat() {
        return $this->etat;
    }

    public function setEtat(string $etat) {
        return null;
        /*
        $r = "Invalid state given !";
        $this->etat = $etat;
        $oldState = $this->etat;
        if(!CheckIf::inArray($etat, ["E","D","S","N"])) return $r;
        $r = "This course has no teacher to dispense seance !";
        if($this->_titulaire == 0 && $this->_suppleant == 0) return $r;
        $this->etat = $etat;
        $r = "Session hours must be update before this operation to aconflict !";
        if(Course::seancesIsAllowed($this) != null){
            $this->etat = $oldState;
            return $r;
        }
        $r = "Execution error !";
        $db = Storage::Connect();
        $db = $db->prepare("update cours set etat = :p1, version=:p3 where id=:p2");
        $db->execute([
            "p1"=> $etat,
            "p2"=> $this->id,
            'p3'=>Version::get()
        ]);
        try{
            $db->execute();
            $r = null;
            Storage::update($this);
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
        */
    }

    public function getSession() {
        return $this->session;
    }

    public function setSession(int $session) {
        $this->session = $session;
        return $this;
    }

    public function getTitulaire(){
        return $this->_titulaire;
    }

    public function setTitulaire(int $_titulaire) {
        $this->_titulaire = $_titulaire;
        $this->titulaire = Teacher::getById($_titulaire);
        return $this;
    }

    public function setTitulaireObject(Teacher $titulaire){
        $this->titulaire = $titulaire;
        $this->_titulaire = $titulaire->getId();
        return $this;
    }

    public function getSuppleant(){
        return $this->_suppleant;
    }

    public function setSuppleant(int $_suppleant) {
        $this->_suppleant = $_suppleant;
        $this->suppleant = Teacher::getById($_suppleant);
        return $this;
    }

    function setSuppleantObject(Teacher $suppleant){
        $this->suppleant = $suppleant;
        $this->_suppleant = $suppleant->getId();
        return $this;
    }

    public function getAnneeAcademique(){
        return $this->_annee_academique;
    }

    public function setAnneeAcademique(int $_annee_academique) {
        $this->_annee_academique = $_annee_academique;
        return $this;
    }

    public function getCoefficient(){
        return $this->coefficient;
    }

    public function setCoefficient($coefficient) {
        $this->coefficient = $coefficient;
        return $this;
    }

    public function getId(){
        return $this->id;
    }

    public function getCode(){
        return $this->code;
    }

    public function setCode(string $code) {
        $this->code = $code;
        return $this;
    }

    public function save(){
        if($this->id == 0){
            $this->etat = "E";
            $this->_annee_academique = AcademicYear::$current->getId();
        }
        if(Course::codeExists($this)){
            $this->etat = null;
            return "Course code already exists !";
        }
        if($this->id == 0){
            $this->_annee_academique = AcademicYear::$current->getId();
        }
        $r = _str["general.error"];
        $db = Storage::Connect();
        $chk = null;
        $data = [];
        if($this->id == 0){
            $chk = $db->prepare("insert into cours(nom,niveau,session, coefficient,titulaire,suppleant, annee_academique, etat, code,version) 
             values(:p1,:p2,:p3,:p4,:p5,:p6,:p7,:p8,:p10,:p11)");
        }
        else{
            $chk = $db->prepare("update cours set nom=:p1,niveau=:p2,session=:p3, coefficient=:p4,
                                titulaire=:p5,suppleant=:p6, annee_academique=:p7, etat=:p8, code=:p10, version=:p11
                                 where id=:p9");
            $data["p9"] = $this->id;
        }
        $data["p1"] = $this->nom;
        $data["p2"] = $this->_niveau;
        $data["p3"] = $this->session;
        $data["p4"] = $this->coefficient;
        $data["p5"] = $this->_titulaire;
        $data["p6"] = $this->_suppleant == 0 ? null : $this->_suppleant;
        $data["p7"] = $this->_annee_academique;
        $data["p8"] = $this->etat;
        $data["p10"] = $this->code;
        $data["p11"] = Version::get();
        try{
            $chk->execute($data);
            $edit = $this->id > 0;
            if(!$edit) $this->id = self::getLastId();
            $r = null;
            if($edit){
                $chk = $db->prepare("delete from dispensation where cours = :p1 and annee_academique=:p2");
                $chk->execute([
                    "p1"=>$this->id,
                    "p2"=> AcademicYear::$current->getId()
                ]);
            }
            foreach($this->horaire as $index => $_val) {
                $chk = $db->prepare("insert into dispensation(jour,heure_debut,heure_fin,cours,tp,annee_academique) 
                                        values (:p1,:p2,:p3,:p4,:p5,:p6)");
                try{
                    $chk->execute([
                        "p1" => (int) $_val["day"],
                        "p2" => $_val["begin"],
                        "p3" => $_val["end"],
                        "p4" => $this->id,
                        "p5" => (bool) $_val["tp"],
                        "p6" => AcademicYear::$current->getId()
                    ]);
                    $r = null;
                }catch(Exception $e){}
            }
//            $this->principal->setEtat("A");
//            if($this->suppleant != null){
//                $this->suppleant->setEtat("A");
//            }
//            Storage::update($this);
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $chk->closeCursor();
        return $r;
    }

    public function delete() {
        $r = _str["general.error"];
        $db = Storage::Connect();
        $db = $db->prepare("delete from cours where id=:p1");
        try{
            $db->execute(["p1" => $this->id]);
            $r = null;
            Storage::update($this);
        }catch(Exception $e){System\Log::printStackTrace($e);}
        if($this->_titulaire){
            Teacher::getById($this->_titulaire)->save();
        }
        if($this->_suppleant){
            Teacher::getById($this->_suppleant)->save();
        }
        $db->closeCursor();
        return $r;
    }

    protected function teacherFromList(int $id){
        $r = null;
        if(count(Teacher::$list)) {
            foreach(Teacher::$list as $teacher){
                if($teacher->getId() == $id){
                    $r = $teacher;
                    break;
                }
            }
        }
        return $r;
    }

    abstract function hydrate(array $data);

    protected function fetchHoraire(){
        $db = Storage::Connect();
        $db = $db->prepare("select * from dispensation where cours=:p1");
        try{
            $db->execute(["p1"=> $this->id]);
            while($r = $db->fetch()){
                $this->horaire[] = (new Schedule())->hydrate($r);
            }
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
    }

    public function containsSchedule(int $id){
        $r = false;
        foreach ($this->horaire as $schedule){
            if($schedule->getId() == $id){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public static function getLastId(){
        $db = Storage::Connect();
        $r = 0;
        $db = $db->prepare("select id from cours order by id desc limit 1");
        try{
            $db->execute();
            if($db->rowCount() > 0) {
                $r = (int) $db->fetch()["id"];
            }
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
    }

    public static function codeExists(Course $c){
        $r = false;
        foreach(self::fetchAll() as $e){
            if(strtolower($e->getCode()) == strtolower($c->getCode()) && $e->getId() != $c->getId()){
                $r = true;
                break;
            }
        }
        return $r;
    }

    public static function getAll(){
        $db = Storage::Connect();
        $db = $db->prepare("select * from cours");
        $r = [];
        try{
            $db->execute();
            while($data = $db->fetch()){
                $c = new Course();
                $c->hydrate($data, false);
                $r[] = $c;
            }
            $c = null;
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
    }

    public static function fetchAll($override = false){
        if(!$override && count(self::$list) > 0){
            return self::$list;
        }
        self::$list = [];
        $db = Storage::Connect();
        $db = $db->prepare("select * from cours where version > :p98");
        try{
            $db->execute(["p98"=>Version::getUserQuery()]);
            while($data = $db->fetch()){
                $c = new Course();
                $c->hydrate($data);
                self::$list[] = $c;
            }
            $c = null;
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
        return self::$list;
    }

    /**
     * @param int $session
     * @param int $year
     * @return Course[]
     */
    static function fetchAllOnFilter(int $session = 0, int $year = 0){
        $list = [];
        $criteriaString = "";
        if($year > 0){
            $criteriaString .= "annee_academique = ".$year;
        }
        if($session > 0){
            $criteriaString .= (strlen($criteriaString) ? " and " : "") . "session=".$session;
        }
        $criteriaString = (strlen($criteriaString) ? "where " : "").$criteriaString;
        $db = Storage::Connect()->prepare("select * from cours ".$criteriaString);
        $db->execute();
        while($data = $db->fetch()){
            $list[] = (new Course())->hydrate($data);
        }
        $db->closeCursor();
        return $list;
    }

    public static function getAllFrom(int $filiere, int $niveau, int $session, int $ya = 0){
        $r = [];
        foreach(self::fetchAll() as $c){
            if($c->getEtat() == "E" && $c->getSession() == $session && $c->getAnneeAcademique() == $ya &&
                (
                    $filiere < 1 || ($filiere == $c->getFiliere() && ($niveau < 1 || $niveau == $c->getNiveau()))
                )
            ){
                $r[] = $c;
            }
        }
        return $r;
    }

    public static function getAllFromNow(int $filiere, int $niveau, int $session){
        return self::getAllFrom($filiere, $niveau, $session,AcademicYear::$current->getId());
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
        $db = $db->prepare("select * from cours where id=:p1");
        try{
            $db->execute(["p1"=>$id]);
            if($db->rowCount()){
                $r = new Course();
                $r->hydrate($db->fetch());
            }
        }catch(Exception $e){System\Log::printStackTrace($e);}
        $db->closeCursor();
        return $r;
    }

    protected static function sigma(string $hour){
        $h = explode(":",$hour);
        $r = 0;
        for($i = 0, $j = count($h); $i < $j; $i++){
            $r += ((int) $h[$i]) * ($i == 0 ? 60 : 1);
        }
        return $r;
    }

    /**
     * @param Course $referent
     * @param Course $current
     * @return Schedule|null
     */
    protected static function hasConflictBetween(_Course_ $referent, _Course_ $current){
        $r = null;
        foreach ($referent->getHoraire() as $refSchedule){
            $refTimes = [
                new AkaDateTime($refSchedule->getBegin()),
                new AkaDateTime($refSchedule->getEnd())
            ];
            foreach ($current->getHoraire() as $currSchedule){
                //Schedules must be set in the same day
                if($refSchedule->getDay() == $currSchedule->getDay() &&
                    $refSchedule->getId() != $currSchedule->getId() //in the case we compare the same course schedule
                ){
                    $currTimes = [
                        new AkaDateTime($currSchedule->getBegin()),
                        new AkaDateTime($currSchedule->getEnd())
                    ];
                    //Their hours interval must be in conflict
                    if (
                        $currTimes[0]->isBetween($refTimes[0], $refTimes[1], true) ||
                        $currTimes[1]->isBetween($refTimes[0], $refTimes[1], true) ||
                        $refTimes[0]->isBetween($currTimes[0], $currTimes[1], true) ||
                        $refTimes[1]->isBetween($currTimes[0], $currTimes[1], true)
                    ) {
                        //Their must be set for the same class or in the same room
                        if (
                            $referent->getNiveau() == $current->getNiveau() ||
                            $refSchedule->getRoomID() == $currSchedule->getRoomID()
                        ) {
                            $r = $refSchedule;
                            break;
                        }
                    }
                }
            }
        }
        return $r;
    }

    public function data(){
        return [
            "nom" => $this->nom,
            "annee_academique" => $this->annee_academique,
            "etat" => $this->etat,
            "titulaire" => $this->titulaire,
            "suppleant" => $this->suppleant,
            "code" => $this->code,
            "session" => $this->session,
            "_niveau" => $this->_niveau,
            "_titulaire" => $this->_titulaire,
            "_filiere" => $this->_filiere,
            "_suppleant" => $this->_suppleant,
            "_annee_academique" => $this->_annee_academique,
            "coefficient" => $this->coefficient,
            "id" => $this->id,
            "horaire" => $this->horaire,
            "niveau"=>$this->niveau->data(),
        ];
    }

    function schedule(array $newProgram){
        $except = [];
        /**
         * @var Schedule[]
         */
        $newSchedule = [];
        $unRecordedSchedules = [];
        $error = false;
        $msg = "";
        //we prepare list of schedule ID to except them later
        foreach ($newProgram as $program){
            if(!isset($program["class"])){
                $msg = (strlen($msg) ? "\n" : "") . _str["course.scheduling.classroom.required"] . " [H] " . $program["begin"] . "~" . $program["end"];
                $error = true;
                break;
            }
            if(!isset($program["room"])){
                $msg = (strlen($msg) ? "\n" : "") . _str["course.scheduling.room.required"] . " [H] " . $program["begin"] . "~" . $program["end"];
                $error = true;
                break;
            }
            //we check by the same if the classroom id is valid
            if(!ClassRoom::getById((int) $program["class"])){
                $error = true;
                $msg .= (strlen($msg) ? "\n" : "") . _str["classroom.invalid"] . " [H] " . $program["begin"] . "~" . $program["end"];
            }
            //the same for the room id
            if(!Room::getById((int) $program["room"])){
                $error = true;
                $msg .= (strlen($msg) ? "\n" : "") . _str["room.invalid"] . " [H] " . $program["begin"] . "~" . $program["end"];
            }
            //before checking if the current program is included in the current course schedule
            if(!$error && isset($program["id"])){
                if($this->containsSchedule($program["id"])) {
                    $except[] = $program["id"];
                }
                else{
                    $error = true;
                    $msg .= (strlen($msg) ? "\n" : "") . _str["course.schedule.invalid"] . " [H] " . $program["begin"] . "~" . $program["end"];
                }
            }
        }
        if($error) return $msg;
        //We get all available teacher's hours for the current session excepting all session id to modify
        $availableHours = $this->titulaire->getSchedulableTime($this->session, $except);
        //Then we check if all program hour are include of teacher available hours
        foreach ($newProgram as $program){
            if(isset($availableHours[$program["day"]])){
                $hours = $availableHours[$program["day"]];
                $included = false;
                $times1 = [
                    new AkaDateTime($program["begin"]),
                    new AkaDateTime($program["end"])
                ];
                foreach ($hours as $seance){
                    $times2 = [
                        new AkaDateTime($seance[0]),
                        new AkaDateTime($seance[1])
                    ];
                    \System\Log::println("[Check] " . json_encode([$program["begin"], $program["end"], '/', $seance[0], $seance[1]]));
                    if(
                        $times1[0]->isBetween($times2[0], $times2[1]) &&
                        $times1[1]->isBetween($times2[0], $times2[1])
                    ){
                        $included = true;
                        break;
                    }
                }
                if(!$included){
                    $error = true;
                    $msg .= (strlen($msg) ? "\n" : "") . _str["course.scheduling.out.of.bounds"] . " [H] " . $program["begin"] . "~" . $program["end"];
                }
                else{
                    $schedule = (isset($program["id"]) ? Schedule::getById((int) $program["id"]) : new Schedule())
                        ->setBegin($program["begin"])
                        ->setEnd($program["end"])
                        ->setDay((int) $program["day"])
                        ->setTp(CheckIf::toBoolean($program["tp"]))
                        ->setClassroomID((int) $program["class"])
                        ->setCourseID($this->id)
                        ->setRoomID((int) $program["room"]);
                    $newSchedule[] = $schedule;
                    if(!$schedule->getId()){
                        $unRecordedSchedules[] = $schedule;
                    }
                }
            }
            else{
                $error = true;
                $msg .= (strlen($msg) ? "\n" : "") . _str["course.scheduling.day.invalid"] . " [H] " . $program["begin"] . "~" . $program["end"];
            }
            if($error){
                break;
            }
        }
        if($error) return $msg;

        $oldSchedule = $this->horaire;
        $this->horaire = $newSchedule;


        //We check inside the same course if there's no conflict
        if($refSchedule = self::hasConflictBetween($this, $this)){
            $error = true;
            $msg .= (strlen($msg) ? "\n" : "") . _str["course.scheduling.hours.conflict"] . " [C] " . $refSchedule->getCourse()->getNom() . " [H] " . $refSchedule->getBegin() . "~" . $refSchedule->getEnd();
        }
        if($error) return $msg;

        //If everything is ok, we check if this hours don't create conflict with other course hours
        if(count($this->horaire)) {
            $courses = self::fetchAllOnFilter($this->session);
            foreach ($courses as $course) {
                if ($course->getId() != $this->id) {
                    if ($refSchedule = self::hasConflictBetween($course, $this)) {
                        $error = true;
                        $msg .= (strlen($msg) ? "\n" : "") . _str["course.scheduling.hours.conflict"] . " [C] " . $refSchedule->getCourse()->getNom() . " [H] " . $refSchedule->getBegin() . "~" . $refSchedule->getEnd();
                        break;
                    }
                }
            }
        }
        if($error) return $msg;

        //Then we save the program
        foreach ($this->horaire as $schedule){
            $schedule->save();
        }
        //The we delete all schedules which were not listed in program for the current course
        foreach ($oldSchedule as $schedule){
            if(!in_array($schedule->getId(), $except)){
                $schedule->delete();
            }
        }
        $this->save();
        return null;
    }
}