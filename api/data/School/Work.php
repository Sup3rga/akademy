<?php


class Work extends Data
{

    protected int $id = 0, $courseId = 0, $final = 0, $bareme = 0;
    protected double $quota = 0;
    protected string $name, $emitAt, $deadline, $description, $type;
    protected ?Course $cours = null;
    const PRESENTIAL = 0, VIRTUAL = 1;

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
    public function getCourseId()
    {
        return $this->courseId;
    }

    /**
     * @param int $courseId
     */
    public function setCourseId(int $courseId)
    {
        $this->courseId = $courseId;
        $this->cours = Course::getById($courseId);
        return $this;
    }

    /**
     * @return int
     */
    public function isFinalizable()
    {
        return $this->final;
    }

    /**
     * @param int $final
     */
    public function setFinalizable(int $final)
    {
        $this->final = $final;
        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function isEmitAt()
    {
        return $this->emitAt;
    }

    /**
     * @param string $emitAt
     */
    public function setEmitAt(string $emitAt)
    {
        $this->emitAt = $emitAt;
        return $this;
    }

    /**
     * @return string
     */
    public function getDeadline()
    {
        return $this->deadline;
    }

    /**
     * @param string $deadline
     */
    public function setDeadline(string $deadline)
    {
        $this->deadline = $deadline;
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

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType(string $type)
    {
        $this->type = strtoupper($type);
        return $this;
    }

    /**
     * @return Course
     */
    public function getCours()
    {
        return $this->cours;
    }

    /**
     * @return int
     */
    public function getBareme()
    {
        return $this->bareme;
    }

    /**
     * @param int $bareme
     */
    public function setBareme(int $bareme)
    {
        $this->bareme = $bareme;
        return $this;
    }

    /**
     * @return float|int
     */
    public function getQuota()
    {
        return $this->quota;
    }

    /**
     * @param float|int $quota
     */
    public function setQuota($quota)
    {
        $this->quota = $quota;
        return $this;
    }

    function save()
    {
        if(!$this->cours){
            return _str["course.invalid"];
        }
        $begin = new AkaDateTime($this->emitAt);
        $end = new AkaDateTime($this->deadline);
        if($begin->isMoreThan($end)){
            return _str["work.date.incoherent"];
        }

        $data = [
            'p1'=>$this->name,
            'p2'=>$this->courseId,
            'p3'=>$begin->getDateTime(),
            'p4'=>$end->getDateTime(),
            'p5'=>$this->quota,
            'p6'=>$this->final,
            'p7'=>$this->description,
            'p8'=>$this->type,
            'p9'=>$this->bareme
        ];
        if($this->id){
            $db = Storage::Connect()->prepare("update work set 
                                                        nom=:p1,cours=:p2,date_emission=:p3,date_remise=:p4,quota=:p5,
                                                        final=:p6,description=:p7,type_remise=:p8,bareme=:p9
                                                        where
                                                        id=:p10");
            $data['p10'] = $this->id;
            $db->execute($data);
            $db->closeCursor();
        }
        else{
            $db = Storage::Connect()->prepare("insert into work(nom, cours, date_emission, date_remise, quota, description, type_remise, bareme) 
                                                    values (:p1,:p2,:p3,:p4,:p5,:p6,:p7,:p8,:p9)");
            $db->execute($data);
            $db->closeCursor();
        }
        return null;
    }

    function delete()
    {
        if(!$this->id){
            return _str["work.invalid"];
        }
        $db = Storage::Connect()->prepare("delete from work where id=:p1");
        $db->execute(['p1'=>$this->id]);
        $db->closeCursor();
        return null;
    }

    function attribute(Student $student){
        if($student->alreadyContribute($this)){
            return _str['work.student.contribute.error'];
        }
        $db = Storage::Connect()->prepare("insert into affectation_devoir(etudiant, devoir) values(:p1,:p2)");
        $db->execute(['p1'=>$student->getId(), 'p2'=>$this->id]);
        $db->closeCursor();
        return null;
    }

    function removeAttribution(Student $student){
        $db = Storage::Connect()->prepare("delete from affectation_devoir where etudiant=:p1 and devoir=:p2");
        $db->execute(['p1'=>$student->getId(), 'p2'=>$this->id]);
        $db->closeCursor();
        return null;
    }

    function hydrate(array $data)
    {
        $this->id = (int) $data["id"];
        $this->name = $data["nom"];
        $this->setCourseId((int) $data["cours"]);
        $this->emitAt = $data["date_emission"];
        $this->deadline = $data["date_remise"];
        $this->quota = (double) $data["quota"];
        $this->final = (int) $data["final"];
        $this->description = $data["description"];
        $this->type = $data["type_remise"];
        $this->bareme = (int) $data["bareme"];

        return $this;
    }

    static function fetchAll()
    {
        // TODO: Implement fetchAll() method.
    }

    static function getById(int $id)
    {
        $result = null;
        $db = Storage::Connect()->prepare("select * from work where id=:p1");
        $db->execute(['p1'=>$id]);
        if($db->rowCount()){
            $result = (new Work())->hydrate($db->fetch());
        }
        $db->closeCursor();
        return $result;
    }

    static function isType(int $type){
        return $type >= self::PRESENTIAL && $type <= self::VIRTUAL;
    }
}