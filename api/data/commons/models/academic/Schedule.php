<?php


class Schedule extends Data
{
    private int $id = 0, $day = 0, $courseID = 0, $roomID = 0, $classroomID = 0;
    private bool $tp = false;
    private ?string $begin = null;
    private ?string $end = null;

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
    public function getDay()
    {
        return $this->day;
    }

    /**
     * @param int $day
     */
    public function setDay(int $day)
    {
        $this->day = $day;
        return $this;
    }

    /**
     * @return int
     */
    public function getCourseID()
    {
        return $this->courseID;
    }

    /**
     * @param int $courseID
     */
    public function setCourseID(int $courseID)
    {
        $this->courseID = $courseID;
        return $this;
    }

    /**
     * @return int
     */
    public function getRoomID()
    {
        return $this->roomID;
    }

    /**
     * @param int $roomID
     */
    public function setRoomID(int $roomID)
    {
        $this->roomID = $roomID;
        return $this;
    }

    /**
     * @return int
     */
    public function getClassroomID()
    {
        return $this->classroomID;
    }

    /**
     * @param int $classroomID
     */
    public function setClassroomID(int $classroomID)
    {
        $this->classroomID = $classroomID;
        return $this;
    }

    /**
     * @return bool
     */
    public function isTp()
    {
        return $this->tp;
    }

    /**
     * @param bool $tp
     */
    public function setTp(bool $tp)
    {
        $this->tp = $tp;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBegin()
    {
        return $this->begin;
    }

    /**
     * @param string|null $begin
     */
    public function setBegin(?string $begin)
    {
        $this->begin = $begin;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEnd()
    {
        return $this->end;
    }

    /**
     * @param string|null $end
     */
    public function setEnd(?string $end)
    {
        $this->end = $end;
        return $this;
    }

    /**
     * @return Course|null
     */
    public function getCourse()
    {
        return Course::getById($this->courseID);
    }

    /**
     * @param Course|null $course
     */
    public function setCourse(Course $course)
    {
        $this->courseID = $course->getId();
        return $this;
    }

    /**
     * @return Room|null
     */
    public function getRoom()
    {
        return Room::getById($this->roomID);
    }

    /**
     * @param Room|null $room
     */
    public function setRoom(Room $room)
    {
        $this->roomID = $room->getId();
        return $this;
    }

    /**
     * @return ClassRoom|null
     */
    public function getClassroom()
    {
        return ClassRoom::getById($this->classroomID);
    }

    /**
     * @param ClassRoom|null $classroom
     */
    public function setClassroom(ClassRoom $classroom)
    {
        $this->classroomID = $classroom->getId();
        return $this;
    }

    function save()
    {
        $db = null;
        $arg = [
            "p1"=>$this->day,
            "p2"=>$this->begin,
            "p3"=>$this->end,
            "p4"=>$this->tp ? 1 : 0,
            "p5"=>$this->courseID,
            "p6"=>$this->roomID,
            "p7"=>$this->classroomID,
            "p99"=>Version::get()
        ];
        if($this->id > 0) {
            $db = Storage::Connect()->prepare("
                    update dispensation 
                    set jour=:p1, heure_debut=:p2, heure_fin=:p3,
                        tp=:p4, cours=:p5, salle=:p6, salle_classe=:p7,
                        version=:p99 where id=:p8
            ");
            $arg["p8"] = $this->id;
        }
        else{
            $db = Storage::Connect()->prepare("
                    insert into dispensation(jour,heure_debut,heure_fin,tp,cours,salle,salle_classe,version)
                    values (:p1,:p2,:p3,:p4,:p5,:p6,:p7,:p99)
            ");
        }
        try {
            $db->execute($arg);
        }catch (Exception $e){
            \System\Log::printStackTrace($e);
        }
        $db->closeCursor();
    }

    function delete()
    {
        if($this->id <= 0){
            return;
        }
        $db = Storage::Connect()->prepare("delete from dispensation where id=:p1");
        $db->execute(["p1"=>$this->id]);
        $db->closeCursor();
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data["id"];
        $this->day = (int) $data["jour"];
        $this->courseID = (int) $data["cours"];
        $this->roomID = (int) $data["salle"];
        $this->classroomID = (int) $data["salle_classe"];
        $this->tp = (bool) $data["tp"];
        $this->begin = $data["heure_debut"];
        $this->end = $data["heure_fin"];
        return $this;
    }

    function data(){
        return [
            "day"=> $this->day,
            "begin"=> $this->begin,
            "end"=> $this->end,
            "id"=> $this->id,
            "course"=> $this->courseID,
            "class"=>$this->classroomID,
            "room"=>$this->roomID,
            "tp"=> $this->tp
        ];
    }

    static function fetchAll(){}

    /**
     * @param int $id
     * @return Schedule|null
     */
    static function getById(int $id)
    {
        $r = null;
        $db = Storage::Connect()->prepare("select * from dispensation where id=:p1");
        $db->execute(['p1'=>$id]);
        if($db->rowCount()){
            $r = (new Schedule())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $r;
    }

}