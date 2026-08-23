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

// Regex to find the phone status bar:
// <div className="h-[30px] flex-none p-[10px_19px_0] bg-[var(--nav-surface)] text-[var(--nav-text)] flex justify-between font-heading font-semibold text-[10.5px] leading-[1]">
//   <span>9:41</span><span className="tracking-[3px]">•••</span>
// </div>
// OR similar variants
const statusBarRegex = /\s*<div className="h-\[30px\] flex-none p-\[10px_19px_0\] bg-\[var\(--nav-surface\)\] text-\[var\(--nav-text\)\] flex justify-between font-heading font-semibold text-\[10\.5px\] leading-\[1\]">\s*<span>9:41<\/span><span className="tracking-\[3px\]">•••<\/span>\s*<\/div>/g;

const altStatusBarRegex = /\s*<div className="h-\[30px\] flex-none p-\[10px_19px_0\] bg-\[var\(--nav-surface\)\] text-\[var\(--nav-text\)\] flex justify-between font-heading font-semibold text-\[10\.5px\] leading-\[1\] z-10 relative">\s*<span>9:41<\/span><span className="tracking-\[3px\]">•••<\/span>\s*<\/div>/g;

const alertStatusBarRegex = /\s*<div className="h-\[30px\] flex-none p-\[10px_19px_0\] bg-\[var\(--brand-fill\)\] text-\[var\(--color-on-brand\)\] flex justify-between font-heading font-semibold text-\[10\.5px\] leading-\[1\]">\s*<span>9:41<\/span><span className="tracking-\[3px\]">•••<\/span>\s*<\/div>/g;

walk('app', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (statusBarRegex.test(content)) {
      content = content.replace(statusBarRegex, '');
      changed = true;
    }
    if (altStatusBarRegex.test(content)) {
      content = content.replace(altStatusBarRegex, '');
      changed = true;
    }
    if (alertStatusBarRegex.test(content)) {
      content = content.replace(alertStatusBarRegex, '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Removed status bar from', file);
    }
  }
});
