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

// Revert the wrapper back to a simple full-bleed responsive layout
// We are looking for:
// <div className={`min-h-[100dvh] flex flex-col md:items-center md:justify-center md:bg-[#00000005] md:py-8 text-[var(--text-primary)] font-['Sora',sans-serif] ${theme === 'dark' ? 'dark' : ''}`}>
//       {/* App Container */}
//       <div className="flex flex-col h-[100dvh] md:h-[844px] md:max-h-[100dvh] md:w-[390px] w-full overflow-hidden relative bg-[var(--surface-canvas)] md:rounded-[27px] md:shadow-[var(--elev-4)]">

const oldOuter = /<div className=\{`min-h-\[100dvh\] flex flex-col md:items-center md:justify-center md:bg-\[#00000005\] md:py-8 text-\[var\(--text-primary\)\] font-\['Sora',sans-serif\] \$\{theme === 'dark' \? 'dark' : ''\}`\}>/g;
const newOuter = `<div className={\`min-h-[100dvh] flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] font-['Sora',sans-serif] \${theme === 'dark' ? 'dark' : ''}\`}>`;

const oldInner = /\{\/\* App Container \*\/\}\s*<div className="flex flex-col h-\[100dvh\] md:h-\[844px\] md:max-h-\[100dvh\] md:w-\[390px\] w-full overflow-hidden relative bg-\[var\(--surface-canvas\)\] md:rounded-\[27px\] md:shadow-\[var\(--elev-4\)\]">/g;
// Just w-full h-[100dvh] with max-width so it's readable, or full width?
// Let's just make it a clean responsive full-bleed column. 
// "extend the mobile to be responsive on desktop as well"
const newInner = `{/* App Container */}\n      <div className="flex flex-col w-full max-w-[800px] mx-auto h-[100dvh] overflow-hidden relative">`;

// Some files had `flex flex-col h-[100dvh] bg-[var(--dev-backdrop)] md:h-[844px]...` 
// I need a regex that matches the inner div safely.
const dynamicInner = /\{\/\* App Container \*\/\}\s*<div className="flex([^"]*) md:h-\[844px\]([^"]*)">/g;

walk('app', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (oldOuter.test(content)) {
      content = content.replace(oldOuter, newOuter);
      changed = true;
    }
    
    if (dynamicInner.test(content)) {
      content = content.replace(dynamicInner, (match, p1, p2) => {
        // Strip out the phone-specific classes, keep any custom ones like bg-[var(--dev-backdrop)]
        let customClasses = p1.replace('flex-col h-[100dvh]', '').trim();
        if (customClasses.length > 0) customClasses = ' ' + customClasses;
        return `{/* App Container */}\n      <div className="flex flex-col w-full max-w-[800px] mx-auto h-[100dvh] overflow-hidden relative${customClasses}">`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Made responsive in', file);
    }
  }
});
