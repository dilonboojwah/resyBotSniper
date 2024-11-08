# Resy Bot Sniper

An automated reservation bot that assists users in securing table bookings on Resy at desired times, complete with automated email notifications via SendGrid and MongoDB storage for reservation data. This project demonstrates automation in navigating Resy's booking process using Playwright and Node.js.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [Usage](#usage)
6. [Project Structure](#project-structure)
7. [Example Usage](#example-usage)
8. [License](#license)

---

## Project Overview

This bot helps users secure reservations on Resy by:
- Automatically navigating through Resy's reservation system.
- Selecting the desired date, time, and party size.
- Sending email notifications to confirm successful reservations.
- Storing reservation data in MongoDB for tracking.

Built with Playwright for automation, SendGrid for email notifications, and MongoDB for data storage.

## Features

- **Automated Reservation Selection**: Chooses specified date, time, and party size on Resy.
- **Retry Mechanism**: Continues attempting to make a reservation if no slots are available.
- **Email Notifications**: Sends a confirmation email for successful reservations.
- **Data Storage**: Saves reservation data in MongoDB for reference.

## Setup Instructions

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/resybotsniper.git
cd resybotsniper
