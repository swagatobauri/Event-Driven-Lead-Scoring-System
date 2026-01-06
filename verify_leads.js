const axios = require('axios');

const API_URL = 'http://localhost:3000/api/leads';

async function verify() {
    try {
        // 1. Create a Lead
        console.log('Creating lead...');
        const newLead = {
            name: 'Test Lead',
            email: `test${Date.now()}@example.com`
        };
        const createRes = await axios.post(API_URL, newLead);

        if (createRes.status !== 201) {
            throw new Error(`Failed to create lead. Status: ${createRes.status}`);
        }
        console.log('Lead created:', createRes.data);

        // 2. Fetch all Leads
        console.log('Fetching leads...');
        const getRes = await axios.get(API_URL);

        if (getRes.status !== 200) {
            throw new Error(`Failed to fetch leads. Status: ${getRes.status}`);
        }

        const leads = getRes.data;
        const found = leads.find(l => l.email === newLead.email);

        if (found) {
            console.log('Verification SUCCESS: Created lead found in list.');
        } else {
            console.error('Verification FAILED: Created lead NOT found in list.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

verify();
