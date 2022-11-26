<?php


class Establishment extends Cachable
{
    private int $id, $departement, $since;
    private string $nom;
    private bool $granted = false;
    private static $list = [];

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return int
     */
    public function getDepartement(): int
    {
        return $this->departement;
    }

    /**
     * @param int $departement
     */
    public function setDepartement(int $departement): void
    {
        $this->departement = $departement;
    }

    /**
     * @return int
     */
    public function getSince(): int
    {
        return $this->since;
    }

    /**
     * @param int $since
     */
    public function setSince(int $since): void
    {
        $this->since = $since;
    }

    /**
     * @return string
     */
    public function getNom(): string
    {
        return $this->nom;
    }

    /**
     * @param string $nom
     */
    public function setNom(string $nom): void
    {
        $this->nom = $nom;
    }

    /**
     * @return bool
     */
    public function isGranted(): bool
    {
        return $this->granted;
    }

    /**
     * @param bool $granted
     */
    public function setGranted(bool $granted): void
    {
        $this->granted = $granted;
    }

    public static function nameExists(Establishment  $instu) : bool {
        $r = false;
        foreach (self::fetchAll() as $school){
            if($instu->getDepartement() == $school->getDepartement() && strtolower($instu->getNom()) == strtolower($school->getNom())){
                $r = true;
            }
        }
        return $r;
    }

    public static function fetchAll($override=false)
    {
        if(!$override && count(self::$list) > 0) return self::$list;
        self::$list = [];
        $chk = Storage::Connect()->prepare("select * from institutions");
        $chk->execute();
        while($data = $chk->fetch()){
            $c = new Establishment();
            $c->hydrate($data);
            self::$list[] = $c;
        }
        $chk->closeCursor();
        return self::$list;
    }

    function save()
    {
        $r = "Invalid name given";
        if(CheckIf::isFormalName($r)) return $r;
        $r = "School name already exist";
        if(self::nameExists($this)) return $r;
        $r = "Department id does not exist";
        if(Department::getById($this->pays) == null) return $r;
        $r = null;
        $db = Storage::Connect();
        $chk = $db->prepare("insert into institutions(nom,departement,depuis) values (:p1,:p2)");
        $chk->execute(['p1'=>$this->nom,'p2'=>$this->departement]);
        $chk->closeCursor();
        return $r;
    }

    function delete()
    {}

    function hydrate(array $data)
    {
        $this->nom = $data['nom'];
        $this->id = (int) $data['id'];
        $this->departement = (int) $data['departement'];
        $this->since = (int) $data['depuis'];
        $this->granted = $data['validation'] == 1;
    }

    function data(){
        return [
            "name"=>$this->nom,
            "id"=>$this->id,
            "since"=>$this->since
        ];
    }

    static function getById(int $id) : ?Establishment{
        $r = null;
        $chk = Storage::Connect()->prepare("select * from institutions where id=:p1");
        $chk->execute(['p1'=>$id]);
        if($chk->rowCount()){
            $r = new Establishment();
            $r->hydrate($chk->fetch());
        }
        $chk->closeCursor();
        return $r;
    }

    use _Cache_;
}