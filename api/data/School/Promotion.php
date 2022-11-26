<?php


class Promotion extends Data
{
    protected int $id = 0, $classRoomID = 0;
    /**
     * @var array
     */
    protected array $students = [];

    function save(){}

    function delete(){}

    function hydrate(array $data){

    }

    static function fetchAll()
    {
        $db = Storage::Connect()->prepare("select id from salle_classe");
    }

    static function getById(int $id)
    {
        // TODO: Implement getById() method.
    }
}