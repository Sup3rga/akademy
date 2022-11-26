<?php

class AkaDateTime {
    private array $date = [0,0,0];
    private array $time = [0,0,0];
    private int $stamp = 0;
    private int $weekDay = 5; //The very first day was a friday
    const VERY_FIRST_DAY_DISTANCE = 3; //The very first day was a friday
    const EQUALS = 1;
    const LESS_THAN = 0;
    const MORE_THAN = 2;

    /**
     * AkaDateTime constructor.
     * @param string|null $date
     */
    function __construct(string $date = null){
        $this->extract($date);
    }

    public function __toString(){
        return $this->getDateTime();
    }

    private function setWeekDay(){
        $weekSum = 7 * 24 * 60 * 60;
        $sum = $this->stamp;
        while($sum - $weekSum > 0){
            $sum -= $weekSum;
        }
        $date_array = self::toDate($sum);
        $weekDay = $date_array[2] - self::VERY_FIRST_DAY_DISTANCE;
        $this->weekDay =  $weekDay < 0 ? 7 + $weekDay : $weekDay;
    }

    function getWeekDay(){
        return $this->weekDay;
    }

    function setDateTime(string $date){
        $this->extract($date);
        return $this;
    }

    function getDate(){
        return $this->padding($this->date[0],4).
                "-".
               $this->padding($this->date[1],2).
                "-".
               $this->padding($this->date[2],2);
    }

    function getTime(){
        return $this->padding($this->time[0],2).
            ":".
            $this->padding($this->time[1],2).
            ":".
            $this->padding($this->time[2],2);
    }

    function getDateTime(){
        return $this->getDate() . " " . $this->getTime();
    }

    private function padding(string $val, int $padding = 0, string $default = "0"){
        for($i = 0, $j = $padding - strlen($val); $i < $j; $i++){
            $val = $default . $val;
        }
        return $val;
    }

    /**
     * @return int|mixed
     */
    function getYear(){
        return $this->date[0];
    }

    /**
     * @return int|mixed
     */
    function getMonth(){
        return $this->date[1];
    }

    /**
     * @return int|mixed
     */
    function getDay(){
        return $this->date[2];
    }

    /**
     * @return int|mixed
     */
    function getHour(){
        return $this->time[0];
    }

    /**
     * @return int|mixed
     */
    function getMinute(){
        return $this->time[1];
    }

    /**
     * @return int|mixed
     */
    function getSecond(){
        return $this->time[2];
    }

    /**
     * @param string $date
     */
    private function extract(string $date){
        if(self::isDate($date)){
            $list = explode(" ",preg_replace("/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/", "$1 $2 $3", $date));
            foreach($list as $i => $val){
                $this->date[$i] = (int) $val;
            }
        }
        else if(self::isDateTime($date)){
            $list = explode(" ",preg_replace("/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})?$/", "$1 $2 $3 $4 $5 $6", $date));
            foreach($list as $i => $val){
                if($i < 3){
                    $this->date[$i] = (int) $val;
                }
                else{
                    $this->time[$i - 3] = (int) $val;
                }
            }
            if(count($list) < 6){
                $this->time[2] = 0;
            }
        }
        else if(self::isTime($date)){
            $list = explode(" ",preg_replace("/^([0-9]{2}):([0-9]{2}):([0-9]{2})?$/", "$1 $2 $3", $date));
            foreach($list as $i => $val){
                $this->time[$i] = (int) $val;
            }
            if(count($list) < 3){
                $this->time[2] = 0;
            }
        }
        $this->setStamp();
    }

    //@new
    private function refresh(){
        $date_array = self::toDate($this->stamp);
        $this->date = array_slice($date_array, 0,3);
        $this->time = array_slice($date_array, 3,3);
        $this->setWeekDay();
        return $this;
    }

    private function setStamp(){
        $this->stamp = 0;
        for($i = $this->date[0] - 1; $i >= 0; $i--){
            $this->stamp += self::getYearDayQty($i);
        }
        for($i = 1, $j = $this->date[1]; $i < $j; $i++){
            $this->stamp += self::getMonthDayQty($i, $this->date[0]);
        }
        $this->stamp += $this->date[2];
        $this->stamp *= 24 * 3600;
        $this->stamp += $this->time[0] * 3600;
        $this->stamp += $this->time[1] * 60;
        $this->stamp += $this->time[2];
        $this->refresh();
    }

    //@new
    public function getStamp(){
        return $this->stamp;
    }

    public function clearDate(){
        $this->date = [0,0,0];
        $this->setStamp();
        return $this;
    }

    public function clearTime(){
        $this->time = [0,0,0];
        $this->setStamp();
        return $this;
    }

    /**
     * @param AkaDateTime $date
     * @return int
     */
    function compareTo(AkaDateTime $date){
        if($this->stamp == $date->stamp){
            return self::EQUALS;
        }
        else if($this->stamp > $date->stamp){
            return self::MORE_THAN;
        }
        else{
            return self::LESS_THAN;
        }
        return $this;
    }

    //@new
    /**
     * @param AkaDateTime $min
     * @param AkaDateTime $max
     * @return bool
     */
    function isBetween(AkaDateTime $min, AkaDateTime $max, bool $strict = false){
        if($strict){
            return $this->stamp > $min->stamp && $this->stamp < $max->stamp;
        }
        return $this->stamp >= $min->stamp && $this->stamp <= $max->stamp;
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    function isMoreThan(AkaDateTime $date){
        return $this->compareTo($date) == self::MORE_THAN;
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    function isLessThan(AkaDateTime $date){
        return $this->compareTo($date) == self::LESS_THAN;
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    function equals(AkaDateTime $date){
        return $this->compareTo($date) == self::EQUALS;
    }

    function isWeekEnd(){
       return $this->weekDay > 5 || $this->weekDay < 1;
    }

    //@new
    function add(AkaDateTime $date){
        $this->stamp += $date->getStamp();
        return $this->refresh();
    }

    //@new
    function sub(AkaDateTime $date){
        $this->stamp -= $date->getStamp();
        if($this->stamp < 0){
            $this->stamp = 0;
        }
        return $this->refresh();
    }

    //@new
    static function sum(AkaDateTime $date1, AkaDateTime $date2){
        $date = new AkaDateTime('00:00:00');
        return $date->add($date1)->add($date2);
    }

    //@new
    static function diff(AkaDateTime $date1, AkaDateTime $date2){
        $date = new AkaDateTime('00:00:00');
        return $date->add($date1)->sub($date2);
    }

    /**
     * @param int $sum
     * @return int[]
     */
    private static function toDate(int $sum){
        $seconds = $sum % 60;
        $minutes = floor($sum / 60);
        $hours = floor($minutes / 60);
        $minutes %= 60;
        $days = floor($hours / 24);
        $hours %= 24;
        $year = 0;
        $ttl = 0;

        while(true){
            $ttl += self::getYearDayQty($year);
            $year++;
            if($days - $ttl <= 365){
                if($days -  $ttl < 0){
                    $ttl -= self::getYearDayQty($year - 1);
                    $year--;
                }
                break;
            }
        }
        $days -= $ttl;
        $ttl = 0;
        for($month = 1; $month <= 12; $month++){
            $ttl += self::getMonthDayQty($month, $year);
            if($days - $ttl <= 0){
                $ttl -= self::getMonthDayQty($month, $year);
                break;
            }
        }
        $days -= $ttl;
        return [$year, $month, $days, $hours, $minutes, $seconds];
    }

    /**
     * @param int $year
     * @return int
     */
    static function isBissextileYear(int $year){
        return $year % 4 == 0;
    }

    /**
     * @param int $year
     * @return int
     */
    static function getYearDayQty(int $year){
        return self::isBissextileYear($year) ? 366 : 365;
    }

    /**
     * @param int $month
     * @param int $year
     * @return int
     */
    static function getMonthDayQty(int $month, int $year = 1){
        if($month < 1){
            return 0;
        }
        else if($month < 8){
            if($month % 2){
                return 31;
            }
            else if($month == 2){
                return self::isBissextileYear($year) ? 29 : 28;
            }
            return 30;
        }
        else{
            if($month % 2){
                return 30;
            }
            return 31;
        }
    }

    /**
     * @param string $date
     * @return false|int
     */
    static function isDate(string $date){
        return preg_match("/^[0-9]{4}(-[0-9]{2}){2}$/", $date);
    }

    /**
     * @param string $datetime
     * @return false|int
     */
    static function isDateTime(string $datetime){
        return preg_match("/^[0-9]{4}(-[0-9]{2}){2} [0-9]{2}(:[0-9]{2}){1,2}$/", $datetime);
    }

    /**
     * @param string $time
     * @return false|int
     */
    static function isTime(string $time){
        return preg_match("/^[0-9]{2}(:[0-9]{2}){1,2}$/", $time);
    }
}