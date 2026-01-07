const axios = require('axios');

const API_URL = 'http://localhost:3000/api/events';

async function verify() {
    try {
        console.log('Sending event...');
        const eventPayload = {
            leadId: 'test-lead-id',
            eventData: {
                type: 'webinar_signup',
                timestamp: new Date()
            }
        };

        const res = await axios.post(API_URL, eventPayload);

        if (res.status === 202) {
            console.log('Verification SUCCESS: Event accepted.');
            console.log('Response:', res.data);
        } else {
            console.error(`Verification FAILED: Unexpected status code ${res.status}`);
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
