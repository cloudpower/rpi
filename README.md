rpi-webserver
=============

The express-based web server that will run on the Raspberry Pi.  Can run standalone on the RPi, but will attempt to open and maintain a WebSocket connection to the remote API server to listen for requests.


## Install

Make sure you've got XCode and Homebrew installed and updated.  Connect an Arduino to USB and upload the 'Standard Firmata' sketch to it.

	git clone
	brew install node
	npm install
	npm start (or alternatively node index.js)

## API Documentation

All commands are prefaced with /api/v1.

##### /outlet/:outlet (POST)

Set the state of an outlet.

    {
        state: 1
    }
    
##### /outlet/:outlet (GET)

Get the state of an outlet.
