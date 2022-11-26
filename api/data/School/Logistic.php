<?php


class Logistic
{
    public const PER_ALPHABET_ALONGSIDE = 0;
    public const PER_ALPHABET_EQUITABLE = 1;
    public const RANDOMLY = 2;

    /**
     * @param Exams $exam
     * @param ExamsRoom $examsRoom
     * @return false|float
     */
    static function getEffectiveForExamPerRoom(Exams $exam,ExamsRoom $examsRoom, string $date){
        /**
         * We catch the capacity of the room
         */
        $capacity = $examsRoom->getRoom()->getCapacity();
        /**
         * We catch the quantity of exams requested for this room
         */
        $ttl_planned_exams = count($examsRoom->getRoom()->getPlannedExams($examsRoom->getExams()->getPeriodId(), $date));
        /**
         * We set the limit of place for this exams
         */
        $place_per_exam = floor($capacity / $ttl_planned_exams);
        /**
         * We request to know if participant are already added for this exam
         */
        $ttl_participant = count($examsRoom->getParticipants());
        if($ttl_participant){
            return $ttl_participant;
        }
        else {
            /**
             * We get the amount of participant for this exams
             */
            $ttl_participant_for_exam = count($examsRoom->getExams()->getCourse()->getPromotion()->getPromotionList());
            /**
             * We catch the quantity of rooms requested for this exams
             */
            $ttl_exam_room = count($exam->getRooms());
            /**
             * We set the average of student per room
             */
            $participant_avg = floor($ttl_participant_for_exam / $ttl_exam_room);
            /**
             * we return the available place for this exams matching to the room
             */
            return $participant_avg > $place_per_exam ? $place_per_exam : $participant_avg;
        }
    }

    static function getRoomPartitionForExamRoom(ExamsRoom $examsRoom, string $date){
        $planned_exams = $examsRoom->getRoom()->getPlannedExams($examsRoom->getExams()->getPeriodId(), $date);
        $remain = $examsRoom->getRoom()->getCapacity();
        $extend = 0;
        $limit = floor($remain / count($planned_exams));
        foreach ($planned_exams as $exams){
            if(!$examsRoom->equals($exams)) {
                $qty = self::getEffectiveForExamPerRoom($exams->getExams(), $examsRoom, $date);
                $remain -= $qty;
                $extend += $qty < $limit ? $limit - $qty : 0;
            }
        }
        return [
            "quota"=>self::getEffectiveForExamPerRoom($examsRoom->getExams(), $examsRoom, $date),
            "remain"=>$remain,
            "extend"=>$extend
        ];
    }

    private static function sortList(array $list){
        $indexes = array_keys($list);
        sort($list);
        $r = [];
        foreach ($list as $index){
            $r[$index] = $list[$index];
        }
        return $r;
    }

    static function unSpecialize(string $char){
        $toupper = $char != strtolower($char);
        if(preg_match("/^[éèêëẽęė]$/", $char)){
            return $toupper ? "E" : "e";
        }
        else if(preg_match("/^[áàâäãąȧ]$/", $char)){
            return $toupper ? "A" : "a";
        }
        else if(preg_match("/^[íìîïĩįı]$/", $char)){
            return $toupper ? "I" : "i";
        }
        else if(preg_match("/^[úùûüũų]$/", $char)){
            return $toupper ? "U" : "u";
        }
        else if(preg_match("/^[óòôöõǫȯ]$/", $char)){
            return $toupper ? "O" : "o";
        }
        else if(preg_match("/^[ýỳÿŷỹẏ]$/", $char)){
            return $toupper ? "Y" : "y";
        }
        else if(preg_match("/^[ñ]$/", $char)){
            return $toupper ? "N" : "n";
        }
        return $char;
    }

    /**
     * @param array<Student> $list
     */
    private static function getGroupedStudentList(array $list){
        $ranges = [];
        foreach ($list as $student) {
            $initial = self::unSpecialize(strtoupper($student->getNom()[0]));
            if (!isset($ranges[$initial])) {
                $ranges[$initial] = [
                    "object" => [],
                    "names" => []
                ];
            }
            $ranges[$initial]["object"] = $student;
            $ranges[$initial]["names"] = $student->getFullName();
        }
        return $ranges;
    }

    /**
     * @param array $grouplist
     * @param int $qty
     * @param int $algo
     * @return array<Student>
     */
    private static function sortStudentRange(array $grouplist, int $qty, int $algo = -1){
        $algo = $algo < 0 || $algo > 2 ? self::PER_ALPHABET_ALONGSIDE : $algo;
        foreach ($grouplist as $index => $alpha) {
            for ($i = 0, $j = count($alpha["names"]); $i < $j - 1; $i++) {
                $names = $alpha["names"][$i];
                for ($k = $i; $k < $j; $k++) {
                    $student = $alpha["object"][$k];
                    if ($names == $student->getFullName()) {
                        $old = $alpha["object"][$k];
                        $alpha["object"][$k] = $alpha["object"][$i];
                        $alpha["object"][$i] = $old;
                        break;
                    }
                }
            }
            $grouplist[$index] = $alpha;
        }
        $result = [];
        $i = 0;
        foreach ($grouplist as $list) {
            foreach ($list as $student) {
                $result[] = $student;
                if ($algo == self::PER_ALPHABET_EQUITABLE) {
                    break;
                } else if ($algo == self::PER_ALPHABET_ALONGSIDE) {
                    $i++;
                    if ($i >= $qty) {
                        break;
                    }
                }
            }
            $i++;
            if ($i >= $qty) {
                break;
            }
        }
        return $result;
    }

    /**
     * @param Student[] $list
     * @param int $qty
     * @param int $algo
     * @return Student[]
     */
    static function createStudentRange(array $list, int $qty, int $algo = Logistic::RANDOMLY){
        $ranges = [];
        $algo = $algo < 0 || $algo > 2 ? self::RANDOMLY : $algo;

        if($algo == self::RANDOMLY){
            $i = 0;
            do{
                $indexes = array_keys($list);
                $k = random_int(0,count($indexes)-1);
                $ranges[] = $list[$indexes[$k]];
                unset($list[$indexes[$k]]);
                $i++;
            }while($i < $qty);
            $result = self::sortStudentRange(self::sortList(self::getGroupedStudentList($ranges)), $qty);
        }
        else {
            $ranges = self::sortList(self::getGroupedStudentList($list));
            $result = self::sortStudentRange($ranges, $qty, $algo);
        }
        return $result;
    }

    /**
     * @param Grade $promotion
     * @param array<int> $qty
     * @param int $algo
     */
    static function createStudentMultiRanges(Grade $promotion, array $qtylist, int $algo){
        $result = [];
        $list = $promotion->getPromotionList();
        foreach ($qtylist as $qty){
            $sublist = self::createStudentRange($list, $qty, $algo);
            foreach ($sublist as $student){
                foreach ($list as $k => $oldStudent){
                    if($student->is($oldStudent)){
                        unset($list[$k]);
                        break;
                    }
                }
            }
            $result[] = $sublist;
        }
        return $result;
    }

    /**
     * @param Student[] $list
     * @param string $date
     * @return Student[]
     */
    static function getVacantStudentForExams(array $list, Exams $exams){
        $result = [];
        foreach ($list as $student){
            $db = Storage::Connect()->prepare("select distinct c.* from 
                                                        composition c, examens e, salle_examen s
                                                        where 
                                                        c.etudiant = :p1 and c.salle_exam = s.id and
                                                        s.examen = e.id and e.id = :p2
                                                    ");
            $db->execute(['p1'=>$student->getId(), 'p2'=> $exams->getId()]);
            if($db->rowCount() == 0){
                $result[] = $student;
            }
            $db->closeCursor();
        }
        return $result;
    }

    /***
     * @param array<Exams> $examsList
     * @param array<Room> $roomList
     * @param int $algo
     */
    static function examAutoPartition(array $examsList, array $roomList, int $algo = Logistic::PER_ALPHABET_ALONGSIDE){
        $msg = new RuntimeMessage();
        /**
         * We get all promotion
         */
        $grouped_exams = [];
        /**
         * We group all exams per same date and exam period
         */
        foreach ($examsList as $exams){
            if(isset($grouped_exams[$exams->getBeginDate()."::".$exams->getPeriodId()])){
                $grouped_exams[$exams->getBeginDate()."::".$exams->getPeriodId()][] = $exams;
            }
            else{
                $grouped_exams[$exams->getBeginDate()."::".$exams->getPeriodId()] = [$exams];
            }
        }
        foreach ($grouped_exams as $index => $group){
            /**
             * @var array<Grade> $promotions
             * For each group, we set the partition for each promotion
             */
            $promotions = [];
            /** list of promotion repartition */
            $promo_partitions = [];
            /* We get back the current exam period for the group  */
            $parts = explode("::", $index);
            $date = $parts[0];
            $period = (int) $parts[1];
            /** @var int $ttl_participant */
            $ttl_participant = 0;
            /* We count the total of participant for all present promotions */
            foreach ($group as $exams){
                $promo = $exams->getCourse()->getPromotion();
                $promotions[] = $promo;
                $ttl_participant += count(self::getVacantStudentForExams($promo->getPromotionList(), $exams));
            }
            /* We set an average of expected room capacity from the number of participant */
            $quota_participant = ceil($ttl_participant / count($promotions));
            $choosen_room = [];
            $exam_room = [];
            $remains = $ttl_participant;
            $list = $roomList;
            $any = false;
            do{
                /* We choose first the room which verify the quota defined above */
                foreach($list as $i => $room){
                    $place = $room->getAvailablePlaceOnDate($date);
                    if($any || $place < $quota_participant){
                        $remains -= $place;
                        $choosen_room[] = $room;
                        unset($list[$i]);
                        if($remains <= 0){
                            break;
                        }
                    }
                }
                /* We sort ascendently rooms by capacity for an optimized repartition
                */
                for($i = 0, $j = count($choosen_room) - 1; $i < $j; $i++){
                    for($k = $i; $k < $j; $k++){
                        $last_room = $choosen_room[$i];
                        if($last_room->getCapacity() > $choosen_room[$k]->getCapacity()){
                            $choosen_room[$i] = $choosen_room[$k];
                            $choosen_room[$k] = $last_room;
                        }
                    }
                }
                /* If the quantity is not enough we run again the list without quota */
                $any = true;
            }while($remains > 0 && count($list) > 0);
            /* If we got the efficient quantity to do the repartition, we proceed !  */
            if($remains <= 0){
                /**
                 * We set exam room for each exam in group
                 */
                $msg->setError(false);
                $msg->setMessage(null);
                foreach($group as $exams){
                    foreach($choosen_room as $room) {
                        $examroom = new ExamsRoom();
                        $err = $examroom->setRoomId($room->getId())
                               ->setExamId($exams->getId())
                               ->save();
                        $exam_room[] = $examroom;
                        if ($err) {
                            $msg->setMessage($err, true);
                        }
                    }
                }
                /* by splitting each promotion after the number of choosen room */
                $biggest = [
                    "promo"=>$promotions[0],
                    "index"=>0
                ];
                foreach ($promotions as $i => $promotion){
                    if($promotion->hasMoreStudentThan($biggest["promo"])){
                        $biggest["promo"] = $promotion;
                        $biggest["index"] = $i;
                    }
                    $ttl_promo = count($promotion->getPromotionList());
                    $split_nbr = floor($ttl_promo / count($choosen_room));
                    $promo_partitions[$i] = [];
                    /* And then we set each promotion partition */
                    for($k = 0; $k < $split_nbr; $k++){
                        $promo_partitions[$i][] = floor($ttl_promo / $split_nbr);
                    }
                    /* and the last partition can be the greatest amoung previous */
                    $promo_partitions[$i][$k-1] += $ttl_promo % $split_nbr;
                }
                /*
                 * And then we arrange promotion repartition if necessary by reducing and redistributing quantity
                 * inside the biggest promotion partition sector
                 */
                $ttl_room = count($choosen_room);
                foreach($choosen_room as $position => $room){
                    $ttl_room_participant = 0;
                    foreach ($promo_partitions as $p => $partition){
                        $ttl_room_participant += $partition[$position];
                    }
                    if($position < $ttl_room - 1) {
                        $qty = ($room->getCapacity() - $ttl_room_participant);
                        $promo_partitions[$biggest["index"]][$position] += $qty;
                        $promo_partitions[$biggest["index"]][$position + 1] -= $qty;
                    }
                    /**
                     * And finally we set the repartition for each exams room
                     */
                    foreach($promotions as $i => $promo){
                        $ranges = self::createStudentMultiRanges($promo, $promo_partitions[$i], $algo);
                        foreach ($ranges as $k => $group){
                            foreach ($group as $student){
                                $err = $exam_room[$k]->addParticipant($student, true);
                                if($err){
                                    $msg->setMessage($err, true);
                                }
                            }
                        }
                    }
                }
            }
            else{
                $msg->setMessage(_str["logistic.room.error"]);
            }
        }
        return $msg;
    }

}