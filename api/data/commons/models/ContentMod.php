<?php

interface ContentMod
{
    const WITH_SCHOOL_DATA = 0;
    const WITHOUT_DATA = 3;
    const WITH_TOWN_DATA = 1;
    const WITH_DEPARTMENT_DATA = 2;
    static function setContentMod(int $mod);
    static function getContentMod() : int;
}