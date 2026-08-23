const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  });
}

// More robust regexes
const wrapperOuterRegex = /<div className=\{`min-h-\[100dvh\] flex flex-col bg-\[var\(--surface-canvas\)\] text-\[var\(--text-primary\)\] font-\['Sora',sans-serif\] \$\{theme === 'dark' \? 'dark' : ''\}`\}>/g;
const replacementOuter = `<div className={\`min-h-[100dvh] flex flex-col md:items-center md:justify-center md:bg-[#00000005] md:py-8 text-[var(--text-primary)] font-['Sora',sans-serif] \${theme === 'dark' ? 'dark' : ''}\`}>`;

const mobileShellRegex = /\{\/\* Mobile Shell \*\/\}\s*<div className="md:hidden([^"]*)">/g;
const replacementMobileShell = `{/* App Container */}\n      <div className="flex$1 md:h-[844px] md:max-h-[100dvh] md:w-[390px] w-full bg-[var(--surface-canvas)] md:rounded-[27px] md:shadow-[var(--elev-4)]">`;


walk('app', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (wrapperOuterRegex.test(content)) {
      content = content.replace(wrapperOuterRegex, replacementOuter);
      changed = true;
    }
    
    if (mobileShellRegex.test(content)) {
      content = content.replace(mobileShellRegex, replacementMobileShell);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Fixed wrapper in', file);
    }
  }
});
