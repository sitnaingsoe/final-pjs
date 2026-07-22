import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
                callback(path.join(dir, f));
            }
        }
    });
}

function migrateTheme(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Mappings for dark slate to light gray
    const replacements = {
        'bg-slate-900': 'bg-gray-50',
        'bg-slate-950': 'bg-white',
        'border-slate-800': 'border-gray-200',
        'border-slate-900': 'border-gray-100',
        'border-slate-700': 'border-gray-300',
        'text-slate-100': 'text-gray-900',
        'text-slate-200': 'text-gray-800',
        'text-slate-300': 'text-gray-700',
        'text-slate-400': 'text-gray-500',
        'text-slate-500': 'text-gray-400',
        'text-slate-600': 'text-gray-300',
        'text-slate-700': 'text-gray-200',
        'hover:bg-slate-900': 'hover:bg-gray-50',
        'hover:bg-slate-800': 'hover:bg-gray-100',
        
        // Mappings for orange accent to black/gray
        'text-orange-500': 'text-black',
        'bg-orange-500': 'bg-black',
        'border-orange-500': 'border-black',
        'hover:bg-orange-600': 'hover:bg-gray-800',
        'text-orange-400': 'text-gray-800',
        'bg-orange-600': 'bg-gray-900',
        'hover:text-orange-400': 'hover:text-gray-600',
        'from-orange-400': 'from-gray-800',
        'to-rose-400': 'to-gray-500',
        'from-slate-950': 'from-white',
        'bg-red-950/50': 'bg-red-50',
        'border-red-800': 'border-red-200',
        'text-red-400': 'text-red-600',
        'bg-green-950/40': 'bg-green-50',
        'border-green-800': 'border-green-200',
        'text-green-400': 'text-green-600'
    };

    // First do a simple global replace for these deterministic classes
    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
        newContent = newContent.split(key).join(value);
    }

    // Now, handle text-white intelligently within className strings
    // We want to replace text-white with text-black ONLY IF there's no dark bg in the same class string
    const classRegex = /className=(?:\{`|["'])(.*?)(?:`\}|["'])/g;
    
    newContent = newContent.replace(classRegex, (match, classString) => {
        let tokens = classString.split(/\s+/);
        
        // If the class string contains text-white
        if (tokens.includes('text-white')) {
            // Check if it has a dark background like bg-black, bg-gray-900, bg-red-600, etc.
            const hasDarkBg = tokens.some(t => t.startsWith('bg-black') || t.startsWith('bg-gray-9') || t.startsWith('bg-red-6') || t.startsWith('bg-green-6') || t.startsWith('bg-blue-6'));
            
            if (!hasDarkBg) {
                // Safe to replace text-white with text-black
                tokens = tokens.map(t => t === 'text-white' ? 'text-black' : t);
            }
        }
        
        // Return the reconstructed match
        return match.replace(classString, tokens.join(' '));
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

const dirsToMigrate = [
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'components')
];

dirsToMigrate.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, migrateTheme);
    }
});
console.log('Migration complete.');
