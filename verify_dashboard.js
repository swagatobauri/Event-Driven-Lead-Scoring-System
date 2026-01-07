const axios = require('axios');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api/dashboard';

async function verifyDashboard() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Ensure some data exists
        if (await Lead.countDocuments() === 0) {
            console.log('Seeding data for verification...');
            await new Lead({ name: 'Winner', email: 'win@test.com', score: 100 }).save();
            await new Lead({ name: 'Runner Up', email: 'run@test.com', score: 50 }).save();
        }

        console.log('Fetching dashboard stats...');
        const res = await axios.get(API_URL);

        if (res.status === 200) {
            const { totalLeads, totalEvents, topLeads } = res.data;
            console.log('Dashboard Stats:', res.data);

            if (typeof totalLeads === 'number' && typeof totalEvents === 'number' && Array.isArray(topLeads)) {
                console.log('Structure verified.');

                // Check sorting
                if (topLeads.length > 1 && topLeads[0].score < topLeads[1].score) {
                    console.error('FAILED: Top leads not sorted by score descending.');
                    process.exit(1);
                } else {
                    console.log('SUCCESS: Dashboard API verified.');
                    process.exit(0);
                }
            } else {
                console.error('FAILED: Invalid response structure.');
                process.exit(1);
            }
        } else {
            console.error(`FAILED: Unexpected status code ${res.status}`);
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

verifyDashboard();
