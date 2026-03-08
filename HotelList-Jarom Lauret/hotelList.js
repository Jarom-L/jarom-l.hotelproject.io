// ============================================
// HOTEL LIST - MAIN PAGE FUNCTIONALITY
// ============================================
// This script manages the main hotel room control page
// It handles: room selection, guest input, button controls, and live list updates
// Dependencies: guestManager.js (must be loaded first)

// ============================================
// EVENT LISTENER - PAGE INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page with reusable guestManager functions
    guestManager.updateGuestCount();

    // ============================================
    // DOM ELEMENT REFERENCES
    // ============================================
    // Get references to all interactive elements on the page
    const guestNameInput = document.getElementById('guestNameInput');
    const roomSelect = document.getElementById('roomSelect');
    const addGuestButton = document.getElementById('addGuestButton');
    const removeGuestButton = document.getElementById('removeGuestButton');
    const clearGuestsButton = document.getElementById('clearGuestsButton');
    const lockRoomButton = document.getElementById('lockRoomButton');
    const guestListContainer = document.getElementById('guestList');

    // ============================================
    // FUNCTION: setInputMode(mode)
    // ============================================
    // Purpose: Configure the guest input based on selected action mode
    // Modes: 'add' = text names, 'remove' = numeric index, null = disabled prompt
    function setInputMode(mode) {
        guestNameInput.value = '';

        if (mode === 'add') {
            guestNameInput.disabled = false;
            guestNameInput.type = 'text';
            guestNameInput.placeholder = 'Enter guest name';
            guestNameInput.removeAttribute('min');
            return;
        }

        if (mode === 'remove') {
            guestNameInput.disabled = false;
            guestNameInput.type = 'number';
            guestNameInput.placeholder = 'Enter guest number to remove';
            guestNameInput.min = '1';
            return;
        }

        guestNameInput.disabled = true;
        guestNameInput.type = 'text';
        guestNameInput.placeholder = 'Select Add or Remove to continue';
        guestNameInput.removeAttribute('min');
    }

    // ============================================
    // FUNCTION: updateGuestListLive()
    // ============================================
    // Purpose: Fetches the current room data from localStorage and displays
    //          the guest list for the selected room
    // Updates: Guest list display, room status indicator
    function updateGuestListLive() {
        // Retrieve all room data from browser storage, or empty object if none exists
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the currently selected room from the dropdown
        const roomName = roomSelect.value;
        // Get the room object for the selected room, or create empty template if new
        const room = roomData[roomName] || { guests: [], status: 'unlocked' };

        // Clear the current guest list display to avoid duplicates
        guestListContainer.innerHTML = '';

        // Loop through each guest in the room and create a numbered list item
        room.guests.forEach((guest, index) => {
            const guestItem = document.createElement('p');
            // Display: "1. Guest Name", "2. Guest Name", etc.
            guestItem.textContent = `${index + 1}. ${guest}`;
            guestListContainer.appendChild(guestItem);
        });

        // Update the room status display (shows if room is locked or unlocked)
        const roomStatus = document.getElementById('roomStatus');
        if (roomStatus) {
            roomStatus.textContent = `Room Status: ${room.status}`;
        }
    }

    // ============================================
    // EVENT LISTENER: Guest Name Input (Enter Key)
    // ============================================
    // Purpose: Allows users to press Enter to add/remove guests instead of clicking buttons
    guestNameInput.addEventListener('keyup', (event) => {
        // Only trigger on Enter key press
        if (event.key === 'Enter') {
            // Check if "Add Guest" button is active
            if (addGuestButton.classList.contains('active')) {
                const roomName = roomSelect.value;
                // Call guestManager to add the guest
                guestManager.addGuest(guestNameInput.value.trim(), roomName);
                guestNameInput.value = '';
                updateGuestListLive();
            } 
            // Check if "Remove Guest" button is active
            else if (removeGuestButton.classList.contains('active')) {
                const roomName = roomSelect.value;
                // User enters guest number (1, 2, 3...) and we convert to array index (0, 1, 2...)
                const index = parseInt(guestNameInput.value.trim(), 10) - 1;
                // Call guestManager to remove the guest
                guestManager.removeGuest(index, roomName);
                guestNameInput.value = '';
                updateGuestListLive();
            }
        }
    });

    // ============================================
    // EVENT LISTENER: Add Guest Button
    // ============================================
    // Purpose: Activate "Add Guest" mode and focus input field
    addGuestButton.addEventListener('click', () => {
        // Mark this button as active
        addGuestButton.classList.add('active');
        // Deactivate the remove button (only one can be active at a time)
        removeGuestButton.classList.remove('active');
        // Switch input for guest name entry
        setInputMode('add');
        // Focus the input field so user can start typing immediately
        guestNameInput.focus();
    });

    // ============================================
    // EVENT LISTENER: Remove Guest Button
    // ============================================
    // Purpose: Activate "Remove Guest" mode and focus input field
    removeGuestButton.addEventListener('click', () => {
        // Mark this button as active
        removeGuestButton.classList.add('active');
        // Deactivate the add button
        addGuestButton.classList.remove('active');
        // Switch input for guest index entry
        setInputMode('remove');
        // Focus the input field
        guestNameInput.focus();
    });

    // ============================================
    // EVENT LISTENER: Clear Guests Button
    // ============================================
    // Purpose: Removes all guests from the selected room
    if (clearGuestsButton) {
        clearGuestsButton.addEventListener('click', () => {
            // Get the currently selected room
            const roomName = roomSelect.value;
            // Call guestManager to clear all guests from this room
            guestManager.clearGuests(roomName);
            // Update the display to show empty list
            updateGuestListLive();
            // Focus back on the input field
            guestNameInput.focus();
        });
    }

    // ============================================
    // EVENT LISTENER: Lock/Unlock Room Button
    // ============================================
    // Purpose: Toggles room lock status (locked = no guests can be added/removed)
    lockRoomButton.addEventListener('click', () => {
        // Get the currently selected room
        const roomName = roomSelect.value;
        // Call guestManager to toggle lock status
        guestManager.toggleRoomLock(roomName);
        // Update the display to show new lock status
        updateGuestListLive();
    });

    // ============================================
    // EVENT LISTENER: Room Selection Dropdown
    // ============================================
    // Purpose: Updates the display whenever the user changes which room they're viewing
    roomSelect.addEventListener('change', updateGuestListLive);

    // ============================================
    // INITIALIZATION
    // ============================================
    // Start in neutral mode until Add/Remove is selected
    setInputMode(null);
    // Perform initial update of the guest list when page loads
    updateGuestListLive();
});

// ============================================
// CONFIGURATION: Room Occupancy Limits
// ============================================
// Defines maximum number of guests allowed in each room
// If a room reaches this limit, no more guests can be added
const roomOccupancies = {
    'Room 1': 4,
    'Room 2': 4,
    'Room 3': 4,
    'Room 4': 4,
    'Room 5': 4,
    'Room 6': 4,
};

// ============================================
// FUNCTION: checkRoomOccupancy(roomName)
// ============================================
// Purpose: Check if a room has reached its occupancy limit
// Parameters:
//   - roomName: The name of the room to check (e.g., 'Room 1')
// Returns: true if room can accept more guests, false if at limit
// Note: This function is currently not used (guestManager handles this internally)
function checkRoomOccupancy(roomName) {
    // Retrieve the guest list from storage
    const guestList = JSON.parse(localStorage.getItem('guestList')) || [];
    // Count how many guests are in this specific room
    const currentOccupancy = guestList.filter(guest => guest.room === roomName).length;
    // Check if we've reached the limit for this room
    if (currentOccupancy >= roomOccupancies[roomName]) {
        alert(`Occupancy limit for ${roomName} exceeded!`);
        return false;
    }
    return true;
}

