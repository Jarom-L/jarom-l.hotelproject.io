// ============================================
// GUEST MANAGER - CORE FUNCTIONALITY MODULE
// ============================================
// This is a reusable module that handles all guest management logic
// It manages: adding/removing guests, room locking, guest logging, and notifications
// Used by: hotelList.js (main page) and Hotel-Listing-History.html (history page)

// ============================================
// GUEST MANAGER OBJECT - Main Module
// ============================================
const guestManager = {
    // ============================================
    // METHOD: addGuest(guestName, roomName)
    // ============================================
    // Purpose: Add a new guest to a specific room
    // Parameters:
    //   - guestName: The name of the guest to add
    //   - roomName: Which room to add the guest to
    // Checks: Room lock status and occupancy limit
    // Actions: Updates localStorage, logs action, updates guest count
    addGuest: function (guestName, roomName) {
        // Get all rooms data from localStorage, or create empty object if first time
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the specific room, or create a new room template if it doesn't exist
        const room = roomData[roomName] || { guests: [], status: 'unlocked' };

        // Check if room is locked - if so, prevent adding guests
        if (room.status === 'locked') {
            this.showNotification(`${roomName} is locked. Cannot add guests.`, 'warning');
            return;
        }

        // Check if room has reached maximum occupancy
        if (room.guests.length >= roomOccupancies[roomName]) {
            this.showNotification(`Occupancy limit for ${roomName} exceeded!`, 'warning');
            return;
        }

        // Add the guest to the room's guest array
        room.guests.push(guestName);
        // Update the room in the rooms data object
        roomData[roomName] = room;
        // Save the updated data back to localStorage
        localStorage.setItem('rooms', JSON.stringify(roomData));
        // Log this action to the action history
        this.logGuestAction('add', guestName, roomName);
        // Update the total guest count display
        this.updateGuestCount();
    },

    // ============================================
    // METHOD: removeGuest(index, roomName)
    // ============================================
    // Purpose: Remove a specific guest from a room by their position number
    // Parameters:
    //   - index: The array index of the guest to remove (0 = first guest)
    //   - roomName: Which room to remove the guest from
    // Checks: Room lock status and valid guest index
    // Actions: Updates localStorage, logs action, updates guest count
    removeGuest: function (index, roomName) {
        // Get all rooms data from localStorage
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the specific room
        const room = roomData[roomName] || { guests: [], status: 'unlocked' };

        // Check if room is locked - if so, prevent removing guests
        if (room.status === 'locked') {
            this.showNotification(`${roomName} is locked. Cannot remove guests.`, 'warning');
            return;
        }

        // Validate that the index is within the guest list bounds
        if (index >= 0 && index < room.guests.length) {
            // Remove the guest at the specified index and store their name
            const removedGuest = room.guests.splice(index, 1)[0];
            // Update the room in the rooms data object
            roomData[roomName] = room;
            // Save the updated data back to localStorage
            localStorage.setItem('rooms', JSON.stringify(roomData));
            // Log this removal action
            this.logGuestAction('remove', removedGuest, roomName);
            // Update the total guest count display
            this.updateGuestCount();
        } else {
            // Show error if user enters invalid guest number
            this.showNotification('Invalid guest number for removal.', 'warning');
        }
    },

    // ============================================
    // METHOD: clearGuests(roomName)
    // ============================================
    // Purpose: Remove all guests from a specific room at once
    // Parameters:
    //   - roomName: Which room to clear
    // Checks: Room lock status
    // Actions: Updates localStorage, logs action
    clearGuests: function (roomName) {
        // Get all rooms data from localStorage
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the specific room
        const room = roomData[roomName] || { guests: [], status: 'unlocked' };

        // Check if room is locked - if so, prevent clearing guests
        if (room.status === 'locked') {
            this.showNotification(`${roomName} is locked. Cannot clear guests.`, 'warning');
            return;
        }

        // Clear the guests array (set it to empty)
        room.guests = [];
        // Update the room in the rooms data object
        roomData[roomName] = room;
        // Save the updated data back to localStorage
        localStorage.setItem('rooms', JSON.stringify(roomData));
        // Log this clear action (guest = null because all were cleared)
        this.logGuestAction('clear', null, roomName);
    },

    // ============================================
    // METHOD: toggleRoomLock(roomName)
    // ============================================
    // Purpose: Lock or unlock a room (prevents guest modifications when locked)
    // Parameters:
    //   - roomName: Which room to lock/unlock
    // Actions: Updates localStorage, shows notification
    toggleRoomLock: function (roomName) {
        // Get all rooms data from localStorage
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the specific room
        const room = roomData[roomName] || { guests: [], status: 'unlocked' };

        // Toggle the lock status: locked -> unlocked, unlocked -> locked
        room.status = room.status === 'locked' ? 'unlocked' : 'locked';
        // Update the room in the rooms data object
        roomData[roomName] = room;
        // Save the updated data back to localStorage
        localStorage.setItem('rooms', JSON.stringify(roomData));
        // Show notification with the new lock status
        this.showNotification(`${roomName} is now ${room.status}.`, 'info');
    },

    // ============================================
    // METHOD: updateGuestCount()
    // ============================================
    // Purpose: Count all guests across all rooms and update the display
    // Actions: Updates the "Total Guests" badge on the page
    updateGuestCount: function () {
        // Get all rooms data from localStorage
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Calculate total guests: loop through all rooms and sum up their guest counts
        const totalGuests = Object.values(roomData).reduce((count, room) => count + room.guests.length, 0);
        // Get the HTML element that displays the total guest count
        const guestCountElement = document.getElementById('guestCount');
        // Update the display with the new total
        if (guestCountElement) {
            guestCountElement.textContent = `Total Guests: ${totalGuests}`;
        }
    },

    // ============================================
    // METHOD: showNotification(message, type)
    // ============================================
    // Purpose: Display a custom in-page notification box (instead of browser alerts)
    // Parameters:
    //   - message: The text to display in the notification
    //   - type: 'info', 'warning', or 'success' (affects styling/color)
    // Actions: Shows styled notification popup
    showNotification: function (message, type = 'info') {
        // Get the notification box HTML element
        const alertBox = document.getElementById('customAlert');
        // Get the element that holds the notification message text
        const alertMessage = document.getElementById('customAlertMessage');

        // If elements don't exist, log to console instead (fallback)
        if (!alertBox || !alertMessage) {
            console.warn(message);
            return;
        }

        // Set the notification message text
        alertMessage.textContent = message;
        // Remove any existing classes (hidden, info, warning, success)
        alertBox.classList.remove('hidden', 'info', 'warning', 'success');
        // Add the new type class (determines the color/style)
        alertBox.classList.add(type);
        // Set accessibility attribute to make screen readers see it
        alertBox.setAttribute('aria-hidden', 'false');
    },

    // ============================================
    // METHOD: hideNotification()
    // ============================================
    // Purpose: Hide the custom notification box
    // Actions: Hides notification and clears styling
    hideNotification: function () {
        // Get the notification box HTML element
        const alertBox = document.getElementById('customAlert');
        if (!alertBox) {
            return;
        }

        // Add 'hidden' class to hide the notification
        alertBox.classList.add('hidden');
        // Remove all type classes (info, warning, success)
        alertBox.classList.remove('info', 'warning', 'success');
        // Set accessibility attribute to hide from screen readers
        alertBox.setAttribute('aria-hidden', 'true');
    },

    // ============================================
    // METHOD: logGuestAction(action, guest, roomName)
    // ============================================
    // Purpose: Record a guest action (add, remove, clear) with timestamp
    // Parameters:
    //   - action: 'add', 'remove', or 'clear'
    //   - guest: Name of guest (or null if clearing)
    //   - roomName: Which room the action occurred in
    // Actions: Saves to localStorage and updates page display
    logGuestAction: function (action, guest, roomName) {
        // Get the action history log from localStorage, or create empty array
        const logList = JSON.parse(localStorage.getItem('guestLog')) || [];
        // Get current date/time as a formatted string
        const timestamp = new Date().toLocaleString();
        // Create human-readable text describing the action
        const actionText =
            action === 'add'
                ? `Added: ${guest} to ${roomName}`
                : action === 'remove'
                ? `Removed: ${guest} from ${roomName}`
                : `Cleared all guests from ${roomName}`;
        // Add this log entry to the log list
        logList.push({ action: actionText, timestamp });
        // Save the updated log list to localStorage
        localStorage.setItem('guestLog', JSON.stringify(logList));

        // Also add the log entry to the page display (if log container exists)
        const logContainer = document.getElementById('logContainer');
        if (logContainer) {
            // Create a new paragraph element for this log entry
            const logItem = document.createElement('p');
            // Set the text to timestamp + action description
            logItem.textContent = `${timestamp} - ${actionText}`;
            // Append it to the log container on the page
            logContainer.appendChild(logItem);
        }
    },

    // ============================================
    // METHOD: loadGuestsToHistory()
    // ============================================
    // Purpose: Load and display guest data on the history page
    // Used by: Hotel-Listing-History.html on page load
    // Actions: Displays guest list by room and action history log
    loadGuestsToHistory: function () {
        // Get all rooms data from localStorage
        const roomData = JSON.parse(localStorage.getItem('rooms')) || {};
        // Get the history container element on the page
        const historyContainer = document.getElementById('historyContainer');
        if (historyContainer) {
            // Set header
            historyContainer.innerHTML = '<h1>Guest History</h1>';
            // Loop through each room in the data
            Object.entries(roomData).forEach(([roomName, room]) => {
                // Create a div for this room's information
                const roomDiv = document.createElement('div');
                // Set the room heading with name and lock status
                roomDiv.innerHTML = `<h3>${roomName} (${room.status})</h3>`;
                // Create a list element for the guests
                const guestList = document.createElement('ul');
                // Add each guest to the list
                room.guests.forEach(guest => {
                    const guestItem = document.createElement('li');
                    guestItem.textContent = guest;
                    guestList.appendChild(guestItem);
                });
                // Add the guest list to the room div
                roomDiv.appendChild(guestList);
                // Add the room div to the history container
                historyContainer.appendChild(roomDiv);
            });
        }

        // Now load the action log history
        const logList = JSON.parse(localStorage.getItem('guestLog')) || [];
        const logContainer = document.getElementById('logContainer');
        if (logContainer) {
            // Set header
            logContainer.innerHTML = '<h2>Guest Action Log</h2>';
            // Loop through each log entry
            logList.forEach(log => {
                // Create a paragraph for this log entry
                const logItem = document.createElement('p');
                // Set the text to timestamp + action
                logItem.textContent = `${log.timestamp} - ${log.action}`;
                // Append to the log container
                logContainer.appendChild(logItem);
            });
        }
    }
};

// ============================================
// UTILITY FUNCTION: clearActionHistory()
// ============================================
// Purpose: Delete all action history logs (but keep guest data)
// Called by: "Clear All Action History" button on history page
function clearActionHistory() {
    // Remove the guestLog from localStorage entirely
    localStorage.removeItem('guestLog');
    // Get the log container element
    const logContainer = document.getElementById('logContainer');
    // Reset it to just show the header
    if (logContainer) {
        logContainer.innerHTML = '<h2>Guest Action Log</h2>';
    }
}

// ============================================
// UTILITY FUNCTION: clearLocalStorage()
// ============================================
// Purpose: Delete ALL data (both guests and logs)
// Called by: "Clear Local Storage" button on history page
function clearLocalStorage() {
    // Remove everything from localStorage
    localStorage.clear();
    // Log to console for debugging
    console.log('Local storage cleared');
}

// ============================================
// EVENT LISTENER - HISTORY PAGE INITIALIZATION
// ============================================
// This code runs when the history page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load and display the guest list and action log from storage
    guestManager.loadGuestsToHistory();
    
    // Get the log container element
    const logContainer = document.getElementById('logContainer');
    // Get the list of all logged actions from storage
    const logList = JSON.parse(localStorage.getItem('guestLog')) || [];
    // Get the close button for the notification box
    const closeCustomAlertButton = document.getElementById('closeCustomAlert');

    // Add click handler to close the notification box
    if (closeCustomAlertButton) {
        closeCustomAlertButton.addEventListener('click', () => {
            guestManager.hideNotification();
        });
    }

    // If log container doesn't exist, exit early
    if (!logContainer) {
        return;
    }

    // Loop through each log entry and add it to the page
    logList.forEach(log => {
        // Create a paragraph element for this log entry
        const logItem = document.createElement('p');
        // Set the text to timestamp + action
        logItem.textContent = `${log.timestamp} - ${log.action}`;
        // Determine the type of action and assign a CSS class for styling
        logItem.className = log.action.startsWith('Added') ? 'log-add' : 'log-remove';
        // 'log-add' = green styling (for additions)
        // 'log-remove' = red styling (for removals)
        // Append this log entry to the page
        logContainer.appendChild(logItem);
    });
});