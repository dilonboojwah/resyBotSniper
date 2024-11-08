const { launchBrowser, loginToResy, monitorReservations } = require('./utils/playwrightHelper');
const { sendEmailNotification } = require('./utils/sendNotification');
const { connectDB, saveReservation } = require('./utils/dbHelper');

(async () => {
    // Accept user inputs from command-line arguments
    const [restaurantUrl, reservationDate, reservationTime, partySize] = process.argv.slice(2);

    if (!restaurantUrl || !reservationDate || !reservationTime || !partySize) {
        console.error('Please provide all required details: restaurant URL, reservation date, time, and party size.');
        process.exit(1);
    }

    // MongoDB connection
    await connectDB();

    const { browser, page } = await launchBrowser();
    try {
        await loginToResy(page);
        const reservationMade = await monitorReservations(page, restaurantUrl, reservationDate, reservationTime, partySize);
        if (reservationMade) {
            const message = `You got the table for ${partySize} at ${restaurantUrl} on ${reservationDate} at ${reservationTime}.`;
            await sendEmailNotification(message); // Pass the message dynamically
            await saveReservation({ restaurantUrl, reservationDate, reservationTime, partySize, date: new Date() });
        }
    } catch (error) {
        console.error('Error:', error);
        await sendEmailNotification(`Error: ${error.message}`);
    } finally {
        await browser.close();
    }
})();


// example input into terminal:
// node index.js "https://resy.com/cities/new-york-ny/venues/upland" "November 14, 2024" "1930" "2"
