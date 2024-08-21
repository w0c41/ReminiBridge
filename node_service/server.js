// node_service/server.js
const express = require('express');
const Hero = require('@ulixee/hero');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

let operationInProgress = false;

//Place holder contant, will use input from post request later
//改成真的密码账号, 正式写肯定要传参过来.
const email = 'xxxxx@gmail.com'
const password = 'xxxxx'


// SSE endpoint
app.get('/api/remini_login/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('SSE connection established');

  // Function to send messages to the client
  function sendEvent(data) {
    console.log('Sending event:', data);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  async function checkBtnCount(buttons) {
    let btnCount = 0
    for (const btn of buttons) {
      // const textContent = await btn.textContent;
      // console.log(`Button text: ${textContent}`);
      btnCount ++ ;
    }
    return btnCount;
  }

  // Simulate a long-running operation
  (async function () {
    try {
      if (operationInProgress) {
        sendEvent({ message: 'Operation already in progress.' });
        res.end();
        return;
      }

      operationInProgress = true;

      const hero = new Hero({ showChrome: true });

      sendEvent({ message: 'Starting navigation to https://app.remini.ai' });
      await hero.goto('https://app.remini.ai');
      const mainTab = hero.activeTab; // Save the reference to the active tab
      sendEvent({ message: 'Navigation complete' });

      // Wait for the "Accept All Cookies" button to appear
      sendEvent({ message: 'Waiting for cookie button' });
      // Wait for the button to be visible and clickable
      const cookieButton = await mainTab.waitForElement(
        mainTab.querySelector('#onetrust-accept-btn-handler'),
        { waitForVisible: true, waitForClickable: true }
      );

      if (cookieButton) {        
        await hero.interact({ click: cookieButton })
        sendEvent({ message: 'Clicked cookie button' });
      } else {
        sendEvent({ message: 'Cookie button not found', isError: true });
        res.end();
        await hero.close();
        return; // Return early to stop further execution
      }

      // Wait for the "Accept All Cookies" button to appear
      sendEvent({ message: 'Waiting for Login button' });
      // Wait for the button to be visible and clickable
      const LoginButton = await mainTab.waitForElement(
        mainTab.querySelector('button[data-cy="login-btn"]'),
        { waitForVisible: true, waitForClickable: true }
      );

      if (LoginButton) {
        await hero.interact({ click: LoginButton })
        sendEvent({ message: 'Clicked Login button' });
      } else {
        sendEvent({ message: 'Login button not found', isError: true });
        res.end();
        await hero.close();
        return; 
      }

      // Now select and iterate over the buttons
      const buttons = await mainTab.querySelectorAll('button[data-cy="login-provider-btn"]');

      let googleButtonFound = false;
      let googleTab = null;    

      for (const button of buttons) {
        const textContent = await button.textContent;
        if (textContent.includes('Google')) {
          await hero.interact({ click: button }); 
          googleButtonFound = true;
          sendEvent({ message: 'Clicked Google button' });

          // Wait for a new tab to open
          googleTab = await hero.waitForNewTab();
          break;
        }
      }

      if (!googleButtonFound) {
        sendEvent({ message: 'Google button not found', isError: true });
        res.end();
        await hero.close();
        return; 
      }

      if (googleTab) {
        await googleTab.waitForPaintingStable();
        sendEvent({ message: 'Google Tab Opened and Ready' });

        // Wait for email input to be available
        sendEvent({ message: 'Waiting for email input' });
        const emailInput = await googleTab.waitForElement(
          googleTab.querySelector('#identifierId'),
          { waitForVisible: true }
        );

        if (emailInput) {
          await hero.interact({ click: emailInput, type: email });
          sendEvent({ message: 'Typed Email' });
        } else {
          sendEvent({ message: 'Email field not found' });
          res.end();
          await hero.close();
          return;
        }

        // Get Next button for email entry       
        const identifierNext = await googleTab.querySelector('#identifierNext button');
  
        if (identifierNext) {
          await hero.interact({ click: identifierNext })
          sendEvent({ message: 'Clicked Next button' });
        } else {
          sendEvent({ message: 'Next button not found', isError: true });
          res.end();
          await hero.close();
          return; 
        }

        // Wait for password input to be available
        sendEvent({ message: 'Waiting for password input' });
        const passwordInput = await googleTab.waitForElement(
          googleTab.querySelector('input[type="password"]'), // Select password input by type
          { waitForVisible: true }
        );

        if (passwordInput) {
          await hero.interact({ click: passwordInput, type: password });
          sendEvent({ message: 'Typed Password' });
        } else {
          sendEvent({ message: 'Password field not found', isError: true });
          res.end();
          await hero.close();
          return;
        }

        // Query all buttons on the page
        const allButtons = await googleTab.querySelectorAll("button");

        // Find the button with text 'Next'
        let nextButtonFound = false;
        for (const button of allButtons) {
          const textContent = await button.textContent;
          if (textContent && textContent.includes("Next")) {
            await hero.interact({ click: button });
            sendEvent({ message: "Clicked Next button after password..." });
            nextButtonFound = true;
            break;
          }
        }

        if (!nextButtonFound) {
          sendEvent({ message: "Next button not found", isError: true });
          res.end();
          await hero.close();
          return; 
        }

        // Wait for 1 sec to check password       
        await googleTab.waitForMillis(1000)  
        await googleTab.waitForPaintingStable()
        // Find all span elements on the page
        const allSpanElements = await googleTab.querySelectorAll('span');

        let wrongPasswordDetected = false;

        // Check the text content of each span
        for (const element of allSpanElements) {
          const textContent = await element.textContent;
          // console.log(`Span text: ${textContent}`);
          if (textContent.includes("Wrong password")) {
            wrongPasswordDetected = true;
            break;
          }
        }

        if (wrongPasswordDetected) {
          sendEvent({ message: "Wrong password detected. Please try again.", isError: true });
          res.end();
          await hero.close();
          return;
        }  

        sendEvent({ message: "Waiting for Login Finish, 30 secs to time out" });

        try {       

          const timeoutMs = 30000; // 30 seconds
          const startTime = Date.now(); // Start time for the timeout

          // Await the promise returned by querySelectorAll to get the array of elements
          let providerBtns = await mainTab.querySelectorAll('button[data-cy="login-provider-btn"]');
         

          let btnCount = await checkBtnCount(providerBtns)
          // Log each button for more detailed debugging        
          
          // Loop until no provider buttons are found
          while (btnCount !== 0) {
            // Check if timeout has been reached
            if (Date.now() - startTime >= timeoutMs) {
              throw new Error('Timeout: Login operation took too long.');
            }
            await mainTab.waitForMillis(2000);
            providerBtns = await mainTab.querySelectorAll('button[data-cy="login-provider-btn"]');         
            btnCount = await checkBtnCount(providerBtns)         
            // console.log(`btnCount: ${btnCount}`);
          }
          
          sendEvent({ message: 'Login Provider Tab Closed', success: true });    

        } catch (error) {
          sendEvent({ message: 'Error during login check: ' + error.message, isError: true });
          res.end();
          await hero.close();
          return;
        }    

      } else {
        sendEvent({ message: 'Failed to open Google tab', isError: true });
        res.end();
        await hero.close();
        return; 
      }

    } catch (error) {
      sendEvent({ message: `Error in Hero operation: ${error.message}`, isError: true });
      res.end();      
    } finally {
      operationInProgress = false;
    }
  })();
});

// POST endpoint to trigger operation
app.post('/api/remini_login', (req, res) => {
  console.log('Received login request');
  res.json({ message: '⇒ Login in progress...' });
});

// Start the server
server = app.listen(PORT, () => {
  console.log(`Node service is running on http://localhost:${PORT} \nUse Ctrl+C to Exit`);
});

// Handle server shutdown and cleanup (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.close(() => {    
    process.exit(0);
  });
});