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

const wrapperRegex = /<div className={`min-h-\[100dvh\] flex flex-col bg-\[var\(--surface-canvas\)\] text-\[var\(--text-primary\)\] font-\['Sora',sans-serif\] \$\{theme === 'dark' \? 'dark' : ''\}`}>\s*\{\/\* Mobile Shell \*\/\}\s*<div className="md:hidden flex flex-col h-\[100dvh\] overflow-hidden relative">/g;

const replacementWrapper = `<div className={\`min-h-[100dvh] flex flex-col md:items-center md:justify-center md:bg-[#00000005] md:py-8 text-[var(--text-primary)] font-['Sora',sans-serif] \${theme === 'dark' ? 'dark' : ''}\`}>
      
      {/* App Container */}
      <div className="flex flex-col h-[100dvh] md:h-[844px] md:max-h-[100dvh] md:w-[390px] w-full overflow-hidden relative bg-[var(--surface-canvas)] md:rounded-[27px] md:shadow-[var(--elev-4)]">`;

const desktopPlaceholderRegex = /\s*\{\/\* Desktop Placeholder \*\/\}\s*<div className="hidden md:flex flex-col flex-1 items-center justify-center space-y-4">[\s\S]*?<\/div>\s*(?=<\/div>\s*\)\s*;)/g;

walk('app', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (wrapperRegex.test(content)) {
      content = content.replace(wrapperRegex, replacementWrapper);
      changed = true;
    }
    
    if (desktopPlaceholderRegex.test(content)) {
      content = content.replace(desktopPlaceholderRegex, '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Updated', file);
    }
  }
});
