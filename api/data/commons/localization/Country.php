<?php


class Country extends Cachable implements ContentMod
{
    private $id, $nom;
    private bool $granted = false;
    private static $list = [];
    private $schools = [], $departments = [], $towns = [];
    private static int $contentMod = 0;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * @param mixed $nom
     */
    public function setNom($nom)
    {
        $this->nom = $nom;
    }

    /**
     * @return bool
     */
    public function isGranted()
    {
        return $this->granted;
    }

    /**
     * @param bool $granted
     */
    public function setGranted(bool $granted)
    {
        $this->granted = $granted;
    }

    public static function nameExists($name){
        $r = false;
        foreach (self::fetchAll() as $country){
            if(strtolower($name) == strtolower($country->getNom()) ){
                $r = true;
            }
        }
    }

    public static function getById(int $id) : Country{
        $r = null;
        $chk = Storage::Connect()->prepare("select * from pays where id=:p1");
        $chk->execute(['p1'=>$id]);
        if($chk->rowCount()){
            $r = new Country();
            $r->hydrate($chk->fetch());
        }
        $chk->closeCursor();
        return $r;
    }

    function save()
    {
        $r = "Invalid name given";
        if(CheckIf::isFormalName($r)) return $r;
        $r = "Country name already exist";
        if(self::nameExists($this->nom)) return $r;
        $r = null;
        $db = Storage::Connect();
        $chk = $db->prepare("insert into pays(nom) values (:p1)");
        $chk->execute(['p1'=>$this->nom]);
        $chk->closeCursor();
        return $r;
    }

    /**
     * @return array
     */
    public function getSchools()
    {
        return $this->schools;
    }

    /**
     * @return array
     */
    public function getDepartments()
    {
        return $this->departments;
    }

    /**
     * @return array
     */
    public function getTowns()
    {
        return $this->towns;
    }



    function delete()
    {}

    function hydrate(array $data)
    {
        $this->id = (int) $data['id'];
        $this->nom = $data['nom'];
        $this->granted = $data['validation'] == 1;
        if(self::$contentMod <= self::WITH_DEPARTMENT_DATA) {
            //fetching department
            foreach (Department::fetchAll() as $dep) {
                if ($this->id == $dep->getPays()) {
                    $this->departments[$dep->getNom()] = $dep;
                }
            }
            if(self::$contentMod <= self::WITH_SCHOOL_DATA) {
                //fetching schools
                foreach (Establishment::fetchAll() as $school) {
                    if ($this->id == Department::getById($school->getDepartement())->getPays()) {
                        $this->schools[$school->getNom()] = $school;
                    }
                }
            }
        }
    }

    static function fetchAll($override=false)
    {
        if(!$override && count(self::$list) > 0) return self::$list;
        self::$list = [];
        $chk = Storage::Connect()->prepare("select * from pays");
        $chk->execute();
        while($data = $chk->fetch()){
            $c = new Country();
            $c->hydrate($data);
            self::$list[] = $c;
        }
        $chk->closeCursor();
        return self::$list;
    }

    public function data(){
        return [
            "name"=> $this->nom,
            "departments"=> $this->departments,
            "schools"=>$this->schools
        ];
    }

    use _Cache_;

    static function setContentMod(int $mod)
    {
        self::$contentMod = $mod;
        return Country::class;
    }

    static function getContentMod(): int
    {
        return self::$contentMod;
    }
}