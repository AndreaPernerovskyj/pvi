let state = {
    studentsPagination: null,
    students: [
          ],
    profileInfo: {

    },
    notifications: [
    ],
    messagesPage: {
        chatRooms: [
        ],
        selectedMembers: [],
        messageInputText: "",
        currentChatRoom: null
    },
    socket: null
};

// Constants
let initialTotalPages = 0;
let numberOfChecked = 0
let currentPage = 1;

this.window.state = state;