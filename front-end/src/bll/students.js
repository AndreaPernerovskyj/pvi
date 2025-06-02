// Initial page loading
function loadStudentsPage(url) {
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            content.innerHTML = html;
            loadStudentsTable(currentPage);
            document.querySelector(".add-students-btn").addEventListener("click", (e) => {
                e.preventDefault();
                addStudentsModal();

                document.querySelector(".add-student-modal-container").classList.add("show");
                const addEditModalHead = document.querySelector(".add-edit-modal-header");
                addEditModalHead.innerHTML = "Add Students";
                addEditModalHead.focus();
            });
            const mainCheckBox = document.querySelector(".main-checkbox");
            mainCheckBox.addEventListener("change", (e) => {
                const table = e.target.closest("tbody");
                for (let i = 1; i < table.children.length; i++) {
                    checkBoxChanged(table.children[i], !!mainCheckBox.checked);
                }
            })
            document.querySelector(".delete-selected-btn").addEventListener("click", e => {
                deleteSelectedStudents();
            })

            initiatePagination(currentPage);
        })
        .catch((error) => console.error("Error loading students.html:", error));
}

function loadStudentsTable(page) {
    numberOfChecked = 0;
    studentdal.getStudents(page)
        .then(data => {
            const tableBody = document.querySelector(".students-table-body");
            while (tableBody.rows.length > 1) {
                tableBody.deleteRow(1);
            }

            state.students = [...data];
            state.students.forEach((student) => {
                createNewRow(student);
            });
        })
        .catch(error => {
            console.error("Error while trying to get students:", error);
        });
}

// Pagination
function initiatePagination(current) {
    document.querySelector(".pagination-pages").innerHTML="";
    fetch("http://localhost/project/back-end/students/pagination").then(response => {
        return response.json();
    }).then(data => {
        state.studentsPagination = {...data};
        const prevButton = document.querySelector(".prev");
        const nextButton = document.querySelector(".next");
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage === initialTotalPages;

        prevButton.addEventListener("click", (e) => {
            const active = document.querySelector(".pagination-btn.active")
            moveToNextPagePagination(active.previousElementSibling, --currentPage, prevButton, nextButton);
        })

        nextButton.addEventListener("click", e => {
            const active = document.querySelector(".pagination-btn.active")
            moveToNextPagePagination(active.nextElementSibling, ++currentPage, prevButton, nextButton);
        })

        const paginationPages = document.querySelector(".pagination-pages");
        initialTotalPages = Math.ceil(state.studentsPagination.totalCount / state.studentsPagination.pageSize);
        for(let i = 1; i <= initialTotalPages;i++) {
            const button = document.createElement("button");
            button.classList.add("pagination-btn");
            if(i === current) button.classList.add("active");
            button.title="Page " + i;
            button.id = String(i);
            button.innerText = String(i);
            button.addEventListener("click", e => {
                currentPage = i;
                moveToNextPagePagination(button, currentPage, prevButton, nextButton);
            })

            paginationPages.append(button);
        }
    })
}

function moveToNextPagePagination(button, i, prevButton, nextButton) {
    const activePaginationItem = document.querySelector(".pagination-btn.active")
    if(i === Number(activePaginationItem.id)) {
        return;
    }

    prevButton.disabled = i <= 1;
    nextButton.disabled = i === initialTotalPages;

    loadStudentsTable(i);
    activePaginationItem.classList.remove("active");
    button.classList.add("active");
}

function checkIsCurrentTotalPagesLess() {
    let currentTotalPages = Math.ceil(state.studentsPagination.totalCount / state.studentsPagination.pageSize);

    if(currentTotalPages < initialTotalPages) {
        if(currentPage === initialTotalPages) {
            loadStudentsTable(--currentPage)
            initiatePagination(currentPage);
        }
        else {
            loadStudentsTable(Number(currentPage));
            initiatePagination(currentPage);
        }
    }
    else {
        loadStudentsTable(currentPage);
    }
}

// For adding a new student
function addStudentsModal() {
    $(".add-edit-modal-header").text("Add Students");
    const createStudentForm = $(".create-student-form");

    $(".modal-exit-btn").off("click").on("click", (e) => {
        e.preventDefault();
        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });
    $(".modal-close-btn").off("click").on("click", e => {
        e.preventDefault();

        const isEmpty = createStudentForm.find("input").toArray().slice(1).some(input => !input.value.trim());

        if (!isEmpty) {
            createStudent(e);
            return;
        }

        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });

    createStudentForm.off("submit").on("submit", createStudent);
}

function createStudent(e) {
    e.preventDefault();

    const createStudentForm = document.querySelector(".create-student-form");
    const formData = new FormData(createStudentForm);
    const studentDataValidation = {
        groupname: formData.get('group'),
        firstName: formData.get('first-name').trim(),
        lastName: formData.get('last-name').trim(),
        birthday: formData.get('birthday'),
        gender: formData.get('gender')
    };
    if (!validateForm(studentDataValidation)) return;
    const newStudentData = {
        firstName: studentDataValidation.firstName,
        lastName: studentDataValidation.lastName,
        birthday: studentDataValidation.birthday,
        groupname: studentDataValidation.groupname,
        gender: studentDataValidation.gender,
    };
    studentdal.addStudent(newStudentData)
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                return Promise.reject(data);
            }

            return data;
        })
        .then(data => {
            if(state.students.length == state.studentsPagination.pageSize) {
                loadStudentsTable(++currentPage)
                initiatePagination(currentPage);
            }
            else {
                createNewRow(data.student);
                state.students.push(data.student)
            }
            createStudentForm.reset();
            $(".add-student-modal-container").removeClass("show");
            showPopup("Successfully added a new student", true);
        })
        .catch(error => {
            validateServerSideErrors(error);
        });
}

function createNewRow(student_data) {
    const studentsTableBody = document.querySelector(".students-table-body");

    const isChecked = document.querySelector(".main-checkbox").checked;
    if (isChecked) numberOfChecked++;
    numberOfCheckedChanged()

    const tr = document.createElement("tr");
    tr.id = student_data.id;

    tr.innerHTML = `
    <td>
        <input type="checkbox" class="student-checkbox" aria-label="Select student ${student_data.name}" ${isChecked ? "checked" : ""}>
    </td>
    <td>${student_data.groupname}</td>
    <td>${student_data.firstName + " " + student_data.lastName}</td>
    <td>${student_data.gender}</td>
    <td>${student_data.birthday}</td>
    <td class="status-cell">
        <div class="student-status-container">
            <div class="student-status ${student_data.status.toLowerCase() === "online" ? "online" : ""}"></div>
        </div>
    </td>
    <td class="options-td">
        <button class="edit_btn" ${!isChecked ? "disabled" : ""} aria-label="Edit student ${student_data.name}">
            <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="trash_btn" ${!isChecked ? "disabled" : ""} aria-label="Delete student ${student_data.name}">
            <i class="fa-solid fa-trash"></i>
        </button>
    </td>
`;

    const inputCheckbox = tr.querySelector(".student-checkbox");
    inputCheckbox.addEventListener("change", (e) => {
        checkBoxChanged(e.target.closest("tr"), e.target.checked);
    });

    const buttonEdit = tr.querySelector(".edit_btn");
    buttonEdit.addEventListener("click", edit_student_modal);

    const buttonTrash = tr.querySelector(".trash_btn");
    buttonTrash.addEventListener("click", (e) => {
        shouldDeleteStudent(e, `${student_data.firstName} ${student_data.lastName}`, student_data.id);
    });

    studentsTableBody.appendChild(tr);
}

// Deleting a student
function shouldDeleteStudent(outer_e, name, id) {
    const shouldDeleteModal = $(".should-delete-student-modal");
    const modalExitDeleteBtn = $(".modal-exit-delete-btn");
    shouldDeleteModal.addClass('show');
    $("#delete-student-id").val(id);
    $(".should-delete-text").focus().text(`Do you really want to delete ${name} student?`);

    const yesClickHandler = () => {
        deleteStudent(shouldDeleteModal[0], outer_e, id);
        cleanup();
    };

    const noClickHandler = () => {
        shouldDeleteModal.removeClass('show');
        cleanup();
    };

    const shouldDelete = $(".should-delete-yes");
    const shouldNotDelete = $(".should-delete-no");

    shouldDelete.on("click", yesClickHandler);
    shouldNotDelete.on("click", noClickHandler);
    modalExitDeleteBtn.on("click", noClickHandler);

    function cleanup() {
        shouldDelete.off("click", yesClickHandler);
        shouldNotDelete.off("click", noClickHandler);
        modalExitDeleteBtn.off("click", noClickHandler);
    }
}

function deleteStudent(shouldDeleteModal, e, id) {
    const td_element = e.target.closest("tr");
    td_element.remove();

    studentdal.deleteById(id)
        .then(response => {
            if (response.ok) {
                state.students = state.students.filter(student => student.id !== id);
                numberOfChecked--;
                numberOfCheckedChanged();
                shouldDeleteModal.classList.remove('show');
                showPopup("Successfully deleted", true);

                state.studentsPagination.totalCount--;
                checkIsCurrentTotalPagesLess();
            } else {
                console.error('Failed to delete student');
                showPopup("Not deleted", false);
            }
        })
        .catch(error => {
            console.error('Error during delete request:', error);
        });
}

async function deleteSelectedStudents() {
    const table = document.querySelector(".students-table-body");
    const deletePromises = [];

    for (let i = table.children.length - 1; i > 0; i--) {
        const tr_element = table.children[i];
        if (!tr_element.querySelector(".student-checkbox").checked) continue;

        const deletePromise = studentdal.deleteById(tr_element.id)
            .then((response) => {
                if (response.ok) {
                    tr_element.remove();
                    state.students = state.students.filter(student => student.id !== tr_element.id);
                    numberOfChecked--;
                    numberOfCheckedChanged();
                    state.studentsPagination.totalCount--;
                } else {
                    console.error('Failed to delete student');
                }
            })
            .catch(error => {
                console.error('Error during delete request:', error);
            });

        deletePromises.push(deletePromise);
    }

    await Promise.all(deletePromises);

    checkIsCurrentTotalPagesLess();
}

// For editing a student
function edit_student_modal(event) {
    const td_element = event.target.closest("tr");
    const student = state.students.find(item => item.id === Number(td_element.id));
    const addEditModalHeader = $(".add-edit-modal-header")
    addEditModalHeader.text("Edit student " + student.firstName + " " + student.lastName);

    $("#student-id").val(student.id);
    $("#group").val(student.groupname);
    $("#first-name").val(student.firstName);
    $("#last-name").val(student.lastName);
    $("#gender").val(student.gender);
    $("#birthday").val(student.birthday);

    $(".submit-modal-form-btn").text("Submit");
    $(".add-student-modal-container").addClass("show");
    addEditModalHeader.focus();

    const createStudentForm = $(".create-student-form");
    createStudentForm.off("submit");

    createStudentForm.on("submit", (e) => {
        edit_student_submit(student, e);
    });

    $(".modal-close-btn").off("click").on("click", e => {
        const isEmpty = createStudentForm.find("input").toArray().slice(1).some(input => !input.value.trim());

        if (!isEmpty) {
            edit_student_submit(student, e);
            return;
        }

        createStudentForm.off("submit").on("submit", createStudent);
        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });

    // Modal exit button handler
    $(".modal-exit-btn").off("click").on("click", (e) => {
        e.preventDefault();
        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });
}

function edit_student_submit(student, e) {
    e.preventDefault();
    const createStudentForm = document.querySelector(".create-student-form");
    const formData = new FormData(createStudentForm);

    // Get values
    const studentData = {
        groupname: formData.get('group'),
        firstName: formData.get('first-name').trim(),
        lastName: formData.get('last-name').trim(),
        birthday: formData.get('birthday'),
        gender: formData.get('gender')
    };

    if (!validateForm(studentData)) return;

    fetch(`http://localhost/project/back-end/students?id=${student.id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        })
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                return Promise.reject(data);
            }

            return data;
    })
        .then(data => {
            createStudentForm.reset();

            student.firstName = studentData.firstName;
            student.lastName = studentData.lastName;
            student.groupname = studentData.groupname;
            student.gender = studentData.gender;
            student.birthday = studentData.birthday;

            $(".add-student-modal-container").removeClass("show");
            const studentRow = $(`tr[id="${student.id}"]`);
            studentRow.find("td:nth-child(2)").text(student.groupname);
            studentRow.find("td:nth-child(3)").text(student.firstName + " " + student.lastName);
            studentRow.find("td:nth-child(4)").text(student.gender);
            studentRow.find("td:nth-child(5)").text(student.birthday);

            createStudentForm.off("submit").on("submit", createStudent);
        })
        .catch(error => {
            validateServerSideErrors(error);
        });
}

// Helper functions
function checkBoxChanged(tr, shouldCheck) {
    const options_td = tr.querySelector(".options-td");
    const button_trash = options_td.querySelector(".trash_btn")
    const button_edit = options_td.querySelector(".edit_btn")
    const checkbox = tr.querySelector(".student-checkbox");

    const mainCheckBox = document.querySelector(".main-checkbox");
    if (shouldCheck) {
        button_trash.disabled = false;
        button_edit.disabled = false;
        checkbox.checked = true;

        numberOfChecked++;
        if (numberOfChecked === state.students.length) {
            mainCheckBox.checked = true;
        }
    } else {
        button_trash.disabled = true;
        button_edit.disabled = true;
        checkbox.checked = false;
        mainCheckBox.checked = false;

        numberOfChecked--;
    }

    numberOfCheckedChanged();
}

function numberOfCheckedChanged() {
    if (numberOfChecked >= 2) {
        document.querySelector(".delete-selected-btn").style.display = "block";
    } else {
        document.querySelector(".delete-selected-btn").style.display = "none";
    }
}

// Validations
function validateForm({ groupname, firstName, lastName, birthday, gender }) {
    $(".error-message").text(""); // Clear previous errors

    let isValid = true;

    function addValidationListener(inputId, errorId, validator) {
        const input = $(inputId);
        input.off("input").on("input", function () {
            if (validator($(this).val().trim())) {
                $(errorId).text("");
                input.css("border-color", "");
            }
        });
    }

    // Validate first name
    let regex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\s]+$/;
    //let regexBadInput = /\bselect\s*/i;
    let regexBadInput = /\bselect\b/i;
    if (!firstName) {
        $("#first-name-error").text("First name is required.");
        $("#first-name").css("border-color", "red");
        isValid = false;
    }
    else if(regexBadInput.test(firstName)) {
        $("#first-name-error").text("Bad request bro, don't hack my data base!");
        $("#first-name").css("border-color", "red");
        isValid = false;
    }
    else if (!regex.test(firstName)) {
        $("#first-name-error").text("Only letters and spaces allowed.");
        $("#first-name").css("border-color", "red");
        isValid = false;
    }
    addValidationListener("#first-name", "#first-name-error", val => regex.test(val) && val !== "");

    // Validate last name
    if (!lastName) {
        $("#last-name-error").text("Last name is required.");
        $("#last-name").css("border-color", "red");
        isValid = false;
    }
    else if(regexBadInput.test(lastName)) {
        $("#last-name-error").text("Bad request bro, don't hack data base!");
        $("#last-name").css("border-color", "red");
        isValid = false;
    }
    else if (!regex.test(lastName)) {
        $("#last-name-error").text("Only letters and spaces allowed.");
        $("#last-name").css("border-color", "red");
        isValid = false;
    }
    addValidationListener("#last-name", "#last-name-error", val => regex.test(val) && val !== "");

    // Validate birthday
    if (!birthday) {
        $("#birthday-error").text("Birthday is required.");
        $("#birthday").css("border-color", "red");
        isValid = false;
    } else {
        const birthDate = new Date(birthday);
        const today = new Date();
        if (birthDate >= today) {
            $("#birthday-error").text("Birthday must be in the past.");
            $("#birthday").css("border-color", "red");
            isValid = false;
        }
        else if (birthDate.getFullYear() <= 1900) {
            $("#birthday-error").text("Birthday must be after the year 1900.");
            $("#birthday").css("border-color", "red");
            isValid = false;
        }
    }
    addValidationListener("#birthday", "#birthday-error", val => {
        const birthDate = new Date(val);
        const today = new Date();
        return birthDate < today;
    });

    return isValid;
}

function validateServerSideErrors(error) {
    const serverSideErrorSpan = document.querySelector("#serverside-error");

    if (error.errors?.duplicate) {
        serverSideErrorSpan.innerText = error.errors.duplicate;
    }

    if (error.errors?.firstName) {
        document.querySelector("#first-name-error").innerText = error.errors.firstName;
        document.querySelector("#first-name").style.borderColor = "red";
    }

    if (error.errors?.lastName) {
        document.querySelector("#last-name-error").innerText = error.errors.lastName;
        document.querySelector("#last-name").style.borderColor = "red";
    }
}

function cleanValidation() {
    const firstNameError = $("#first-name-error");
    const firstName = $("#first-name");
    const lastNameError = $("#last-name-error");
    const lastName = $("#last-name");
    const birthdayError = $("#birthday-error");
    const birthday = $("#birthday");

    document.getElementById("serverside-error").innerText="";
    firstNameError.text("");
    firstName.css("border-color", "#cccccc");
    firstNameError.text("");
    firstName.css("border-color", "#cccccc");
    lastNameError.text("");
    lastName.css("border-color", "#cccccc");
    lastNameError.text("");
    lastName.css("border-color", "#cccccc");
    birthdayError.text("");
    birthday.css("border-color", "#cccccc");
    birthdayError.text("");
    birthday.css("border-color", "#cccccc");
}