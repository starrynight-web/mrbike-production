const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint_full.json', 'utf8'));
let count = 0;
let output = "";
data.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
        output += `\nFile: ${file.filePath}\n`;
        file.messages.forEach(msg => {
            output += `  Line ${msg.line}: ${msg.message} (${msg.ruleId})\n`;
            count++;
        });
    }
});
output += `\nTotal issues: ${count}\n`;
fs.writeFileSync('eslint_summary.txt', output, 'utf8');
