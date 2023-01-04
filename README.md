##Spotlist Backend API

This Express server is the backend of the Spotlist application. The application can be found at: [Spotlist.me](https://www.spotlist.net/) and the frontend repository can be found on

It enables the client to:
• Authorise a users Spotify account.
• Create a retrieve data from a setlist.fm setlist.
• Create a Spotify playlist in the users account with songs from the setlist.

The Express server has 3 routes (access, auth, setlist) and is hosted in an Amazon Web Services (AWS) EC2 Linux instance and served through an AWS API Gateway.
