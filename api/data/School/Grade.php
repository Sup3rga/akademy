<?php


class Grade extends _Grade_
{
    protected array $classrooms = [];
    protected array $promotionList = [];
    protected string $targetType = "school";

    /**
     * @return array<ClassRoom>
     */
    function getClassrooms(){
        if(count($this->classrooms)){
            return $this->classrooms;
        }
        $db = Storage::Connect()->prepare("select * from salle_classe where niveau=:p1");
        $db->execute(['p1'=>$this->id]);
        if($db->rowCount()){
            while($data = $db->fetch()){
                $this->classrooms[] = (new ClassRoom())->hydrate($db->fetch());
            }
        }
        $db->closeCursor();
        return $this->classrooms;
    }

    /**
     * @return array<Student>
     */
    function getPromotionList(){
        if(count($this->promotionList)){
            return $this->promotionList;
        }
        $classrooms = $this->getClassrooms();
        foreach ($classrooms as $classroom){
            $promotion_part = $classroom->getPromotion();
            foreach ($promotion_part as $part){
                $this->promotionList[] = $part;
            }
        }
        return $this->promotionList;
    }

    function hasMoreStudentThan(Grade $other){
        return count($other->getPromotionList()) < count($this->getPromotionList());
    }

    function data(){
        return CheckIf::merge(parent::data(), [
            "stats"=>[
                "ttl_student"=> count($this->promotionList)
            ]
        ]);
    }
}