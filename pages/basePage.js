const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class BasePage {
    constructor(page) {
        this.page = page;
    }

    async navigate(url) {
        await this.page.goto(url);
    }

    async getTitle() {
        return await this.page.title();
    }

    async login(username, password) {
        await this.page.goto('https://example.com/login');
        await this.page.fill('#username', username);
        await this.page.fill('#password', password);
        await this.page.click('#login-button');
        await this.page.waitForNavigation();
    }

    async closeBrowserOnFailure(testResult) {
        if (!testResult) {
            try {
                await this.page.close();
                exec('taskkill /F /IM taskmgr.exe', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error killing task manager process: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            } catch (error) {
                console.error('Error in closeBrowserOnFailure:', error);
                throw error;
            }
        }
    }
}

module.exports = BasePage;