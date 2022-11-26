<?php


class Room extends Data
{
    protected int $id = 0;
    protected ?string $code = null;
    protected ?string $nom = null;
    protected int $capacity = 0;
    protected ?string $settingError = null;
    protected ?string $description = null;

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
    public function getCode()
    {
        return $this->code;
    }

    /**
     * @param string $code
     */
    public function setCode(string $code)
    {
        $this->code = $code;
        return $this;
    }

    /**
     * @return string
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * @param string $nom
     */
    public function setNom(string $nom)
    {
        $this->nom = $nom;
        return $this;
    }

    /**
     * @return int
     */
    public function getCapacity()
    {
        return $this->capacity;
    }

    /**
     * @param int $capacity
     */
    public function setCapacity(int $capacity)
    {
        $classroom = ClassRoom::getByRoom($this->id);
        if($classroom && $this->capacity < count($classroom->getPromotion())){
            $this->settingError = _str["room.capacity"];
            return $this;
        }
        $this->capacity = $capacity;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription(string $description)
    {
        $this->description = $description;
        return $this;
    }

    function save()
    {
        if(self::codeExists($this)){
            return _str["room.code"];
        }
        if($this->settingError){
            return $this->settingError;
        }
        if($this->capacity < 1){
            return _str["room.capacity"];
        }
        $data = [
            'p1' => $this->code,
            'p2' => $this->capacity,
            'p3' => $this->nom,
            'p4' => $this->description
        ];
        if($this->id == 0) {
            $db = Storage::Connect()->prepare("insert into salle(code, capacite, nom, description) values (:p1,:p2,:p3,:p4)");
        }
        else{
            $db = Storage::Connect()->prepare("update salle set code=:p1, capacite=:p2, nom=:p3, description=:p4 where id=:p5");
            $data["p5"] = $this->id;
        }
        $msg = null;
        try {
            $db->execute($data);
        }catch (Exception $e){
            $msg = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $msg;
    }

    function delete()
    {
        if($this->isTaken() || $this->isTaken(true)){
            return _str["room.busy"];
        }
        if(!$this->id){
            return _str["room.invalid"];
        }
        $msg = null;
        $db = Storage::Connect()->prepare("delete from salle where id=:p1");
        try{
            $db->execute([
                'p1'=>$this->id
            ]);
        }catch(Exception $e){
            $msg = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $msg;
    }

    /**
     * @param bool $exam
     * @param bool $class
     * @return bool
     */
    function isTaken(bool $exam = false, int $classAY = 0){
        $r = false;
        if($exam) {
            $db = Storage::Connect()->prepare("select * from salle_examen s, examens e 
                                                    where s.salle=:p1 and s.examen = e.id and e.etat = 'A'");
            $db->execute([
                'p1'=>$this->id
            ]);
            $r = $db->rowCount() > 0;
        }
        else if($classAY <= 0){
            $db = Storage::Connect()->prepare("select * from dispensation where salle=:p1");
            $db->execute([
                'p1'=>$this->id
            ]);
            $r = $db->rowCount() > 0;
        }
        if(!$r && !$exam && $classAY >= 0){
            $db = Storage::Connect()->prepare("select * from salle_classe where salle=:p1 and annee_academique=:p2");
            $db->execute([
                'p1'=>$this->id,
                'p2'=>$classAY
            ]);
            $r = $db->rowCount() > 0;
        }
        $db->closeCursor();
        return $r;
    }

    function isAlreadySetForClassRoom(?ClassRoom $classroom = null){
        $academic = $classroom ? $classroom->getAcademicYearId() : null;
        if(!$academic && !AcademicYear::$current){
            return false;
        }
        else if(!$academic){
            $academic = $classroom->getAcademicYearId();
        }
        $db = Storage::Connect()->prepare("select id from salle_classe where salle=:p1 and annee_academique=:p2");
        $db->execute([
            'p1'=>$this->id,
            'p2'=>$academic
        ]);
        if($db->rowCount()){
            $r = $classroom ? $classroom->getId() != $db->fetch()["id"] : true;
        }
        $db->closeCursor();
        return $r;
    }

    function getAvailablePlaceOnDate(string $date, ?ExamPeriod $period = null, bool $foundMod = false){
        $date = (new AkaDateTime($date))->getDateTime();
        $period = $period ? $period : ExamPeriod::getByDate($date);
        $available = $this->capacity;
        if(!$period){
            return $available;
        }
        $db = Storage::Connect()->prepare("select s.* from salle_examen s, examens e 
                                                    where 
                                                  s.examen = e.id and s.salle=:p1 and 
                                                  :p2 between e.date and addtime(e.date, e.duration)");
        $db->execute(['p1'=>$this->id, 'p2'=>$date]);
        if($db->rowCount() > 0){
            while($data = $db->fetch()){
                $available -= count((new ExamsRoom())->hydrate($data)->getParticipants());
            }
        }
        else if($foundMod){
            $available = 0;
        }
        $db->closeCursor();
        return $available;
    }

    /**
     * @param string $date
     * @return bool
     */
    function isBusyOnDate(string $date){
        $date = (new AkaDateTime($date))->getDateTime();
        $period = ExamPeriod::getByDate($date);
        if(!$period){
            return false;
        }
        return $this->getAvailablePlaceOnDate($date, $period, true) == 0;
    }

    /**
     * @param int $period
     * @return array<ExamsRoom>
     */
    function getPlannedExams(int $period, ?string $date = null){
        $list = [];
        if($date){
            $date = (new AkaDateTime($date))->clearTime();
        }
        $db = Storage::Connect()->prepare("select distinct s.* 
                                                 from 
                                                 salle_examen s, examens e, exam_period ep
                                                 where 
                                                   s.salle=:p1 and s.examen = e.id and
                                                   e.period= ep.id and ep.id =:p2
                                               ");
        $db->execute([
            'p1'=>$this->id,
            'p2'=>$period
        ]);
        if($db->rowCount()){
            while($data = $db->fetch()){
                $examroom = (new ExamsRoom())->hydrate($db->fetch());
                if($date) {
                    $currentExamTime = (new AkaDateTime($examroom->getExams()->getBeginDate()))->clearTime();
                }
                if(!$date || $date->equals($currentExamTime)){
                    $list[] = $examroom;
                }
            }
        }
        $db->closeCursor();
        return $list;
    }

    function hydrate(array $data)
    {
        $this->id = $data["id"];
        $this->nom = $data["nom"];
        $this->code = $data["code"];
        $this->capacity = (int) $data["capacite"];
        $this->description = $data["description"];
        return $this;
    }

    private function setFor(string $instance, int $id){
        $msg = null;
        $db = Storage::Connect()->prepare("update $instance set salle=:p1 where id=:p2");
        try {
            $db->execute(['p1' => $this->id, 'p2'=>$id]);
        }catch(Exception $e){
            $msg = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $msg;
    }

    private function unsetFor(string $instance, int $id){
        $db = Storage::Connect()->prepare("delete $instance where id=:p1");
        try {
            $db->execute(['p1'=>$id]);
        }catch(Exception $e){
            $msg = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $msg;
    }

    function setForCourse(Course $course){
        if($this->isTaken()){
            return _str["room.busy"];
        }
        return $this->setFor("cours", $course->getId());
    }

    function setForClass(ClassRoom $class){
        if($this->isTaken(false,true)){
            return _str["room.busy"];
        }
        return $this->setFor("salle_classe", $class->getId());
    }

    function unsetForExams(Exams $exams){
        return $this->unsetFor("salle_examen", $exams->getId());
    }

    function getPlanning(?AcademicYear $year){
        $r = [
            "assignation"=>[],
            "exams"=>[],
            "events"=>[]
        ];
        if(!$year){
            return $r;
        }
        $args = [
            'p1'=>$this->id,
            'p2'=>$year->getId()
        ];
        $db = Storage::Connect()->prepare("select distinct d.*, s.niveau from dispensation d, cours c, salle_classe s  
                                                    where 
                                                        c.id = d.cours and
                                                        d.salle=:p1 and c.annee_academique=:p2
                                                        and 
                                                        d.salle = s.id");
        $db->execute($args);
        while($data = $db->fetch()){
            $course = Course::getById($data["cours"]);
            $r["assignation"][] = [
                "class"=> Grade::getById($data["niveau"]),
                "schedule"=>[
                    "begin"=>$data["heure_debut"],
                    "end"=>$data["heure_fin"]
                ],
                "course"=>[
                    "name"=>$course->getNom(),
                    "teacher"=>$course->getTitulaire()
                ],
                "day"=>$data["jour"]
            ];
        }

        $db = Storage::Connect()->prepare("select distinct e.*,c.nom from salle_examen s, examens e, exam_period p, cours c
                                            where s.salle=:p1 and p.annee_academique=:p2
                                            and 
                                            e.etat != 'T' and s.examen = e.id
                                            and 
                                            e.period = p.id
                                            and
                                            c.id = e.cours
                                            ");
        $db->execute($args);
        while($data = $db->fetch()){
            $course = Course::getById($data["cours"]);
            $r["exams"][] = [
                "date"=>$data["date"],
                "duration"=>$data["duration"],
                "cours"=>$course->getNom()
            ];
        }
        $db->closeCursor();

        return $r;
    }

    function data(){
        return [
          "id"=>$this->id,
          "name"=>$this->nom,
          "code"=>$this->code,
          "capacity"=>$this->capacity,
          "description"=>$this->description,
          "planning"=>$this->getPlanning(AcademicYear::$current)
        ];
    }

    static function fetchAll()
    {
        $list = [];
        $db = Storage::Connect()->prepare("select * from salle where version > :p98");
        $db->execute(["p98"=>Version::getUserQuery()]);
        while($data = $db->fetch()){
            $list[] = (new Room())->hydrate($data);
        }
        $db->closeCursor();
        return $list;
    }

    /**
     * @param int $id
     * @return Room|null
     */
    static function getById(int $id){
        $db = Storage::Connect()->prepare("select * from salle where id=:p1");
        $db->execute([
            'p1'=>$id
        ]);
        $room = null;
        if($db->rowCount()){
            $room = (new Room())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $room;
    }

    static function codeExists(Room $room){
        $db = Storage::Connect()->prepare("select * from salle where code=:p1 and id !=:p2");
        $db->execute(['p1'=>$room->code, 'p2'=>$room->id]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }
}