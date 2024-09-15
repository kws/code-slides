# CodeSlides

CodeSlides is a web-based custom presentation tool using Flask and Vanilla JS, supporting programmable slides and a two-window interface.

## Features

- Custom slide types for simulations and API calls
- Presenter mode with timer and next slide preview
- Server-side state management
- Configurable slide transitions
- Save and load presentations

## Installation

[Add installation instructions here]

## Usage

### Launching the Debug Server

To launch the debug server, follow these steps:

1. Open a terminal in the project directory.
2. Run the following command:
   ```
   python run.py
   ```
3. The server will start, and you should see output similar to:
   ```
   * Running on http://127.0.0.1:5000
   * Running on http://172.31.196.96:5000
   ```
4. Open a web browser and navigate to `http://localhost:5000` to access the application.

### Running with Nginx or Another Server

To run the application using Nginx or another production-ready server, follow these general steps:

1. Install a WSGI server like Gunicorn:
   ```
   pip install gunicorn
   ```

2. Run the application using Gunicorn:
   ```
   gunicorn --bind 0.0.0.0:8000 run:app
   ```

3. Configure Nginx as a reverse proxy. Here's a basic Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. Restart Nginx to apply the changes.

5. Your application should now be accessible through Nginx.

Note: Make sure to properly secure your server and follow best practices for production deployment.

## Contributing

[Add contribution guidelines here]

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
