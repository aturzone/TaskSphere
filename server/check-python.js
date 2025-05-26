
const { execSync } = require('child_process');

function checkPython() {
    console.log('Checking Python installation...\n');
    
    const pythonCommands = ['python3', 'python'];
    let foundPython = false;
    
    for (const cmd of pythonCommands) {
        try {
            const version = execSync(`${cmd} --version`, { encoding: 'utf8' });
            console.log(`✅ ${cmd}: ${version.trim()}`);
            foundPython = true;
        } catch (error) {
            console.log(`❌ ${cmd}: Not found`);
        }
    }
    
    if (!foundPython) {
        console.log('\n❌ Python is not installed or not accessible!');
        console.log('\nTo install Python:');
        console.log('  Ubuntu/Debian: sudo apt update && sudo apt install python3');
        console.log('  CentOS/RHEL: sudo yum install python3');
        console.log('  MacOS: brew install python3');
        console.log('\nAfter installation, restart the server.');
        process.exit(1);
    } else {
        console.log('\n✅ Python is ready!');
    }
}

if (require.main === module) {
    checkPython();
}

module.exports = { checkPython };
