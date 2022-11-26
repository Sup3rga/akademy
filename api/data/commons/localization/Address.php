<?php


class Address extends Data
{
    private int $id, $town;
    private string $street;

    public function getId(): int
    {
        return $this->id;
    }

    public function getTown(): int
    {
        return $this->town;
    }

    public function setTown(int $town): void
    {
        $this->town = $town > 0 ? $town : null;
    }

    public function getStreet(): string
    {
        return $this->street;
    }

    public function setStreet(string $street): void
    {
        $this->street = $street;
    }

    public static function fromString() : ?Address {
        $r = null;

        return $r;
    }


    function save()
    {
        $r = "Invalid street name given";
        if(CheckIf::isFormalAddress($this->street)) return $r;
        $townless = Town::getById($this->town) == null;

    }

    function delete()
    {}

    function hydrate(array $data)
    {

    }

    static function fetchAll()
    {
        return [];
    }
}