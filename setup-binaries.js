const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const binDir = path.join(process.cwd(), 'bin');
const ytDlpPath = path.join(binDir, 'yt-dlp');

// Create bin directory if it doesn't exist
if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}

// URL for the latest yt-dlp binary (Linux version for Vercel)
// Note: Vercel runs on Linux, so we need the linux binary
const BINARY_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

console.log('Setup: Checking for yt-dlp binary...');

if (fs.existsSync(ytDlpPath)) {
    console.log('Setup: yt-dlp binary already exists.');
} else {
    console.log('Setup: Downloading yt-dlp binary from GitHub...');
    const file = fs.createWriteStream(ytDlpPath);

    https.get(BINARY_URL, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Setup: Failed to download binary. Status code: ${response.statusCode}`);
            process.exit(1);
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log('Setup: Download complete.');

            // Make executable
            try {
                if (process.platform !== 'win32') {
                    execSync(`chmod +x ${ytDlpPath}`);
                    console.log('Setup: Made binary executable.');
                }
            } catch (error) {
                console.error('Setup: Failed to make binary executable:', error);
            }
        });
    }).on('error', (err) => {
        fs.unlink(ytDlpPath, () => { }); // Delete failed file
        console.error('Setup: Download error:', err.message);
        process.exit(1);
    });
}
