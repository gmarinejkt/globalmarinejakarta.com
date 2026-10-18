const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

// IndexNow URL notification (see tools/lib/index-ping.js).
const { submitToIndexNow } = require('./lib/index-ping.js');

const SITE_URL = 'https://globalmarinejakarta.com/';

const contentDir = path.join(__dirname, '..', 'content');
const now = new Date();

// Articles live under content/blog/ — walk recursively to find every .md file.
function walkMarkdownFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      results.push(fullPath);
    }
  }
  return results;
}

// content/blog/slug.md → /blog/slug/.
function toUrl(filePath) {
  return '/' + path.relative(contentDir, filePath).replace(/\\/g, '/').replace(/\.md$/, '') + '/';
}

// Surgically insert/update a `lastmod:` field within the RAW frontmatter text — never a full
// YAML re-serialize. `date:` (original publish date) is left untouched.
function setLastmod(rawMatter, newDate) {
  const line = `lastmod: "${newDate}"`;
  if (/^lastmod:\s*.*$/m.test(rawMatter)) {
    return rawMatter.replace(/^lastmod:\s*.*$/m, line);
  }
  if (/^date:\s*.*$/m.test(rawMatter)) {
    return rawMatter.replace(/^(date:\s*.*)$/m, `$1\n${line}`);
  }
  return `${rawMatter}\n${line}`;
}

function recyclePost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(fileContent);
  const { data, content } = parsed;

  if (data.draft === true) return false; // never touch unpublished drafts

  const postDate = new Date(data.date);
  if (isNaN(postDate.getTime())) return false; // missing/unparseable date — skip

  // Age is measured from the LAST touch (lastmod if present, otherwise date).
  const lastTouch = data.lastmod ? new Date(data.lastmod) : postDate;
  const reference = isNaN(lastTouch.getTime()) ? postDate : lastTouch;
  const monthsDiff = (now.getFullYear() - reference.getFullYear()) * 12 + now.getMonth() - reference.getMonth();

  if (monthsDiff >= 12) {
    const newDate = now.toISOString().split('T')[0];
    const newRawMatter = setLastmod(parsed.matter, newDate);
    const updatedContent = `---${newRawMatter}\n---\n${content}`;
    fs.writeFileSync(filePath, updatedContent);
    return true;
  }

  return false;
}

const markdownFiles = walkMarkdownFiles(contentDir);
console.log(`📁 ${markdownFiles.length} .md files found in ${contentDir} (recursive, all sub-folders).`);

let updatedCount = 0;
const updatedFilePaths = [];
for (const filePath of markdownFiles) {
  if (recyclePost(filePath)) {
    updatedCount++;
    updatedFilePaths.push(filePath);
  }
}

(async () => {
  if (updatedCount > 0) {
    console.log(`${updatedCount} article(s) updated.`);
    execSync('hugo', { stdio: 'inherit' });

    // IndexNow wants the SPECIFIC pages that changed, not the sitemap URL.
    const updatedUrls = updatedFilePaths.map(fp => `${SITE_URL.replace(/\/$/, '')}${toUrl(fp)}`);
    await submitToIndexNow(SITE_URL, updatedUrls);
  } else {
    console.log('There are no articles that need to be updated.');
  }
})().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
