async function refreshAccessToken(clientId, clientSecret, refreshToken) {
    const url = 'https://oauth2.googleapis.com/token';
  
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const tokenData = await response.json();
      return tokenData['access_token'];
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
}

// Create a MIME email message
function createMessage(to, subject, messageText) {
    // Create a MIMEText message
    const message = [
        `From: sheeesh.tc.insalyon@gmail.com`,
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        messageText
    ].join('\n');
    const base64EncodedMessage = Buffer.from(message).toString('base64');
    
    return { raw: base64EncodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }; // URL safe
}

async function sendEmail(accessToken, to, subject, messageText) {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    
    // Create the email message
    const messageBody = createMessage(to, subject, messageText);
    
    // Set the headers with the access token for authorization
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };
    console.log(accessToken)
    // Send the POST request to the Gmail API
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(messageBody),
        });

        // Check if the request was successful
        if (response.ok) {
            const data = await response.json();
            console.log("Email sent successfully!", data);
            return data;
        } else {
            const errorText = await response.text();
            console.error(`Failed to send email. Status code: ${response.status}`);
            console.error(errorText);
            return null;
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function main() {
    const clientId = "870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com"
    const clientSecret = "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"
    const refreshToken = "1//09-xPq73I7tQyCgYIARAAGAkSNwF-L9IrZnWvOxxpqojJV4zMDOEs3it-dSOXU84kj2IhbLZRHbqRzfh5cscMTTl3pBkO0ao9lbk"    

    // Refresh the access token
    const accessToken = await refreshAccessToken(clientId, clientSecret, refreshToken);

    if (accessToken) {
        // Call the sendEmail function with the access token
        await sendEmail(accessToken, 'tristan.verdet@insa-lyon.fr', 'API gmail sheeesh', 'Sheeesh meilleure appli ever');
    } else {
        console.error("Could not retrieve access token, email not sent.");
    }
}
const clientId = "870362726807-4dcvr8vvcq0lkvnrkhh89sgr3plbtuib.apps.googleusercontent.com"
const clientSecret = "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"
const refreshToken = "1//09-xPq73I7tQyCgYIARAAGAkSNwF-L9IrZnWvOxxpqojJV4zMDOEs3it-dSOXU84kj2IhbLZRHbqRzfh5cscMTTl3pBkO0ao9lbk"    

module.exports = {
    clientId,
    clientSecret,
    refreshToken,
    refreshAccessToken,
    createMessage,
    sendEmail
}