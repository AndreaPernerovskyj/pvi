<?php

class StudentModel
{
    private $connection;
    private $pageSize = 9;

    public  function __construct($connection) {
        $this->connection = $connection;
    }

    public function getPaginationInfo() {
        $query = "SELECT COUNT(*) FROM students";
        $result = $this->connection->query($query);
        $row = $result->fetch_row();
        $totalCount = $row[0];

        $obj = [
            "pageSize" => $this->pageSize,
            "totalCount" => (int)$totalCount
        ];

        return $obj;
    }

    public function getStudents($currentPage) {
        $totalCount = $this->getPaginationInfo()["totalCount"];
        $totalPages = ceil($totalCount / $this->pageSize);

        if ($currentPage < 1 || $currentPage > $totalPages) {
            $currentPage = 1;
        }

        $offset = (int)(($currentPage - 1) * $this->pageSize);
        $limit = (int)$this->pageSize;

        $query = "SELECT * FROM students LIMIT $offset, $limit";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $students = [];

        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }

        return $students;
    }

    public function getStudentById($id) {
        $sql = "SELECT * FROM students WHERE id = $id";
        return $this->connection->query($sql)->fetch_assoc();
    }

    public function insertStudent($data) {
        $sql = "INSERT INTO students (firstName, lastName, birthday, groupname, gender) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->connection->prepare($sql);
        $success = $stmt->execute([
            $data['firstName'],
            $data['lastName'],
            $data['birthday'],
            $data['groupname'],
            $data['gender']
        ]);

        if ($success) {
            $studentId = $this->connection->insert_id;
            return $this->getStudentById($studentId);
        }

        return false;
    }

    public function findStudentByNameAndBirthday($firstName, $lastName, $birthday)
    {
        $stmt = $this->connection->prepare("SELECT id FROM students WHERE firstName = ? AND lastName = ? AND birthday = ?");
        $stmt->bind_param("sss", $firstName, $lastName, $birthday);
        $stmt->execute();

        if ($stmt->fetch()) {
            $stmt->close();
            return true; // або true
        } else {
            $stmt->close();
            return false;
        }
    }

    public function updateStudent($id, $data) {
        $sql = "UPDATE students 
            SET firstName = ?, lastName = ?, birthday = ?, groupname = ?, gender = ?
            WHERE id = ?";

        $stmt = $this->connection->prepare($sql);
        $success = $stmt->execute([$data['firstName'],
            $data['lastName'],
            $data['birthday'],
            $data['groupname'],
            $data['gender'],
            $id]);

        if ($success) {
            return $this->getStudentById($id);
        }

        return false;
    }

    public function deleteStudent($id) {
        $stmt = $this->connection->prepare("DELETE FROM students WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->affected_rows > 0;
    }

}