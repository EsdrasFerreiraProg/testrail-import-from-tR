import fetch from 'node-fetch';
import fs from 'fs/promises';

async function readJson() {
    const filePath = './response.json';

    try {

        const data = await fs.readFile(filePath, 'utf-8');
        let newData = data.replace(/uuid/g, "testCaseUuid");

        const content = JSON.parse(newData).data.content; 
        content.forEach(item=>{
            delete item.createdAt;
            delete item.createdBy;
            delete item.modifiedBy;
            delete item.modifiedAt;
            delete item.disabled;

        })

        return content;
        
    } catch (error) {
        console.error('Error reading JSON file:', error.message);
        throw error; 
    }
}


// Configuration
const baseUrl = "https://marketonce.testrail.io/"; // Replace with your TestRail domain
const username = "survey.aqa.executor@marketonce.com"; // Your TestRail login email
const apiKey = "hjzBFRrEoDs4D4vUSpk0-KH0.pcGgrpMYsSAkdliK"; // Your TestRail API key
const sectionId = 14625; // The section ID where the test cases should be added


// Function to create the test case
async function createTestCase(payload) {
    try {
        const response = await fetch(`${baseUrl}/index.php?/api/v2/add_case/${sectionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64')
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Test cases created successfully:", data);
    } catch (error) {
        console.error("Error creating the test case:", error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


readJson().then(async content=>{

    for (let item of content) {
        let payload = {
          title: item.description, // Title of the test case
          template_id: 1, // Template ID (default is 1)
          type_id: 1, // Test type ID (e.g., Functional)
          priority_id: 2, // Priority ID (e.g., Medium)
          custom_steps: item.customSteps, // Test steps
        };
  
        console.log(payload);
  
        await createTestCase(payload);
        //break;
        await sleep(1000);
      }
  
    
    console.log(`Size of the payload: ${content.length}`);

}).catch(error => {
    console.log(error)
}).finally(() => {
    console.log("\x1b[31mWait..........................->->\x1b[0m");
    
});
