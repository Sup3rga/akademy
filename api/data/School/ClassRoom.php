<?php


class ClassRoom extends Data
{
    protected int $id = 0, $roomId = 0, $gradeId = 0, $ayId;
    protected ?Room $room = null;
    protected ?Grade $grade = null;
    protected ?AcademicYear $ay = null;
    /**
     * @var Student[]
     */
    protected array $promotion = [];

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * @param int $roomId
     */
    public function setRoomId(int $roomId)
    {
        $this->roomId = $roomId;
        $this->room = Room::getById($this->roomId);
        return $this;
    }

    /**
     * @return int
     */
    public function getGradeId()
    {
        return $this->gradeId;
    }

    /**
     * @param int $gradeId
     */
    public function setGradeId(int $gradeId)
    {
        $this->gradeId = $gradeId;
        $this->grade = Grade::getById($this->gradeId);
        return $this;
    }

    /**
     * @return int
     */
    public function getAcademicYearId()
    {
        return $this->ayId;
    }

    /**
     * @return Room
     */
    public function getRoom()
    {
        return $this->room;
    }

    /**
     * @return Grade
     */
    public function getGrade()
    {
        return $this->grade;
    }

    /**
     * @return AcademicYear
     */
    public function getAcademiqueYear()
    {
        return $this->ay;
    }

    /**
     * @return array<Student>
     */
    public function getPromotion(){
        return $this->promotion;
    }

    private function getPromotionByReference(){
        $r = [];
        foreach ($this->promotion as $student){
            $r[] = $student->getId();
        }
        return $r;
    }

    function save()
    {
        $msg = null;
        if(!$this->room){
            return _str["room.invalid"];
        }
        if(!$this->grade){
            return _str["grade.invalid"];
        }
        if(!$this->id){
            $this->ayId = AcademicYear::$current->getId();
        }
        if($this->room->isAlreadySetForClassRoom($this)){
            return _str["room.busy"];
        }
        if(self::exists($this)){
            return _str["classroom.exist"];
        }
        if(!$this->id){
            $db = Storage::Connect()->prepare("insert into salle_classe(salle,niveau,annee_academique,version) values(:p1,:p2,:p3,:p99)");
            try{
                $db->execute([
                    'p1'=> $this->roomId,
                    'p2'=>$this->gradeId,
                    'p3'=>$this->ayId,
                    'p99'=>Version::get()
                ]);
            }catch(Exception $e){
                $msg = _str["general.error"];
                \System\Log::printStackTrace($e);
            }
            $db->closeCursor();
        }
        else{
            $db = Storage::Connect()->prepare("update salle_classe set salle=:p1,niveau=:p2,version=:p99 where id=:p3");
            try {
                $db->execute([
                    'p1' => $this->roomId,
                    'p2' => $this->gradeId,
                    'p3' => $this->id,
                    'p99'=>Version::get()
                ]);
            }catch(Exception $e){
                $msg = _str["general.error"];
                \System\Log::printStackTrace($e);
            }
            $db->closeCursor();
        }
        return $msg;
    }

    function delete()
    {
        if(!self::exists($this)){
            return _str["classroom.invalid"];
        }
        if($this->hasScheduledCourse()){
            return _str["classroom.busy"];
        }
        $db = Storage::Connect()->prepare("delete from salle_classe where id=:p1");
        $msg = null;
        try {
            $db->execute([
                'p1' => $this->id
            ]);
        }catch(Exception $e){
            $msg = _str["general.error"];
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $msg;
    }

    function data(){
        return [
            "id"=>$this->id,
            "room"=>$this->room->getId(),
            "grade"=>$this->grade->getId(),
            "promotion"=>$this->getPromotionByReference(),
            "year"=>$this->ay->getId()
        ];
    }

    function hasScheduledCourse(){
        $db = Storage::Connect()->prepare("select distinct c.* from cours c, dispensation d where niveau=:p1 and c.id = d.cours and  d.salle=:p2 and d.annee_academique=:p3");
        $db->execute([
            'p1'=>$this->gradeId,
            'p2'=>$this->roomId,
            'p3'=>$this->ayId
        ]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }

    function hydrate(array $data)
    {
        $this->id = $data["id"];
        $this->roomId = (int) $data["salle"];
        $this->gradeId = (int) $data["niveau"];
        $this->ayId = (int) $data['annee_academique'];
        $this->room = Room::getById($this->roomId);
        $this->grade = Grade::getById($this->gradeId);
        $this->ay = AcademicYear::getById($this->ayId);
        /**
         * Getting student of classroom
         */
        $db = Storage::Connect()->prepare("select distinct e.* from promotion p, etudiants e where p.etudiant=e.id and p.salle_classe=:p1");
        $db->execute(['p1'=>$this->id]);
        while($data = $db->fetch()){
            $this->promotion[] = (new Student())->hydrate($data);
        }
        $db->closeCursor();
        return $this;
    }

    function addStudent(Student $student){
        $id = $student->getClassRoom(true);
        $db = null;
        $r = null;
        $arg = [
            "p1"=>$this->id,
            "p2"=>$student->getId(),
            "p99"=>Version::get()
        ];
        if($id) {
            $db = Storage::Connect()->prepare("update promotion set salle_classe=:p1, version=:p99 where etudiant=:p2 and salle_classe=:p3");
            $arg["p3"] = $id;
        }
        else{
            $db = Storage::Connect()->prepare("insert into promotion(salle_classe, etudiant, version) values (:p1,:p2,:p99)");
        }
        try{
            $db->execute($arg);
        }catch (Exception $e){
            $r = _str["general.error"] . " [ID] " . $student->getId() . " [N] " .$student->getFullName();
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
        return $r;
    }

    /**
     * @param Student[] $studentList
     */
    function addStudents(array $studentList){
        $msg = "";
        foreach ($studentList as $student){
            $msg .= (strlen($msg) ? "\n" : "") . $this->addStudent($student);
        }

        \System\Log::println("[Promo] " . $this->save());
        return $msg;
    }

    static function fetchAll()
    {
        $list = [];
        $db = Storage::Connect()->prepare("select * from salle_classe where version > :p98");
        $db->execute(["p98"=>Version::getUserQuery()]);
        while($data = $db->fetch()){
            $list[] = (new ClassRoom())->hydrate($data);
        }
        $db->closeCursor();
        return $list;
    }

    static function getById(int $id){
        $r = null;
        $db = Storage::Connect()->prepare("select * from salle_classe where id=:p1");
        $db->execute(['p1'=>$id]);
        if($db->rowCount()){
            $r = (new ClassRoom())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $r;
    }

    static function getByRoom(int $id, int $ay = -1){
        if($ay <= 0){
            $ay = AcademicYear::$current->getId();
        }
        $classroom = null;
        $db = Storage::Connect()->prepare("select * from salle_classe where salle=:p1 and annee_academique=:p2");
        $db->execute(['p1'=>$id, 'p2'=>$ay]);
        if($db->rowCount()){
            $classroom = (new ClassRoom())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $classroom;
    }

    static function exists(ClassRoom $class){
        $db = Storage::Connect()->prepare("select * from salle_classe where salle=:p1 and niveau=:p2 and annee_academique=:p3 and id != :p4");
        $db->execute([
            'p1'=>$class->getRoomId(),
            'p2'=>$class->getGradeId(),
            'p3'=>AcademicYear::$current->getId(),
            'p4'=>$class->getId()
        ]);
        $r = $db->rowCount() > 0;
        $db->closeCursor();
        return $r;
    }
}