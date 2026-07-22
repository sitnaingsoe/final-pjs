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

    const replacements = {
        'focus:ring-orange-500': 'focus:ring-black',
        'placeholder-slate-500': 'placeholder-gray-400',
        'bg-slate-800': 'bg-gray-200',
        'disabled:bg-slate-800': 'disabled:bg-gray-200',
        'shadow-orange-500/10': 'shadow-black/10',
        'hover:shadow-orange-500/10': 'hover:shadow-black/10',
        'hover:text-white': 'hover:text-black', // Most hover text on light mode should be black
        'hover:text-white transition': 'hover:text-black transition'
    };

    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
        newContent = newContent.split(key).join(value);
    }
    
    // Fix the specific hover text issue in layout.tsx sidebar
    newContent = newContent.replace(
        "'text-gray-500 hover:bg-gray-50 hover:text-white'",
        "'text-gray-500 hover:bg-gray-50 hover:text-black'"
    );

    // Fix login/register hover text
    newContent = newContent.replace(
        "hover:text-white transition",
        "hover:text-black transition"
    );

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
console.log('Pass 2 complete.');
