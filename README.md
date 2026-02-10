# Quetta Events - Event Management Platform

## Project Overview

Quetta Events is a web application designed to make buying and selling event tickets simple. The main idea is to connect people who want to go to events with the people organizing them.

Users can browse local events, book tickets, and get a digital pass with a QR code. Organizers have a special dashboard where they can create new events, track sales, and use a built-in camera scanner to check tickets at the door. It solves the problem of paper tickets by making everything digital.

# Features List

Here is what the application can do, broken down by user roles:

## For Attendees (Users)

- **Browse Events:** See a list of all upcoming events with details like date, time, location, and price.

- **Book Tickets:** Buy a ticket for an event with just one click.

- **Digital Ticket:** Get a unique Ticket ID and QR code immediately after booking.

- **My Tickets:** A dedicated page to see active tickets and a history of past events attended.

- **Event Status:** See if an event is "Sold Out" or "Expired".

## For Organizers

- **Organizer Dashboard:** A control center to manage events.

- **Create Events:** A form to add event details (Title, Price, Capacity) and upload an event banner.

- **Ticket Scanner:** A built-in camera tool that scans attendee QR codes to verify them instantly.

- **Validation System:** The app checks if a ticket is valid, invalid, or already used so people can't use the same ticket twice.

- **Sales Tracking:** See a progress bar showing how many tickets have been sold for each event.

# Tech Stack

**I used modern and popular tools to build this project:**

### Frontend (The Visuals):

- **React.js (Vite):** Makes the website fast and interactive.

- **Tailwind CSS:** Used for styling the pages to look clean and mobile-friendly.

### Backend:

- **Redux Toolkit:** Manages the app's state (like keeping track of the logged-in user and loaded events).

- **Firebase Authentication:** For secure login/signup.

- **Firebase Firestore:** Database to save events, users, and bookings.

### **Extra Tools:**

- **Cloudinary:** Used to store and display event images.

- **qrcode-react:** Generates the QR code for tickets.

- **Html5-QRCode:** Allows the browser to use the camera for scanning tickets.

