const { chromium } = require('playwright');
require('dotenv').config();

async function launchBrowser() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, page };
}

module.exports = { launchBrowser };

const { sendEmailNotification } = require('./utils/sendNotification');
const { connectDB, saveReservation } = require('./utils/dbHelper');

async function loginToResy(page) {
    await page.goto('https://resy.com/');
    await page.click('button[data-test-id="menu_container-button-log_in"]'); // Clicks the "Log In" button
    await page.click('button:has-text("Use Email and Password instead")'); // Clicks "Use Email and Password instead"
    await page.fill('input#email', process.env.RESY_USERNAME); // Fills in email
    await page.fill('input#password', process.env.RESY_PASSWORD); // Fills in password
    await page.click('button[type="submit"]'); // Clicks submit button
    await page.waitForTimeout(3000);
}

module.exports = { launchBrowser, loginToResy };

const { sendEmailNotification } = require('./utils/sendNotification');
const { connectDB, saveReservation } = require('./utils/dbHelper');

async function monitorReservations(page, restaurantUrl, reservationDate, desiredTime, partySize) {
    await page.goto(restaurantUrl);

    // MongoDB connection
    await connectDB();

    // Confirms navigation
    if (!page.url().includes(restaurantUrl)) {
        throw new Error("Navigation to restaurant page failed.");
    }

    // Converts desiredTime from "HHMM" to "H:MM AM/PM"
    const hours = parseInt(desiredTime.substring(0, 2), 10);
    const minutes = desiredTime.substring(2, 4);
    const isPM = hours >= 12;
    const formattedTime = `${isPM ? hours - 12 || 12 : hours}:${minutes} ${isPM ? 'PM' : 'AM'}`;

    // Loops to keep checking for desired slot
    while (true) {
        // Selects date dropdown and chooses target date
        await page.waitForSelector('#DropdownGroup__selector--date--selection', { timeout: 5000 });
        await page.click('#DropdownGroup__selector--date--selection'); // Opens date dropdown
        const dateButton = await page.$(`button[aria-label="${reservationDate}"]`); // Selects inputted date of reservation
        if (dateButton) {
            await dateButton.click();
        }     

        // Selects time dropdown and chooses desired time
        await page.selectOption('#time', desiredTime); // e.g., for 7:30pm it would be "1930"

        // Selects party size dropdown and chooses desired size
        await page.selectOption('#party_size', partySize.toString());

        // Look for the specific reservation button that matches the time and type
        const reservationButtons = await page.$$('button.ReservationButton.Button.Button--primary'); // Gets all reservation buttons
        let reservationFound = false;

        // Checks if blue button matches desired time and reservation type
        for (const button of reservationButtons) {
            const buttonTime = await button.$eval('.ReservationButton__time', el => el.innerText);
            const buttonType = await button.$eval('.ReservationButton__type', el => el.innerText);
            console.log(`Checking button with time: ${buttonTime} and type: ${buttonType}`); // Debugging line
            console.log(`Desired time: ${formattedTime}, Desired type: Dining Room`); // Debugging line

            if (buttonTime.includes(formattedTime) && buttonType === "Dining Room") { // Hard-coded 'Dining Room', interchange accordingly
                await button.click(); // Click the matched reservation button
                reservationFound = true;

                // Wait a moment for the pop-up to fully render
                await page.waitForTimeout(3000); // 3-second delay
                console.log(`Pop up visible`);

                await page.waitForSelector('button:has-text("Reserve Now")', { timeout: 5000 });
                const reserveNowButton = await page.$('button:has-text("Reserve Now")'); // Targets the "Reserve Now" button
                if (reserveNowButton) {
                    await reserveNowButton.click();
                    return true; // Reservation successful

                    // Send Email Notification
                    const emailMessage = `Reservation made for ${buttonType} at ${formattedTime} on ${reservationDate}`;
                    await sendEmailNotification(emailMessage);
                    
                    // Save Reservation Data to MongoDB
                    const reservationData = {
                        restaurant: restaurantUrl,
                        date: reservationDate,
                        time: formattedTime,
                        partySize: partySize,
                        reservationType: buttonType,
                    };
                    await saveReservation(reservationData);
                    console.log(`Reservation made for Dining Room at ${formattedTime} on ${reservationDate}`);
                }
            }
            if (!reservationFound) {
                console.log("No matching reservation found");
            }
        }

        // Refresh the page periodically if the reservation is not successful
        await page.reload(); // Refresh the page periodically
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
    }
}

module.exports = { launchBrowser, loginToResy, monitorReservations };

// Example usage:
// const reservationDate = "November 27, 2024"; // Input the desired date
// const desiredTime = "1930"; // Input the desired time (e.g., "1930" for 7:30 PM)
// const partySize = 2; // Input the desired party size
