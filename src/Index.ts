import DocBuilder from './docBuilder/DocBuilder';

console.log('BUILDING BRRRR');

const builder = new DocBuilder('./docs');
builder.buildDocs('./md');
builder.createIndexPage();
