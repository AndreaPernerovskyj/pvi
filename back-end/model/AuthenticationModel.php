<?php

class AuthenticationModel
{
    private $connection;

    public  function __construct($connection) {
        $this->connection = $connection;
    }

    public function getStudentByCredentials($firstName, $lastName, $birthday)
    {
        $stmt = $this->connection->prepare("select * from students where firstName = ? and lastName = ? and birthday = ?");
        $stmt->bind_param("sss", $firstName, $lastName, $birthday);
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }
}